# PRITHVI-SHIELD — NER Control Hub

**PRITHVI-SHIELD** is a production-grade, AI-powered landslide early warning and disaster monitoring platform designed specifically for the North Eastern Region (NER) of India (Assam, Meghalaya, Mizoram, Manipur, Nagaland, Tripura, Sikkim, and Arunachal Pradesh).

---

## 🗺️ Key Features
- **Real-Time 2D/3D Geospatial Map:** Displays active risk zones, road blockages, landslide hotspots, and pulsing IoT sensor nodes. Powered by Mapbox GL JS 3D (with vector and terrain-RGB elevation layers) with an interactive SVG vector fallback for offline validation.
- **AI/ML Risk Engine:** Computes risk severity using static susceptibility indices (derived from NASA SRTM DEM slope/aspect models, lithology class, soil structure, and proximity to roads/drainage), dynamic antecedent precipitation index (intensity-duration thresholds over 24h, 72h, and 7-day windows), and satellite CNN/U-Net change-detection flags (Sentinel-1 SAR coherence and Sentinel-2 NDVI drop indices).
- **Automated Alerts & Telemetry:** Multi-lingual warnings (auto-translated via Bhashini mission to Assamese, Bodo, Khasi, Mizo, Manipuri, Nagamese) dispatched via SMS gateways (Twilio/MSG91) and WebSockets.
- **PWA & Offline-First Ingestion:** Service worker asset caches and IndexedDB queues. Reports created offline are queued locally and synchronized automatically once network connectivity is restored.

---

## 📁 Repository Structure
```
/PRITHVI-SHIELD
  ├── docker-compose.yml      # Orchestrates all platform services
  ├── backend/                # Node.js Core Express + TS API & websocket gateway
  │     ├── src/db/schema.sql # Database DDL migrations
  │     ├── src/db/seed.sql   # Boundary and default sensor seed data
  │     └── src/jobs/cron.ts  # Background telemetry simulator & ML triggers
  ├── ml-service/             # Python FastAPI ML microservice
  │     ├── main.py           # Endpoint definitions (fused profiling, retraining)
  │     └── models/           # Susceptibility, trigger, and satellite scripts
  ├── frontend/               # React + Vite + TS + Tailwind + Mapbox GL JS web client
  │     ├── src/App.tsx       # WebSocket handlers and state binding
  │     ├── src/i18n.ts       # Language dictionaries for regional translation
  │     └── src/utils/        # IndexedDB offline reporting managers
  └── docs/
        └── .env.example      # Detailed credentials template
```

---

## 🛠️ Installation & Launch

### Prerequisites
Make sure you have:
- Node.js (v18+)
- Python (3.10+)
- Docker Desktop

---

### Option A: Complete Docker Compose Run (Recommended)
This command spins up the database, cache, backend, ML service, and frontend in containerized environments:

1. Clone or navigate to the workspace root:
   ```bash
   cd "D:\HACKATHON SHIV"
   ```
2. Build and launch all services:
   ```bash
   docker-compose up --build
   ```
3. Open `http://localhost:3000` to access the control hub.

---

### Option B: Local Developer Running (Faster Iteration)
To run services on your host machine:

#### 1. Setup the Database (PostGIS + TimescaleDB) & Redis
Use Docker to spin up database layers:
```bash
docker-compose up -d db redis
```

#### 2. Run the AI/ML Microservice
```bash
cd ml-service
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
python main.py
```
*Microservice will run on `http://localhost:8000`.*

#### 3. Run the Node.js API Backend
```bash
cd backend
npm install
# Startup dev server
npm run dev
```
*Backend will run on `http://localhost:5000` and automatically verify, apply migrations (`schema.sql`), and load data (`seed.sql`).*

#### 4. Run the React Web Dashboard
```bash
cd frontend
npm install
npm run dev
```
*Frontend hot dev server will boot on `http://localhost:3000`.*

---

---

## ⚡ Standalone vs Full-Stack Execution Mode

### Is the Backend Server Required for Demo?
**No! The frontend application is designed to run 100% STANDALONE.**
If you only run `cd frontend && npm run dev`, the app operates with full client-side state, Open-Meteo weather API fetching, rules-based risk calculation (`calculateComputedRiskScore`), and browser IndexedDB offline report queueing.

### Recommended Full-Stack Execution (For Live Presentation):
To enable Pushbullet Android Push/SMS dispatch, Express REST endpoints, and Google Gemini AI location risk summaries:

1. **Start Express API Backend (Terminal 1)**:
   ```bash
   cd backend
   npm install
   npm run dev
   ```
   *Runs on `http://localhost:5000/`*

2. **Start Frontend Web Dashboard (Terminal 2)**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   *Runs on `http://localhost:3000/`*

---

## 🔑 How to Add a Google Gemini AI API Key (Optional)

If you want real Gemini LLM summaries generated for searched locations:
1. Get a free API key from [Google AI Studio](https://aistudio.google.com/).
2. Create a `.env` file inside the `backend/` folder:
   ```env
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   ```
3. Restart `backend` (`npm run dev`).
*Note: If no key is set, the system gracefully falls back to the transparent rule-based risk scoring engine with a clear UI notice.*

---

## 🧪 Testing Scenarios & Sandboxes
1. **Interactive Map Fallback:** If no Mapbox Key is present, the app renders an interactive vector map of the Northeast states, pulsing mock sensors, and plotting live incidents.
2. **PWA Offline Sync:**
   - Open browser DevTools, switch Network to **Offline**.
   - Navigate to the **Situation Reports** tab, scroll to the PWA Citizen Sandbox, and submit a report.
   - You will see a warning stating "Report saved to local queue".
   - Turn Network back to **Online**.
   - The queue will trigger an automatic background upload, which clears IndexedDB and posts the report to the server.
3. **Role-Based Workflows:** Use the role dropdown in the top bar to switch between `Citizen`, `Field Officer`, and `SDMA Super Admin` to test workflow privileges.
