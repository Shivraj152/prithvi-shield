-- Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- TimescaleDB extension is usually loaded by default in timescale image, but we make sure it's enabled
CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(50) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'Citizen', -- 'Citizen', 'Field Officer', 'District Admin', 'SDMA Super Admin'
    preferred_language VARCHAR(10) NOT NULL DEFAULT 'en', -- 'en', 'as', 'br', 'kha', 'mz', 'mni', 'nag'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Districts Table
CREATE TABLE IF NOT EXISTS districts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    state VARCHAR(100) NOT NULL, -- e.g. 'Meghalaya', 'Assam'
    boundary GEOMETRY(Polygon, 4326),
    risk_level VARCHAR(50) NOT NULL DEFAULT 'Low', -- 'Very Low', 'Low', 'Moderate', 'High', 'Very High'
    last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Spatial index for district boundary
CREATE INDEX IF NOT EXISTS idx_districts_boundary ON districts USING GIST (boundary);

-- 3. Risk Zones Table
CREATE TABLE IF NOT EXISTS risk_zones (
    id SERIAL PRIMARY KEY,
    district_id INTEGER REFERENCES districts(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    geom GEOMETRY(Polygon, 4326) NOT NULL,
    susceptibility_score DOUBLE PRECISION DEFAULT 0.0, -- Static index (0-100)
    dynamic_risk_score DOUBLE PRECISION DEFAULT 0.0,   -- Weather trigger (0-100)
    overall_risk_score DOUBLE PRECISION DEFAULT 0.0,   -- Fused score (0-100)
    overall_risk_level VARCHAR(50) NOT NULL DEFAULT 'Very Low', -- 'Very Low', 'Low', 'Moderate', 'High', 'Very High'
    last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Spatial index for risk zones
CREATE INDEX IF NOT EXISTS idx_risk_zones_geom ON risk_zones USING GIST (geom);

-- 4. Sensors Table
CREATE TABLE IF NOT EXISTS sensors (
    id SERIAL PRIMARY KEY,
    zone_id INTEGER REFERENCES risk_zones(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'soil_moisture', 'tiltmeter', 'raingauge'
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'offline', 'warning'
    location GEOMETRY(Point, 4326) NOT NULL,
    battery_level DOUBLE PRECISION DEFAULT 100.0,
    signal_strength DOUBLE PRECISION DEFAULT 100.0,
    last_reading_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_sensors_location ON sensors USING GIST (location);

-- 5. Sensor Readings (Time-series)
CREATE TABLE IF NOT EXISTS sensor_readings (
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    sensor_id INTEGER NOT NULL,
    value_1 DOUBLE PRECISION, -- soil moisture %, or roll angle, or rainfall in mm
    value_2 DOUBLE PRECISION, -- pitch angle, etc.
    value_3 DOUBLE PRECISION  -- battery or extra
);

-- Convert to Hypertable for TimescaleDB
SELECT create_hypertable('sensor_readings', 'timestamp', if_not_exists => TRUE);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_sensor_time ON sensor_readings (sensor_id, timestamp DESC);

-- 6. Incidents Table
CREATE TABLE IF NOT EXISTS incidents (
    id SERIAL PRIMARY KEY,
    reporter_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(100) NOT NULL, -- 'landslide', 'rockfall', 'mudslide', 'road-block'
    status VARCHAR(50) NOT NULL DEFAULT 'Reported', -- 'Reported', 'Verified', 'Response Dispatched', 'Resolved'
    location GEOMETRY(Point, 4326) NOT NULL,
    district_id INTEGER REFERENCES districts(id) ON DELETE SET NULL,
    photo_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_incidents_location ON incidents USING GIST (location);

-- 7. Citizen Reports Table (moderation queue)
CREATE TABLE IF NOT EXISTS citizen_reports (
    id SERIAL PRIMARY KEY,
    reporter_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending', -- 'Pending', 'Approved', 'Rejected'
    location GEOMETRY(Point, 4326) NOT NULL,
    photo_url VARCHAR(500),
    ai_classification_tags JSONB, -- e.g. {"crack_detected": true, "confidence": 0.92}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_citizen_reports_location ON citizen_reports USING GIST (location);

-- 8. Roads Table
CREATE TABLE IF NOT EXISTS roads (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100),
    geom GEOMETRY(LineString, 4326) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Open', -- 'Open', 'Partially Blocked', 'Fully Blocked'
    reopening_est TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_roads_geom ON roads USING GIST (geom);

-- 9. Alerts Table
CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    zone_id INTEGER REFERENCES risk_zones(id) ON DELETE SET NULL,
    title_en VARCHAR(255) NOT NULL,
    message_en TEXT NOT NULL,
    translations JSONB, -- {"as": "...", "br": "...", "kha": "...", "mz": "...", "mni": "...", "nag": "..."}
    severity VARCHAR(50) NOT NULL, -- 'Moderate', 'High', 'Very High'
    status VARCHAR(50) NOT NULL DEFAULT 'Draft', -- 'Draft', 'Dispatched'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    sent_by INTEGER REFERENCES users(id) ON DELETE SET NULL
);

-- 10. Alert Recipients Table
CREATE TABLE IF NOT EXISTS alert_recipients (
    id SERIAL PRIMARY KEY,
    alert_id INTEGER REFERENCES alerts(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    channel VARCHAR(50) NOT NULL, -- 'SMS', 'Push', 'IVR'
    status VARCHAR(50) NOT NULL DEFAULT 'sent', -- 'sent', 'delivered', 'failed'
    error_message TEXT,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Weather Snapshots (Time-series)
CREATE TABLE IF NOT EXISTS weather_snapshots (
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    district_id INTEGER REFERENCES districts(id) ON DELETE CASCADE,
    temperature DOUBLE PRECISION,
    humidity DOUBLE PRECISION,
    hourly_rainfall DOUBLE PRECISION,
    wind_speed DOUBLE PRECISION,
    status VARCHAR(100)
);

SELECT create_hypertable('weather_snapshots', 'timestamp', if_not_exists => TRUE);
CREATE INDEX IF NOT EXISTS idx_weather_snapshots_dist_time ON weather_snapshots (district_id, timestamp DESC);
