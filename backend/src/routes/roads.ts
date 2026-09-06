import { Router, Response } from 'express';
import { pool } from '../db/db';
import { authenticateToken, authorizeRoles, AuthenticatedRequest } from '../middleware/authMiddleware';

const router = Router();

// 1. GET ALL ROADS
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const query = `
      SELECT 
        id, 
        name, 
        code, 
        status, 
        reopening_est,
        ST_AsGeoJSON(geom)::json as geometry
      FROM roads
      ORDER BY id ASC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('[Get Roads] Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 2. UPDATE ROAD STATUS (Field Officer / District Admin / SDMA Super Admin only)
router.put('/:id', authenticateToken, authorizeRoles('Field Officer', 'District Admin', 'SDMA Super Admin'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const roadId = req.params.id;
  const { status, reopening_est } = req.body; // status: 'Open', 'Partially Blocked', 'Fully Blocked'

  if (!status) {
    res.status(400).json({ error: 'Status is required.' });
    return;
  }

  try {
    const query = `
      UPDATE roads
      SET status = $1, reopening_est = $2
      WHERE id = $3
      RETURNING id, name, code, status, reopening_est
    `;
    const values = [status, reopening_est || null, roadId];
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Road segment not found.' });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('[Update Road Status] Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
