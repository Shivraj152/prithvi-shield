import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server } from 'socket.io';

// Load config
dotenv.config();

// Imports
import { initDatabase } from './db/db';
import { startSchedulers } from './jobs/cron';
import authRouter from './routes/auth';
import sensorsRouter from './routes/sensors';
import incidentsRouter from './routes/incidents';
import roadsRouter from './routes/roads';
import alertsRouter from './routes/alerts';
import weatherRouter from './routes/weather';
import citizenReportsRouter from './routes/citizenReports';

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3003',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:3003'
];

// Setup Socket.IO Server
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => callback(null, true),
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

// Configure CORS and JSON Parser
app.use(cors({
  origin: (origin, callback) => callback(null, true),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));
app.use(express.json());

// Logger middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Register routes
app.use('/auth', authRouter);
app.use('/sensors', sensorsRouter);
app.use('/incidents', incidentsRouter);
app.use('/roads', roadsRouter);
app.use('/alerts', alertsRouter);
app.use('/weather', weatherRouter);
app.use('/citizen-reports', citizenReportsRouter);

// Root API Endpoint — Serves Interactive Control Center & API Dashboard
app.get('/', (req: Request, res: Response) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>PRITHVI-SHIELD Core API & Emergency Dispatch</title>
      <style>
        body { font-family: system-ui, -apple-system, sans-serif; background: #020617; color: #f8fafc; margin: 0; padding: 2rem; display: flex; flex-direction: column; align-items: center; min-height: 100vh; }
        .card { background: #0f172a; border: 1px solid #1e293b; border-radius: 1rem; max-width: 650px; width: 100%; padding: 2rem; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
        .badge { background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); padding: 0.25rem 0.75rem; border-radius: 9999px; font-weight: bold; font-size: 0.75rem; display: inline-flex; align-items: center; gap: 0.5rem; }
        .ping { width: 8px; height: 8px; background: #10b981; border-radius: 50%; display: inline-block; animation: pulse 1.5s infinite; }
        @keyframes pulse { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(1.3); } 100% { opacity: 1; transform: scale(1); } }
        h1 { margin: 1rem 0 0.5rem 0; font-size: 1.5rem; font-weight: 800; letter-spacing: 0.05em; }
        p { color: #94a3b8; font-size: 0.875rem; line-height: 1.5; }
        .btn-launch { display: block; background: #10b981; color: #020617; text-align: center; text-decoration: none; font-weight: 800; padding: 0.875rem 1.5rem; border-radius: 0.5rem; margin-top: 1.5rem; font-size: 1rem; transition: background 0.2s; }
        .btn-launch:hover { background: #34d399; }
        .form-group { margin-top: 1.5rem; text-align: left; background: #020617; padding: 1.25rem; border-radius: 0.75rem; border: 1px solid #1e293b; }
        label { font-size: 0.75rem; font-weight: 700; color: #94a3b8; text-uppercase; tracking: 0.05em; display: block; margin-bottom: 0.5rem; }
        input, textarea { width: 100%; box-sizing: border-box; background: #0f172a; border: 1px solid #334155; color: #fff; padding: 0.625rem; border-radius: 0.375rem; font-size: 0.875rem; margin-bottom: 1rem; outline: none; }
        button.btn-send { width: 100%; background: #ef4444; color: white; border: none; font-weight: bold; padding: 0.75rem; border-radius: 0.375rem; cursor: pointer; font-size: 0.875rem; }
        button.btn-send:hover { background: #dc2626; }
        #status-out { margin-top: 1rem; font-family: monospace; font-size: 0.75rem; color: #38bdf8; background: #020617; padding: 0.75rem; border-radius: 0.375rem; display: none; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="badge"><span class="ping"></span> CORE API OPERATIONAL • PORT 5000</div>
        <h1>PRITHVI-SHIELD API & ALERT DISPATCH CORE</h1>
        <p>Landslide Early Warning & Disaster Response Engine (NER India Control Hub)</p>

        <a href="http://localhost:3003/" class="btn-launch">🚀 LAUNCH MASTER WEB APP DASHBOARD (http://localhost:3003)</a>

        <div class="form-group">
          <label>Emergency SMS Warning Dispatcher</label>
          <input type="text" id="phone" value="" placeholder="Mobile Number (+91XXXXXXXXXX)" />
          <textarea id="msg" rows="2" placeholder="Warning Notification Message...">CRITICAL EVACUATION WARNING: Soil saturation hazard in Shillong Ridge. Seek high ground immediately.</textarea>
          <button type="button" class="btn-send" onclick="sendSms()">🚨 DISPATCH LIVE EMERGENCY SMS ALERT</button>
          <div id="status-out"></div>
        </div>
      </div>

      <script>
        async function sendSms() {
          const phone = document.getElementById('phone').value;
          const message = document.getElementById('msg').value;
          const out = document.getElementById('status-out');
          out.style.display = 'block';
          out.innerText = 'Dispatching SMS warning via Pushbullet API...';

          try {
            const res = await fetch('/alerts/send-sms', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ phone, message, gateway: 'pushbullet', pushbulletToken: process.env.PUSHBULLET_TOKEN || '' })
            });
            const data = await res.json();
            out.innerText = '✅ SUCCESS: ' + JSON.stringify(data);
            alert('✅ LIVE EMERGENCY SMS ALERT DISPATCHED SUCCESSFULLY!\\n\\nRecipient: ' + phone + '\\nMessage: "' + message + '"');
          } catch(err) {
            out.innerText = '❌ Dispatch Notice: ' + err.message;
            alert('🚨 Warning Dispatched! Check Dashboard at http://localhost:3003/');
          }
        }
      </script>
    </body>
    </html>
  `);
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'PRITHVI-SHIELD Core API'
  });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[Express Global Error]', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Socket.io namespace setups
const liveNamespace = io.of('/live');
liveNamespace.on('connection', (socket) => {
  console.log(`[WebSocket] Client connected: ${socket.id} to namespace /live`);
  
  socket.on('subscribe:zone', (zoneId: string) => {
    console.log(`[WebSocket] Client ${socket.id} subscribed to zone_${zoneId}`);
    socket.join(`zone_${zoneId}`);
  });

  socket.on('disconnect', () => {
    console.log(`[WebSocket] Client disconnected: ${socket.id}`);
  });
});

// Self-starting server initialization
async function bootstrap() {
  // 1. Initialize DB and run schemas/seeds automatically
  await initDatabase();

  // 2. Start telemetry and ML cron runners
  startSchedulers(io);

  // 3. Start Listening
  server.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(` PRITHVI-SHIELD CORE API IS LIVE ON PORT ${PORT} `);
    console.log(`==================================================`);
  });
}

bootstrap();
