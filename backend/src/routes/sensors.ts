import { Router, Response } from 'express';
import { pool } from '../db/db';
import { authenticateToken, authorizeRoles, AuthenticatedRequest } from '../middleware/authMiddleware';

const router = Router();

// 1. GET ALL SENSORS
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const query = `
      SELECT 
        id, 
        zone_id, 
        name, 
        type, 
        status, 
        battery_level, 
        signal_strength, 
        last_reading_at,
        ST_X(location)::double precision as longitude, 
        ST_Y(location)::double precision as latitude 
      FROM sensors
      ORDER BY name ASC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('[Get Sensors] Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 2. GET SENSOR READINGS (HISTORICAL)
router.get('/:id/readings', async (req: AuthenticatedRequest, res: Response) => {
  const sensorId = req.params.id;
  const limit = parseInt(req.query.limit as string || '100');

  try {
    const query = `
      SELECT 
        timestamp, 
        value_1 as soil_moisture_or_rain, 
        value_2 as tilt_roll, 
        value_3 as tilt_pitch
      FROM sensor_readings
      WHERE sensor_id = $1
      ORDER BY timestamp DESC
      LIMIT $2
    `;
    const result = await pool.query(query, [sensorId, limit]);
    res.json(result.rows.reverse()); // Return in chronological order
  } catch (error) {
    console.error('[Get Sensor Readings] Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 3. POST NEW SENSOR (Officer/Admin only)
router.post('/', authenticateToken, authorizeRoles('Field Officer', 'District Admin', 'SDMA Super Admin'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { zone_id, name, type, status, longitude, latitude, battery_level, signal_strength } = req.body;

  if (!name || !type || longitude === undefined || latitude === undefined) {
    res.status(400).json({ error: 'Name, Type, Longitude, and Latitude are required.' });
    return;
  }

  try {
    const query = `
      INSERT INTO sensors (zone_id, name, type, status, location, battery_level, signal_strength, last_reading_at)
      VALUES ($1, $2, $3, $4, ST_SetSRID(ST_MakePoint($5, $6), 4326), $7, $8, NOW())
      RETURNING id, name, type, status, battery_level, signal_strength, last_reading_at, ST_X(location)::double precision as longitude, ST_Y(location)::double precision as latitude
    `;
    const values = [
      zone_id || null, 
      name, 
      type, 
      status || 'active', 
      longitude, 
      latitude, 
      battery_level || 100.0, 
      signal_strength || 100.0
    ];

    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('[Create Sensor] Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 4. POST NEW READING (IoT Ingestion / Simulator)
router.post('/readings', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { sensor_id, value_1, value_2, value_3, timestamp } = req.body;

  if (sensor_id === undefined || value_1 === undefined) {
    res.status(400).json({ error: 'Sensor ID and reading value_1 are required.' });
    return;
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Insert reading into TimescaleDB hypertable
    const insertQuery = `
      INSERT INTO sensor_readings (timestamp, sensor_id, value_1, value_2, value_3)
      VALUES ($1, $2, $3, $4, $5)
    `;
    const insertValues = [
      timestamp ? new Date(timestamp) : new Date(), 
      sensor_id, 
      value_1, 
      value_2 || null, 
      value_3 || null
    ];
    await client.query(insertQuery, insertValues);

    // 2. Update sensor battery, signal, last_reading_at
    const updateSensorQuery = `
      UPDATE sensors
      SET last_reading_at = $1
      WHERE id = $2
    `;
    await client.query(updateSensorQuery, [insertValues[0], sensor_id]);

    await client.query('COMMIT');
    res.status(201).json({ message: 'Telemetry logged successfully.' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[Ingest Sensor Telemetry] Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    client.release();
  }
});

export default router;
