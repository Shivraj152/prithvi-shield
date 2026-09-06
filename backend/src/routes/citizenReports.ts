import { Router, Response } from 'express';
import axios from 'axios';
import { pool } from '../db/db';
import { authenticateToken, authorizeRoles, AuthenticatedRequest } from '../middleware/authMiddleware';

const router = Router();
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

// 1. GET ALL CROWDSOURCED REPORTS (Moderation Queue)
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const query = `
      SELECT 
        c.id,
        c.reporter_id,
        c.description,
        c.status,
        c.photo_url,
        c.ai_classification_tags,
        c.created_at,
        u.email as reporter_email,
        ST_X(c.location)::double precision as longitude, 
        ST_Y(c.location)::double precision as latitude 
      FROM citizen_reports c
      LEFT JOIN users u ON c.reporter_id = u.id
      ORDER BY c.created_at DESC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('[Get Citizen Reports] Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 2. SUBMIT CITIZEN REPORT (Offline cache compatible)
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { description, longitude, latitude, photo_url } = req.body;
  const reporterId = req.user?.id;

  if (longitude === undefined || latitude === undefined) {
    res.status(400).json({ error: 'Longitude and Latitude are required.' });
    return;
  }

  try {
    // Simulate AI pre-screening (Image Classification)
    // Checks keywords in description to simulate classification
    const descLower = (description || '').toLowerCase();
    let crack = false;
    let boulder = false;
    let blockage = false;
    let confidence = 0.65;

    if (descLower.includes('crack') || descLower.includes('split') || descLower.includes('break')) {
      crack = true;
      confidence = 0.89;
    }
    if (descLower.includes('rock') || descLower.includes('stone') || descLower.includes('boulder')) {
      boulder = true;
      confidence = 0.92;
    }
    if (descLower.includes('block') || descLower.includes('close') || descLower.includes('road')) {
      blockage = true;
      confidence = 0.85;
    }

    const aiTags = {
      crack_detected: crack,
      boulder_fall: boulder,
      road_blockage: blockage,
      confidence: confidence
    };

    const query = `
      INSERT INTO citizen_reports (reporter_id, description, status, location, photo_url, ai_classification_tags)
      VALUES ($1, $2, 'Pending', ST_SetSRID(ST_MakePoint($3, $4), 4326), $5, $6)
      RETURNING id, description, status, photo_url, ai_classification_tags, created_at, ST_X(location)::double precision as longitude, ST_Y(location)::double precision as latitude
    `;
    const values = [reporterId || null, description || null, longitude, latitude, photo_url || null, JSON.stringify(aiTags)];
    const result = await pool.query(query, values);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('[Submit Citizen Report] Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 3. APPROVE/REJECT REPORT (Field Officer / District Admin / SDMA Super Admin only)
// If approved, transforms report into verified incident and pings FastAPI for model retraining
router.put('/:id/verify', authenticateToken, authorizeRoles('Field Officer', 'District Admin', 'SDMA Super Admin'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const reportId = req.params.id;
  const { action } = req.body; // 'Approved' or 'Rejected'

  if (action !== 'Approved' && action !== 'Rejected') {
    res.status(400).json({ error: 'Invalid verification action. Must be Approved or Rejected.' });
    return;
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Update citizen report status
    const updateReportQuery = `
      UPDATE citizen_reports
      SET status = $1
      WHERE id = $2
      RETURNING id, reporter_id, description, photo_url, ST_X(location)::double precision as longitude, ST_Y(location)::double precision as latitude
    `;
    const reportRes = await client.query(updateReportQuery, [action, reportId]);

    if (reportRes.rows.length === 0) {
      res.status(404).json({ error: 'Citizen report not found.' });
      client.release();
      return;
    }

    const report = reportRes.rows[0];

    if (action === 'Approved') {
      // 2. Resolve District ID automatically using spatial check
      const findDistrictQuery = `
        SELECT id FROM districts 
        WHERE ST_Contains(boundary, ST_SetSRID(ST_MakePoint($1, $2), 4326))
        LIMIT 1
      `;
      const districtRes = await client.query(findDistrictQuery, [report.longitude, report.latitude]);
      const districtId = districtRes.rows.length > 0 ? districtRes.rows[0].id : null;

      // 3. Insert into incidents table
      const insertIncidentQuery = `
        INSERT INTO incidents (reporter_id, title, description, type, location, district_id, photo_url, status)
        VALUES ($1, $2, $3, 'landslide', ST_SetSRID(ST_MakePoint($4, $5), 4326), $6, $7, 'Verified')
        RETURNING id
      `;
      const incidentTitle = `Citizen Verified: Landslide at (${report.longitude.toFixed(4)}, ${report.latitude.toFixed(4)})`;
      await client.query(insertIncidentQuery, [
        report.reporter_id,
        incidentTitle,
        report.description || 'Verified via citizen reports pipeline.',
        report.longitude,
        report.latitude,
        districtId,
        report.photo_url
      ]);

      // 4. Trigger ML Model Retraining asynchronously (pings FastAPI endpoint)
      try {
        console.log(`[ML Retraining Trigger] Pinging FastAPI to append coordinates: (${report.latitude}, ${report.longitude})`);
        const retrainPayload = {
          training_data: [
            {
              latitude: report.latitude,
              longitude: report.longitude,
              is_landslide: true,
              trigger_rainfall_24h: 120.0, // simulated parameter
              slope_angle: 32.5 // simulated parameter
            }
          ]
        };
        // Run trigger in background, don't block response
        axios.post(`${ML_SERVICE_URL}/model/retrain`, retrainPayload)
          .then(mlRes => console.log('[ML Retraining Response]', mlRes.data))
          .catch(mlErr => console.error('[ML Retraining Error]', mlErr.message));
      } catch (err: any) {
        console.error('[ML Retrain Request Error]', err.message);
      }
    }

    await client.query('COMMIT');
    res.json({ message: `Citizen report successfully ${action.toLowerCase()}.` });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[Verify Citizen Report] Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    client.release();
  }
});

export default router;
