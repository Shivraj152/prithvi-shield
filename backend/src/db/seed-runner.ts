import { initDatabase, pool } from './db';

async function run() {
  console.log('[Seed Runner] Manual database migration and seed requested...');
  try {
    await initDatabase();
    console.log('[Seed Runner] Database migrations and seeding completed successfully.');
  } catch (error) {
    console.error('[Seed Runner] Failure:', error);
  } finally {
    await pool.end();
    console.log('[Seed Runner] Connections closed.');
  }
}

run();
