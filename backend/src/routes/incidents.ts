import { Router, Response } from 'express';
import { pool } from '../db/db';
import { authenticateToken, authorizeRoles, AuthenticatedRequest } from '../middleware/authMiddleware';

const router = Router();

// 1. GET ALL INCIDENTS
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const query = `
      SELECT 
        i.id,
        i.reporter_id,
        i.title,
        i.description,
        i.type,
        i.status,
        i.photo_url,
        i.created_at,
        i.resolved_at,
        d.name as district_name,
        u.email as reporter_email,
        ST_X(i.location)::double precision as longitude, 
        ST_Y(i.location)::double precision as latitude 
      FROM incidents i
      LEFT JOIN districts d ON i.district_id = d.id
      LEFT JOIN users u ON i.reporter_id = u.id
      ORDER BY i.created_at DESC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('[Get Incidents] Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 2. REPORT INCIDENT (Authenticated or public with mock reporter)
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { title, description, type, longitude, latitude, photo_url } = req.body;
  const reporterId = req.user?.id;

  if (!title || !type || longitude === undefined || latitude === undefined) {
    res.status(400).json({ error: 'Title, Type, Longitude, and Latitude are required.' });
    return;
  }

  try {
    // Spatial query to automatically map coordinate to District
    const findDistrictQuery = `
      SELECT id FROM districts 
      WHERE ST_Contains(boundary, ST_SetSRID(ST_MakePoint($1, $2), 4326))
      LIMIT 1
    `;
    const districtRes = await pool.query(findDistrictQuery, [longitude, latitude]);
    const districtId = districtRes.rows.length > 0 ? districtRes.rows[0].id : null;

    const query = `
      INSERT INTO incidents (reporter_id, title, description, type, location, district_id, photo_url)
      VALUES ($1, $2, $3, $4, ST_SetSRID(ST_MakePoint($5, $6), 4326), $7, $8)
      RETURNING id, title, description, type, status, photo_url, created_at, ST_X(location)::double precision as longitude, ST_Y(location)::double precision as latitude
    `;
    const values = [reporterId || null, title, description || null, type, longitude, latitude, districtId, photo_url || null];
    const result = await pool.query(query, values);
    
    res.status(201).json({
      ...result.rows[0],
      district_id: districtId
    });
  } catch (error) {
    console.error('[Create Incident] Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 3. UPDATE INCIDENT STATUS (Field Officer / District Admin / SDMA Super Admin only)
router.put('/:id', authenticateToken, authorizeRoles('Field Officer', 'District Admin', 'SDMA Super Admin'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const incidentId = req.params.id;
  const { status } = req.body; // 'Reported', 'Verified', 'Response Dispatched', 'Resolved'

  if (!status) {
    res.status(400).json({ error: 'Status is required.' });
    return;
  }

  try {
    const resolvedAt = status === 'Resolved' ? 'NOW()' : 'NULL';
    const query = `
      UPDATE incidents
      SET status = $1, resolved_at = ${resolvedAt}
      WHERE id = $2
      RETURNING id, title, status, resolved_at
    `;
    const result = await pool.query(query, [status, incidentId]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Incident not found.' });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('[Update Incident Status] Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
