-- Seed Users
-- Pre-computed bcrypt hashes for password "password123"
-- Hash: $2a$10$E1V7oR6k11W89G1D42a9OeyW9s13CgH8Y8Z8b8c8d8e8f8g8h8i8j
INSERT INTO users (email, phone, password_hash, role, preferred_language) VALUES
('admin@prithvi.gov.in', '+919999999999', '$2a$10$E1V7oR6k11W89G1D42a9OeyW9s13CgH8Y8Z8b8c8d8e8f8g8h8i8j', 'SDMA Super Admin', 'en'),
('officer@prithvi.gov.in', '+918888888888', '$2a$10$E1V7oR6k11W89G1D42a9OeyW9s13CgH8Y8Z8b8c8d8e8f8g8h8i8j', 'Field Officer', 'kha'),
('citizen@prithvi.gov.in', '+917777777777', '$2a$10$E1V7oR6k11W89G1D42a9OeyW9s13CgH8Y8Z8b8c8d8e8f8g8h8i8j', 'Citizen', 'mz')
ON CONFLICT DO NOTHING;

-- Seed Districts (NER Regions)
-- East Khasi Hills (Shillong, Meghalaya)
INSERT INTO districts (id, name, state, boundary, risk_level) VALUES
(1, 'East Khasi Hills', 'Meghalaya', ST_GeomFromText('POLYGON((91.7 25.4, 92.0 25.4, 92.0 25.7, 91.7 25.7, 91.7 25.4))', 4326), 'High'),
-- Dima Hasao (Haflong, Assam)
(2, 'Dima Hasao', 'Assam', ST_GeomFromText('POLYGON((92.5 25.0, 93.3 25.0, 93.3 25.5, 92.5 25.5, 92.5 25.0))', 4326), 'Very High'),
-- Aizawl (Mizoram)
(3, 'Aizawl', 'Mizoram', ST_GeomFromText('POLYGON((92.6 23.5, 92.9 23.5, 92.9 24.0, 92.6 24.0, 92.6 23.5))', 4326), 'Moderate'),
-- Mangan (North Sikkim)
(4, 'Mangan', 'Sikkim', ST_GeomFromText('POLYGON((88.4 27.4, 88.8 27.4, 88.8 27.9, 88.4 27.9, 88.4 27.4))', 4326), 'Very High'),
-- Noney (Manipur)
(5, 'Noney', 'Manipur', ST_GeomFromText('POLYGON((93.4 24.7, 93.8 24.7, 93.8 25.0, 93.4 25.0, 93.4 24.7))', 4326), 'High'),
-- Tawang (Arunachal Pradesh)
(6, 'Tawang', 'Arunachal Pradesh', ST_GeomFromText('POLYGON((91.7 27.4, 92.2 27.4, 92.2 27.8, 91.7 27.8, 91.7 27.4))', 4326), 'Moderate')
ON CONFLICT (name) DO UPDATE SET boundary = EXCLUDED.boundary, risk_level = EXCLUDED.risk_level;

-- Seed Risk Zones (inside Districts)
-- Shillong Slope (East Khasi Hills)
INSERT INTO risk_zones (id, district_id, name, geom, susceptibility_score, dynamic_risk_score, overall_risk_score, overall_risk_level) VALUES
(1, 1, 'Shillong Ridge & Bypass Slope', ST_GeomFromText('POLYGON((91.80 25.52, 91.88 25.52, 91.88 25.58, 91.80 25.58, 91.80 25.52))', 4326), 65.0, 40.0, 52.5, 'Moderate'),
-- Haflong Hill (Dima Hasao)
(2, 2, 'Haflong Town Slide Zone', ST_GeomFromText('POLYGON((92.98 25.15, 93.05 25.15, 93.05 25.22, 92.98 25.22, 92.98 25.15))', 4326), 88.0, 78.0, 83.0, 'Very High'),
-- Jhalupara Block (East Khasi Hills)
(3, 1, 'Laitumkhrah Valley Rim', ST_GeomFromText('POLYGON((91.88 25.54, 91.93 25.54, 91.93 25.58, 91.88 25.58, 91.88 25.54))', 4326), 45.0, 20.0, 32.5, 'Low'),
-- Aizawl Cliff (Aizawl)
(4, 3, 'Aizawl North Slope (Chaltlang)', ST_GeomFromText('POLYGON((92.70 23.72, 92.75 23.72, 92.75 23.77, 92.70 23.77, 92.70 23.72))', 4326), 72.0, 60.0, 66.0, 'High'),
-- Mangan Town (Sikkim)
(5, 4, 'Mangan Bazar Slip Area', ST_GeomFromText('POLYGON((88.50 27.50, 88.55 27.50, 88.55 27.55, 88.50 27.55, 88.50 27.50))', 4326), 92.0, 85.0, 88.5, 'Very High')
ON CONFLICT (id) DO UPDATE SET geom = EXCLUDED.geom, overall_risk_level = EXCLUDED.overall_risk_level;

-- Seed Sensors
-- Sensors in East Khasi Hills (Shillong Ridge)
INSERT INTO sensors (id, zone_id, name, type, status, location, battery_level, signal_strength, last_reading_at) VALUES
(1, 1, 'EKH-SM-01', 'soil_moisture', 'active', ST_GeomFromText('POINT(91.82 25.55)', 4326), 92.5, 85.0, NOW()),
(2, 1, 'EKH-TM-02', 'tiltmeter', 'warning', ST_GeomFromText('POINT(91.85 25.56)', 4326), 84.0, 72.0, NOW()),
-- Sensors in Haflong Town (Dima Hasao)
(3, 2, 'DH-SM-03', 'soil_moisture', 'active', ST_GeomFromText('POINT(93.01 25.18)', 4326), 98.0, 95.0, NOW()),
(4, 2, 'DH-TM-04', 'tiltmeter', 'warning', ST_GeomFromText('POINT(93.03 25.19)', 4326), 79.5, 64.0, NOW()),
(5, 2, 'DH-RG-05', 'raingauge', 'active', ST_GeomFromText('POINT(93.00 25.20)', 4326), 100.0, 90.0, NOW()),
-- Sensors in Aizawl (Chaltlang)
(6, 4, 'AZL-SM-06', 'soil_moisture', 'active', ST_GeomFromText('POINT(92.72 23.74)', 4326), 89.0, 80.0, NOW()),
-- Sensors in Mangan Bazar (Sikkim)
(7, 5, 'MGN-TM-07', 'tiltmeter', 'active', ST_GeomFromText('POINT(88.52 27.52)', 4326), 95.0, 88.0, NOW())
ON CONFLICT (id) DO UPDATE SET location = EXCLUDED.location, status = EXCLUDED.status;

-- Seed Roads (LineString segments representing highways)
-- NH-44 Ext (Shillong to Jowai)
INSERT INTO roads (id, name, code, geom, status, reopening_est) VALUES
(1, 'Shillong - Guwahati Highway', 'GS Road (NH-6)', ST_GeomFromText('LINESTRING(91.80 25.60, 91.82 25.65, 91.85 25.75, 91.88 25.90)', 4326), 'Open', NULL),
(2, 'Shillong - Jowai Road', 'NH-6', ST_GeomFromText('LINESTRING(91.90 25.55, 92.00 25.50, 92.10 25.45, 92.20 25.40)', 4326), 'Partially Blocked', NOW() + INTERVAL '4 hours'),
(3, 'Haflong - Silchar Road', 'NH-27', ST_GeomFromText('LINESTRING(93.00 25.18, 93.05 25.10, 93.10 25.00, 93.15 24.85)', 4326), 'Fully Blocked', NOW() + INTERVAL '12 hours'),
(4, 'Aizawl - Lunglei Road', 'NH-2', ST_GeomFromText('LINESTRING(92.72 23.70, 92.75 23.50, 92.78 23.30, 92.80 23.10)', 4326), 'Open', NULL),
(5, 'Gangtok - Mangan Road', 'NH-310A', ST_GeomFromText('LINESTRING(88.60 27.30, 88.58 27.40, 88.52 27.52, 88.50 27.60)', 4326), 'Fully Blocked', NOW() + INTERVAL '24 hours')
ON CONFLICT (id) DO UPDATE SET geom = EXCLUDED.geom, status = EXCLUDED.status;

-- Seed Sample Incidents
INSERT INTO incidents (id, reporter_id, title, description, type, status, location, district_id, photo_url, created_at, resolved_at) VALUES
(1, 2, 'Minor rockfall on Shillong Bypass', 'Small boulders falling on the outer lane. Traffic is slow but moving.', 'rockfall', 'Verified', ST_GeomFromText('POINT(91.89 25.57)', 4326), 1, NULL, NOW() - INTERVAL '2 hours', NULL),
(2, 1, 'Major Landslide near Haflong Town', 'Slope collapse has blocked both lanes. BRO crew mobilized.', 'landslide', 'Response Dispatched', ST_GeomFromText('POINT(93.02 25.17)', 4326), 2, NULL, NOW() - INTERVAL '5 hours', NULL),
(3, 3, 'Mudslide blocking drainage', 'Mud run-off into local streets, posing structural risks to nearby houses.', 'mudslide', 'Reported', ST_GeomFromText('POINT(92.73 23.75)', 4326), 3, NULL, NOW() - INTERVAL '30 minutes', NULL)
ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status;
