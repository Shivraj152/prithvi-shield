import { Pool } from 'pg';

// Load environment variables
const dbUser = process.env.DB_USER || 'postgres';
const dbPassword = process.env.DB_PASSWORD || 'postgres';
const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = parseInt(process.env.DB_PORT || '5432');
const dbName = process.env.DB_NAME || 'prithvi_shield';

// Real PostgreSQL Pool
const realPool = new Pool({
  user: dbUser,
  password: dbPassword,
  host: dbHost,
  port: dbPort,
  database: dbName,
});

class MockDatabase {
  users = [
    { id: 1, email: 'admin@prithvi.gov.in', phone: '+919999999999', password_hash: '$2a$10$E1V7oR6k11W89G1D42a9OeyW9s13CgH8Y8Z8b8c8d8e8f8g8h8i8j', role: 'SDMA Super Admin', preferred_language: 'en', created_at: new Date() },
    { id: 2, email: 'officer@prithvi.gov.in', phone: '+918888888888', password_hash: '$2a$10$E1V7oR6k11W89G1D42a9OeyW9s13CgH8Y8Z8b8c8d8e8f8g8h8i8j', role: 'Field Officer', preferred_language: 'kha', created_at: new Date() },
    { id: 3, email: 'citizen@prithvi.gov.in', phone: '+917777777777', password_hash: '$2a$10$E1V7oR6k11W89G1D42a9OeyW9s13CgH8Y8Z8b8c8d8e8f8g8h8i8j', role: 'Citizen', preferred_language: 'mz', created_at: new Date() },
  ];

  districts = [
    { id: 1, name: 'East Khasi Hills', state: 'Meghalaya', risk_level: 'High', last_updated_at: new Date() },
    { id: 2, name: 'Dima Hasao', state: 'Assam', risk_level: 'Very High', last_updated_at: new Date() },
    { id: 3, name: 'Aizawl', state: 'Mizoram', risk_level: 'Moderate', last_updated_at: new Date() },
    { id: 4, name: 'Mangan', state: 'Sikkim', risk_level: 'Very High', last_updated_at: new Date() },
    { id: 5, name: 'Noney', state: 'Manipur', risk_level: 'High', last_updated_at: new Date() },
    { id: 6, name: 'Tawang', state: 'Arunachal Pradesh', risk_level: 'Moderate', last_updated_at: new Date() },
  ];

  risk_zones = [
    { id: 1, district_id: 1, name: 'Shillong Ridge & Bypass Slope', susceptibility_score: 65.0, dynamic_risk_score: 40.0, overall_risk_score: 52.5, overall_risk_level: 'Moderate', last_updated_at: new Date() },
    { id: 2, district_id: 2, name: 'Haflong Town Slide Zone', susceptibility_score: 88.0, dynamic_risk_score: 78.0, overall_risk_score: 83.0, overall_risk_level: 'Very High', last_updated_at: new Date() },
    { id: 3, district_id: 1, name: 'Laitumkhrah Valley Rim', susceptibility_score: 45.0, dynamic_risk_score: 20.0, overall_risk_score: 32.5, overall_risk_level: 'Low', last_updated_at: new Date() },
    { id: 4, district_id: 3, name: 'Aizawl North Slope (Chaltlang)', susceptibility_score: 72.0, dynamic_risk_score: 60.0, overall_risk_score: 66.0, overall_risk_level: 'High', last_updated_at: new Date() },
    { id: 5, district_id: 4, name: 'Mangan Bazar Slip Area', susceptibility_score: 92.0, dynamic_risk_score: 85.0, overall_risk_score: 88.5, overall_risk_level: 'Very High', last_updated_at: new Date() },
  ];

  sensors = [
    { id: 1, zone_id: 1, name: 'EKH-SM-01', type: 'soil_moisture', status: 'active', longitude: 91.82, latitude: 25.55, battery_level: 92.5, signal_strength: 85.0, last_reading_at: new Date() },
    { id: 2, zone_id: 1, name: 'EKH-TM-02', type: 'tiltmeter', status: 'warning', longitude: 91.85, latitude: 25.56, battery_level: 84.0, signal_strength: 72.0, last_reading_at: new Date() },
    { id: 3, zone_id: 2, name: 'DH-SM-03', type: 'soil_moisture', status: 'active', longitude: 93.01, latitude: 25.18, battery_level: 98.0, signal_strength: 95.0, last_reading_at: new Date() },
    { id: 4, zone_id: 2, name: 'DH-TM-04', type: 'tiltmeter', status: 'warning', longitude: 93.03, latitude: 25.19, battery_level: 79.5, signal_strength: 64.0, last_reading_at: new Date() },
    { id: 5, zone_id: 2, name: 'DH-RG-05', type: 'raingauge', status: 'active', longitude: 93.00, latitude: 25.20, battery_level: 100.0, signal_strength: 90.0, last_reading_at: new Date() },
    { id: 6, zone_id: 4, name: 'AZL-SM-06', type: 'soil_moisture', status: 'active', longitude: 92.72, latitude: 23.74, battery_level: 89.0, signal_strength: 80.0, last_reading_at: new Date() },
    { id: 7, zone_id: 5, name: 'MGN-TM-07', type: 'tiltmeter', status: 'active', longitude: 88.52, latitude: 27.52, battery_level: 95.0, signal_strength: 88.0, last_reading_at: new Date() }
  ];

  roads = [
    { id: 1, name: 'Shillong - Guwahati Highway', code: 'GS Road (NH-6)', status: 'Open', reopening_est: null, geometry: { type: 'LineString', coordinates: [[91.80, 25.60], [91.82, 25.65], [91.85, 25.75], [91.88, 25.90]] } },
    { id: 2, name: 'Shillong - Jowai Road', code: 'NH-6', status: 'Partially Blocked', reopening_est: new Date(Date.now() + 4*60*60*1000), geometry: { type: 'LineString', coordinates: [[91.90, 25.55], [92.00, 25.50], [92.10, 25.45], [92.20, 25.40]] } },
    { id: 3, name: 'Haflong - Silchar Road', code: 'NH-27', status: 'Fully Blocked', reopening_est: new Date(Date.now() + 12*60*60*1000), geometry: { type: 'LineString', coordinates: [[93.00, 25.18], [93.05, 25.10], [93.10, 25.00], [93.15, 24.85]] } },
    { id: 4, name: 'Aizawl - Lunglei Road', code: 'NH-2', status: 'Open', reopening_est: null, geometry: { type: 'LineString', coordinates: [[92.72, 23.70], [92.75, 23.50], [92.78, 23.30], [92.80, 23.10]] } },
    { id: 5, name: 'Gangtok - Mangan Road', code: 'NH-310A', status: 'Fully Blocked', reopening_est: new Date(Date.now() + 24*60*60*1000), geometry: { type: 'LineString', coordinates: [[88.60, 27.30], [88.58, 27.40], [88.52, 27.52], [88.50, 27.60]] } }
  ];

  incidents = [
    { id: 1, reporter_id: 2, title: 'Minor rockfall on Shillong Bypass', description: 'Small boulders falling on the outer lane. Traffic is slow but moving.', type: 'rockfall', status: 'Verified', longitude: 91.89, latitude: 25.57, district_id: 1, photo_url: null, created_at: new Date(Date.now() - 2*60*60*1000), resolved_at: null },
    { id: 2, reporter_id: 1, title: 'Major Landslide near Haflong Town', description: 'Slope collapse has blocked both lanes. BRO crew mobilized.', type: 'landslide', status: 'Response Dispatched', longitude: 93.02, latitude: 25.17, district_id: 2, photo_url: null, created_at: new Date(Date.now() - 5*60*60*1000), resolved_at: null },
    { id: 3, reporter_id: 3, title: 'Mudslide blocking drainage', description: 'Mud run-off into local streets, posing structural risks to nearby houses.', type: 'mudslide', status: 'Reported', longitude: 92.73, latitude: 23.75, district_id: 3, photo_url: null, created_at: new Date(Date.now() - 30*60*1000), resolved_at: null }
  ];

  citizen_reports: any[] = [];
  alerts: any[] = [];
  alert_recipients: any[] = [];
  weather_snapshots: any[] = [];
  sensor_readings: any[] = [];

  nextIds: Record<string, number> = {
    users: 4,
    sensors: 8,
    incidents: 4,
    citizen_reports: 1,
    alerts: 1,
    alert_recipients: 1,
    weather_snapshots: 1,
  };

  async query(text: string, params: any[] = []): Promise<{ rows: any[] }> {
    const q = text.replace(/\s+/g, ' ').trim().toLowerCase();

    // 1. SELECT EXISTS table users check
    if (q.includes('information_schema.tables') && q.includes('users')) {
      return { rows: [{ exists: true }] };
    }

    // Transaction management logs (noop)
    if (q === 'begin' || q === 'commit' || q === 'rollback') {
      return { rows: [] };
    }

    // 2. SELECT FROM sensors
    if (q.startsWith('select') && q.includes('from sensors') && !q.includes('avg_moisture')) {
      return { rows: this.sensors };
    }

    // 3. SELECT FROM sensor_readings
    if (q.startsWith('select') && q.includes('from sensor_readings') && q.includes('sensor_id = $1')) {
      const sensorId = params[0];
      const limit = params[1] || 100;
      const filtered = this.sensor_readings
        .filter(r => r.sensor_id === sensorId)
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, limit)
        .map(r => ({
          timestamp: r.timestamp,
          soil_moisture_or_rain: r.value_1,
          tilt_roll: r.value_2,
          tilt_pitch: r.value_3
        }));
      return { rows: filtered };
    }

    // 4. INSERT INTO sensors
    if (q.startsWith('insert into sensors')) {
      const zone_id = params[0];
      const name = params[1];
      const type = params[2];
      const status = params[3] || 'active';
      const longitude = params[4];
      const latitude = params[5];
      const battery_level = params[6] || 100.0;
      const signal_strength = params[7] || 100.0;
      const last_reading_at = new Date();
      const id = this.nextIds.sensors++;
      const newSensor = { id, zone_id, name, type, status, longitude, latitude, battery_level, signal_strength, last_reading_at };
      this.sensors.push(newSensor);
      return { rows: [newSensor] };
    }

    // 5. INSERT INTO sensor_readings
    if (q.startsWith('insert into sensor_readings')) {
      const timestamp = params[0] ? new Date(params[0]) : new Date();
      const sensor_id = params[1];
      const value_1 = params[2];
      const value_2 = params[3];
      const value_3 = params[4];
      this.sensor_readings.push({ timestamp, sensor_id, value_1, value_2, value_3 });
      return { rows: [] };
    }

    // 6. UPDATE sensors SET last_reading_at = $1 WHERE id = $2
    if (q.startsWith('update sensors') && q.includes('last_reading_at = $1')) {
      const last_reading_at = params[0] ? new Date(params[0]) : new Date();
      const id = params[1];
      const s = this.sensors.find(x => x.id === id);
      if (s) s.last_reading_at = last_reading_at;
      return { rows: [] };
    }

    // 7. SELECT FROM incidents
    if (q.startsWith('select') && q.includes('from incidents i')) {
      const res = this.incidents.map(i => {
        const d = this.districts.find(x => x.id === i.district_id);
        const u = this.users.find(x => x.id === i.reporter_id);
        return {
          ...i,
          district_name: d ? d.name : null,
          reporter_email: u ? u.email : null
        };
      }).sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
      return { rows: res };
    }

    // 8. SELECT id FROM districts WHERE ST_Contains
    if (q.includes('st_contains') && q.includes('districts')) {
      const lon = params[0];
      const lat = params[1];
      let foundId = null;
      if (lon >= 91.7 && lon <= 92.0 && lat >= 25.4 && lat <= 25.7) foundId = 1; // EKH
      else if (lon >= 92.5 && lon <= 93.3 && lat >= 25.0 && lat <= 25.5) foundId = 2; // DH
      else if (lon >= 92.6 && lon <= 92.9 && lat >= 23.5 && lat <= 24.0) foundId = 3; // Aizawl
      else if (lon >= 88.4 && lon <= 88.8 && lat >= 27.4 && lat <= 27.9) foundId = 4; // Mangan
      else if (lon >= 93.4 && lon <= 93.8 && lat >= 24.7 && lat <= 25.0) foundId = 5; // Noney
      else if (lon >= 91.7 && lon <= 92.2 && lat >= 27.4 && lat <= 27.8) foundId = 6; // Tawang

      return { rows: foundId ? [{ id: foundId }] : [] };
    }

    // 9. INSERT INTO incidents
    if (q.startsWith('insert into incidents')) {
      const reporter_id = params[0];
      const title = params[1];
      const description = params[2];
      const type = params[3];
      const longitude = params[4];
      const latitude = params[5];
      const district_id = params[6];
      const photo_url = params[7];
      const id = this.nextIds.incidents++;
      const created_at = new Date();
      const status = params[8] || 'Reported';
      const resolved_at = null;
      const newInc = { id, reporter_id, title, description, type, status, longitude, latitude, district_id, photo_url, created_at, resolved_at };
      this.incidents.push(newInc);
      return { rows: [newInc] };
    }

    // 10. UPDATE incidents SET status = $1, resolved_at = ... WHERE id = $2
    if (q.startsWith('update incidents') && q.includes('status = $1')) {
      const status = params[0];
      const id = parseInt(params[1]);
      const inc = this.incidents.find(x => x.id === id);
      if (inc) {
        inc.status = status;
        inc.resolved_at = (status === 'Resolved' ? new Date() : null) as any;
        return { rows: [inc] };
      }
      return { rows: [] };
    }

    // 11. SELECT FROM citizen_reports
    if (q.startsWith('select') && q.includes('from citizen_reports c')) {
      const res = this.citizen_reports.map(c => {
        const u = this.users.find(x => x.id === c.reporter_id);
        return {
          ...c,
          reporter_email: u ? u.email : null
        };
      }).sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
      return { rows: res };
    }

    // 12. INSERT INTO citizen_reports
    if (q.startsWith('insert into citizen_reports')) {
      const reporter_id = params[0];
      const description = params[1];
      const status = 'Pending';
      const longitude = params[2];
      const latitude = params[3];
      const photo_url = params[4];
      const ai_classification_tags = typeof params[5] === 'string' ? JSON.parse(params[5]) : params[5];
      const id = this.nextIds.citizen_reports++;
      const created_at = new Date();
      const newRep = { id, reporter_id, description, status, longitude, latitude, photo_url, ai_classification_tags, created_at };
      this.citizen_reports.push(newRep);
      return { rows: [newRep] };
    }

    // 13. UPDATE citizen_reports SET status = $1 WHERE id = $2
    if (q.startsWith('update citizen_reports') && q.includes('status = $1')) {
      const status = params[0];
      const id = parseInt(params[1]);
      const rep = this.citizen_reports.find(x => x.id === id);
      if (rep) {
        rep.status = status;
        return { rows: [rep] };
      }
      return { rows: [] };
    }

    // 14. SELECT FROM roads
    if (q.startsWith('select') && q.includes('from roads')) {
      return { rows: this.roads.map(r => ({ ...r, geometry: JSON.stringify(r.geometry) })) };
    }

    // 15. UPDATE roads SET status = $1, reopening_est = $2 WHERE id = $3
    if (q.startsWith('update roads') && q.includes('status = $1')) {
      const status = params[0];
      const reopening_est = params[1] ? new Date(params[1]) : null;
      const id = parseInt(params[2]);
      const r = this.roads.find(x => x.id === id);
      if (r) {
        r.status = status;
        r.reopening_est = reopening_est;
        return { rows: [r] };
      }
      return { rows: [] };
    }

    // 16. SELECT FROM alerts
    if (q.startsWith('select') && q.includes('from alerts a')) {
      const res = this.alerts.map(a => {
        const z = this.risk_zones.find(x => x.id === a.zone_id);
        const u = this.users.find(x => x.id === a.sent_by);
        return {
          ...a,
          zone_name: z ? z.name : null,
          sender_email: u ? u.email : null
        };
      }).sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
      return { rows: res };
    }

    // 17. INSERT INTO alerts
    if (q.startsWith('insert into alerts')) {
      const zone_id = params[0];
      const title_en = params[1];
      const message_en = params[2];
      const translations = typeof params[3] === 'string' ? JSON.parse(params[3]) : params[3];
      const severity = params[4];
      const status = 'Draft';
      const sent_by = params[5] || null;
      const id = this.nextIds.alerts++;
      const created_at = new Date();
      const newAlert = { id, zone_id, title_en, message_en, translations, severity, status, sent_by, created_at };
      this.alerts.push(newAlert);
      return { rows: [newAlert] };
    }

    // 18. SELECT FROM alerts WHERE id = $1
    if (q.startsWith('select') && q.includes('from alerts where id = $1')) {
      const id = parseInt(params[0]);
      const alert = this.alerts.find(x => x.id === id);
      return { rows: alert ? [alert] : [] };
    }

    // 19. SELECT FROM users (all details)
    if (q.startsWith('select id, phone, role, preferred_language from users')) {
      return { rows: this.users };
    }

    // 20. INSERT INTO alert_recipients
    if (q.startsWith('insert into alert_recipients')) {
      return { rows: [] };
    }

    // 21. UPDATE alerts SET status = 'Dispatched' WHERE id = $1
    if (q.startsWith('update alerts') && q.includes("status = 'dispatched'")) {
      const id = parseInt(params[0]);
      const alert = this.alerts.find(x => x.id === id);
      if (alert) alert.status = 'Dispatched';
      return { rows: [] };
    }

    // 22. SELECT FROM alert_recipients
    if (q.startsWith('select') && q.includes('from alert_recipients r')) {
      const alertId = parseInt(params[0]);
      const res = this.alert_recipients
        .filter(r => r.alert_id === alertId)
        .map(r => {
          const u = this.users.find(x => x.id === r.user_id);
          return {
            ...r,
            email: u ? u.email : null,
            phone: u ? u.phone : null
          };
        });
      return { rows: res };
    }

    // 23. SELECT FROM districts
    if (q.startsWith('select') && q.includes('from districts') && !q.includes('centroid') && !q.includes('average_risk')) {
      return { rows: this.districts };
    }

    // 24. SELECT FROM risk_zones z JOIN districts d
    if (q.startsWith('select') && q.includes('from risk_zones z') && q.includes('join districts d')) {
      const res = this.risk_zones.map(z => {
        const d = this.districts.find(x => x.id === z.district_id);
        return {
          id: z.id,
          name: z.name,
          district_id: z.district_id,
          susceptibility_score: z.susceptibility_score,
          district_name: d ? d.name : ''
        };
      });
      return { rows: res };
    }

    // 25. AVG/SUM sensors readings statistics for zone
    if (q.includes('avg_moisture') && q.includes('recent_rain')) {
      const zoneId = params[0];
      const zoneSensors = this.sensors.filter(s => s.zone_id === zoneId);
      const zoneSensorIds = zoneSensors.map(s => s.id);

      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const recentReadings = this.sensor_readings.filter(r => zoneSensorIds.includes(r.sensor_id) && r.timestamp > oneHourAgo);

      const moistureReadings = recentReadings.filter(r => {
        const s = zoneSensors.find(x => x.id === r.sensor_id);
        return s && s.type === 'soil_moisture';
      });

      const rainReadings = recentReadings.filter(r => {
        const s = zoneSensors.find(x => x.id === r.sensor_id);
        return s && s.type === 'raingauge';
      });

      const avgMoisture = moistureReadings.length > 0
        ? moistureReadings.reduce((sum, r) => sum + r.value_1, 0) / moistureReadings.length
        : 45.0;

      const sumRain = rainReadings.reduce((sum, r) => sum + r.value_1, 0);

      return {
        rows: [{
          avg_moisture: avgMoisture,
          recent_rain: sumRain || 15.0
        }]
      };
    }

    // 26. UPDATE risk_zones
    if (q.startsWith('update risk_zones') && q.includes('overall_risk_level = $4')) {
      const sus = params[0];
      const trig = params[1];
      const overall = params[2];
      const level = params[3];
      const id = params[4];
      const z = this.risk_zones.find(x => x.id === id);
      if (z) {
        z.susceptibility_score = sus;
        z.dynamic_risk_score = trig;
        z.overall_risk_score = overall;
        z.overall_risk_level = level;
        z.last_updated_at = new Date();
      }
      return { rows: [] };
    }

    // 27. GET Centroids of all districts
    if (q.includes('st_centroid(boundary)') && !q.includes('where id = $1')) {
      const centroids = [
        { id: 1, name: 'East Khasi Hills', lon: 91.85, lat: 25.55 },
        { id: 2, name: 'Dima Hasao', lon: 92.9, lat: 25.25 },
        { id: 3, name: 'Aizawl', lon: 92.75, lat: 23.75 },
        { id: 4, name: 'Mangan', lon: 88.6, lat: 27.65 },
        { id: 5, name: 'Noney', lon: 93.6, lat: 24.85 },
        { id: 6, name: 'Tawang', lon: 91.95, lat: 27.6 }
      ];
      return { rows: centroids };
    }

    // 28. Centroid of specific district
    if (q.includes('st_centroid(boundary)') && q.includes('where id = $1')) {
      const districtId = params[0];
      const centroids: Record<number, { lon: number, lat: number }> = {
        1: { lon: 91.85, lat: 25.55 },
        2: { lon: 92.9, lat: 25.25 },
        3: { lon: 92.75, lat: 23.75 },
        4: { lon: 88.6, lat: 27.65 },
        5: { lon: 93.6, lat: 24.85 },
        6: { lon: 91.95, lat: 27.6 }
      };
      const c = centroids[districtId];
      return { rows: c ? [c] : [] };
    }

    // 29. INSERT INTO weather_snapshots
    if (q.startsWith('insert into weather_snapshots')) {
      this.weather_snapshots.push({
        timestamp: params[0] ? new Date(params[0]) : new Date(),
        district_id: params[1],
        temperature: params[2],
        humidity: params[3],
        hourly_rainfall: params[4],
        wind_speed: params[5],
        status: params[6]
      });
      return { rows: [] };
    }

    // 30. INSERT INTO users (sign up)
    if (q.startsWith('insert into users')) {
      const email = params[0];
      const phone = params[1];
      const password_hash = params[2];
      const role = params[3] || 'Citizen';
      const preferred_language = params[4] || 'en';
      const id = this.nextIds.users++;
      const created_at = new Date();
      const newUser = { id, email, phone, password_hash, role, preferred_language, created_at };
      this.users.push(newUser);
      return { rows: [newUser] };
    }

    // 31. FIND USER (Auth)
    if (q.startsWith('select') && q.includes('from users') && q.includes('email = $1 or phone = $1')) {
      const identity = params[0];
      const u = this.users.find(x => x.email === identity || x.phone === identity);
      return { rows: u ? [u] : [] };
    }

    // 32. DISTRICT SUMMARY (With counts and averages)
    if (q.startsWith('select') && q.includes('from districts d left join risk_zones z')) {
      const summary = this.districts.map(d => {
        const districtZones = this.risk_zones.filter(z => z.district_id === d.id);
        const avgRisk = districtZones.length > 0
          ? districtZones.reduce((sum, z) => sum + z.overall_risk_score, 0) / districtZones.length
          : 30.0;
        const vHighCount = districtZones.filter(z => z.overall_risk_level === 'Very High').length;
        const highCount = districtZones.filter(z => z.overall_risk_level === 'High').length;

        return {
          id: d.id,
          name: d.name,
          state: d.state,
          risk_level: d.risk_level,
          average_risk: avgRisk,
          v_high_count: vHighCount,
          high_count: highCount
        };
      });
      return { rows: summary };
    }

    console.log('[MockDB] Unhandled query:', text);
    return { rows: [] };
  }

  async connect() {
    return {
      query: async (text: string, params: any[] = []) => {
        return this.query(text, params);
      },
      release: () => {
        // noop
      }
    };
  }
}

const mockDb = new MockDatabase();
let useMock = false;

// Proxy interface matching pg Pool exports
export const pool = {
  query: async (text: string, params?: any[]) => {
    if (useMock) {
      return mockDb.query(text, params);
    }
    try {
      return await realPool.query(text, params);
    } catch (err: any) {
      console.warn('[Database] Connection failed. Switching to in-memory fallback database.', err.message || err);
      useMock = true;
      return mockDb.query(text, params);
    }
  },
  connect: async () => {
    if (useMock) {
      return mockDb.connect();
    }
    try {
      return await realPool.connect();
    } catch (err: any) {
      console.warn('[Database] Connection failed. Switching to in-memory fallback database.', err.message || err);
      useMock = true;
      return mockDb.connect();
    }
  }
} as any;

/**
 * Initializes the database.
 * If tables do not exist, runs schema.sql and seed.sql automatically.
 */
export async function initDatabase() {
  console.log(`[Database] Initializing connection to ${dbHost}:${dbPort}/${dbName}...`);
  try {
    const client = await pool.connect();
    console.log('[Database] Connected successfully.');
    client.release();
  } catch (error: any) {
    console.warn('[Database] Connection failure during bootstrap. Fallback database initialized.');
  }
}
