import { create } from 'zustand';
import { playSiren } from '../utils/audioSirenService';

export interface User {
  id: number;
  email: string;
  name?: string;
  phone: string;
  role: string;
  preferred_language: string;
}

export interface Subscription {
  email: string;
  severityPreference: 'all' | 'high_critical' | 'critical_only';
  duration: '1_day' | '7_days' | '30_days' | 'forever';
  subscribedAt: string;
  expiresAt: string | null;
  active: boolean;
}

interface UIStore {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  user: User | null;
  setUser: (user: User | null) => void;
  subscription: Subscription | null;
  subscribeToAlerts: (sub: Omit<Subscription, 'subscribedAt' | 'expiresAt' | 'active'>) => void;
  unsubscribeFromAlerts: () => void;
  checkSubscriptionExpiry: () => void;
  isConnected: boolean;
  setIsConnected: (status: boolean) => void;
  
  // Dynamic Lists populated from API / websockets / mock simulation
  sensors: any[];
  setSensors: (sensors: any[]) => void;
  updateSensor: (sensor: any) => void;
  
  roads: any[];
  setRoads: (roads: any[]) => void;
  updateRoad: (road: any) => void;
  toggleRoadStatus: (roadId: number) => void;
  
  incidents: any[];
  setIncidents: (incidents: any[]) => void;
  addIncident: (incident: any) => void;
  updateIncident: (incident: any) => void;

  citizenReports: any[];
  setCitizenReports: (reports: any[]) => void;
  addCitizenReport: (report: any) => void;
  updateCitizenReport: (reportId: string | number, status: string) => void;

  alerts: any[];
  setAlerts: (alerts: any[]) => void;
  addAlert: (alert: any) => void;
  updateAlert: (alert: any) => void;
  acknowledgeAlert: (alertId: number) => void;

  activeToastAlert: any | null;
  setActiveToastAlert: (alert: any | null) => void;
  triggerToastAlert: (alert: any) => void;

  selectedZone: any | null;
  setSelectedZone: (zone: any | null) => void;

  // NER Landslide 6 Core Layers
  osirisLayers: Record<string, boolean>;
  toggleOsirisLayer: (layerKey: string) => void;
  setAllOsirisLayers: (enabled: boolean) => void;
  mapProjectionMode: '2d' | '3d' | 'satellite' | 'streetview';
  setMapProjectionMode: (mode: '2d' | '3d' | 'satellite' | 'streetview') => void;
  heatmapOpacity: number;
  setHeatmapOpacity: (opacity: number) => void;
  searchedLocation: any | null;
  setSearchedLocation: (location: any | null) => void;
  activeCameraModal: any | null;
  setActiveCameraModal: (camera: any | null) => void;

  // Real-time Live Telemetry Data State (Refreshed every 4 seconds)
  liveTelemetry: {
    rainfallMm: number;
    soilMoisturePct: number;
    seismicMag: number;
    lastHeartbeatSec: number;
    computedScore: number;
    severity: string;
    aiConfidencePct: number;
  };
  tickLiveTelemetry: () => void;
}

/**
 * PRITHVI-SHIELD Rule-Based Risk & AI Confidence Calculation Engine
 * 
 * Formula:
 * riskScore = (0.35 * normalizedRainfall) + (0.35 * soilMoisturePct) + (0.15 * slopeAngle) + (0.15 * pastLandslideDensity)
 * aiConfidence = min(99, Math.round(72 + (riskScore * 0.25)))
 */
export const calculateComputedRiskScore = (
  rainfallMm: number,
  soilMoisturePct: number,
  slopeAngleDeg: number = 34,
  pastLandslideDensityPct: number = 45
) => {
  const normRain = Math.min(100, (rainfallMm / 200) * 100);
  const normSoil = Math.min(100, soilMoisturePct);
  const normSlope = Math.min(100, (slopeAngleDeg / 45) * 100);
  const normHistory = Math.min(100, pastLandslideDensityPct);

  const riskScore = parseFloat(
    (0.35 * normRain + 0.35 * normSoil + 0.15 * normSlope + 0.15 * normHistory).toFixed(1)
  );

  let severity = 'Low';
  if (riskScore >= 75) severity = 'Very High';
  else if (riskScore >= 60) severity = 'High';
  else if (riskScore >= 40) severity = 'Moderate';

  const aiConfidencePct = Math.min(99, Math.round(72 + (riskScore * 0.25)));

  return {
    riskScore,
    severity,
    aiConfidencePct,
    normRain,
    normSoil,
    normSlope,
    normHistory
  };
};

// Helper to parse stored user or null
const getInitialUser = (): User | null => {
  try {
    const stored = localStorage.getItem('prithvi_user');
    if (stored) return JSON.parse(stored);
  } catch (e) {}
  return null;
};

const getInitialSub = (): Subscription | null => {
  try {
    const stored = localStorage.getItem('prithvi_subscription');
    if (stored) {
      const parsed: Subscription = JSON.parse(stored);
      if (parsed.expiresAt && new Date(parsed.expiresAt) < new Date()) {
        localStorage.removeItem('prithvi_subscription');
        return null;
      }
      return parsed;
    }
  } catch (e) {}
  return null;
};

export const useUIStore = create<UIStore>((set) => ({
  currentTab: 'dashboard',
  setCurrentTab: (tab) => set({ currentTab: tab }),
  
  user: null,
  setUser: (user) => {
    if (user) {
      localStorage.setItem('prithvi_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('prithvi_user');
    }
    set({ user });
  },

  subscription: getInitialSub(),
  subscribeToAlerts: (subInput) => {
    const now = new Date();
    let expiresAt: string | null = null;
    if (subInput.duration === '1_day') {
      const d = new Date(now); d.setDate(d.getDate() + 1); expiresAt = d.toISOString();
    } else if (subInput.duration === '7_days') {
      const d = new Date(now); d.setDate(d.getDate() + 7); expiresAt = d.toISOString();
    } else if (subInput.duration === '30_days') {
      const d = new Date(now); d.setDate(d.getDate() + 30); expiresAt = d.toISOString();
    }

    const newSub: Subscription = {
      ...subInput,
      subscribedAt: now.toISOString(),
      expiresAt,
      active: true
    };
    localStorage.setItem('prithvi_subscription', JSON.stringify(newSub));
    set({ subscription: newSub });
  },
  unsubscribeFromAlerts: () => {
    localStorage.removeItem('prithvi_subscription');
    set({ subscription: null });
  },
  checkSubscriptionExpiry: () => {
    const current = getInitialSub();
    set({ subscription: current });
  },

  isConnected: true,
  setIsConnected: (status) => set({ isConnected: status }),

  sensors: [],
  setSensors: (sensors) => set({ sensors }),
  updateSensor: (sensor) => set((state) => ({
    sensors: state.sensors.map((s) => (s.id === sensor.sensor_id || s.id === sensor.id ? { ...s, ...sensor, last_reading_at: sensor.timestamp || new Date().toISOString() } : s))
  })),

  roads: [],
  setRoads: (roads) => set({ roads }),
  updateRoad: (road) => set((state) => ({
    roads: state.roads.map((r) => (r.id === road.id ? { ...r, ...road } : r))
  })),
  toggleRoadStatus: (roadId) => set((state) => ({
    roads: state.roads.map((r) => {
      if (r.id === roadId) {
        const nextStatus = r.status === 'Clear' ? 'Partially Blocked' : r.status === 'Partially Blocked' ? 'Fully Blocked' : 'Clear';
        return { ...r, status: nextStatus };
      }
      return r;
    })
  })),

  incidents: [],
  setIncidents: (incidents) => set({ incidents }),
  addIncident: (incident) => set((state) => ({ incidents: [incident, ...state.incidents] })),
  updateIncident: (incident) => set((state) => ({
    incidents: state.incidents.map((i) => (i.id === incident.id ? { ...i, ...incident } : i))
  })),

  citizenReports: [],
  setCitizenReports: (reports) => set({ citizenReports: reports }),
  addCitizenReport: (report) => set((state) => ({ citizenReports: [report, ...state.citizenReports] })),
  updateCitizenReport: (reportId, status) => set((state) => {
    const updatedReports = state.citizenReports.map((r) => (r.id === reportId ? { ...r, status } : r));
    
    // Auto-escalate Verified Severe report to Incidents
    const targetReport = updatedReports.find(r => r.id === reportId);
    let updatedIncidents = state.incidents;
    if (targetReport && (status === 'Verified' || status === 'Approved') && targetReport.severity === 'Severe') {
      const exists = state.incidents.some(i => i.title.includes(targetReport.category));
      if (!exists) {
        const newTicket = {
          id: Date.now(),
          title: `[Citizen Alert] ${targetReport.category} - ${targetReport.locationName || 'NER Corridor'}`,
          description: targetReport.description,
          status: 'Active',
          severity: 'Critical',
          location: targetReport.locationName || `${targetReport.latitude?.toFixed(2)}°N, ${targetReport.longitude?.toFixed(2)}°E`,
          state: targetReport.state || 'Meghalaya',
          updatedAt: 'Just now'
        };
        updatedIncidents = [newTicket, ...state.incidents];
      }
    }

    return { citizenReports: updatedReports, incidents: updatedIncidents };
  }),

  alerts: [],
  setAlerts: (alerts) => set({ alerts }),
  addAlert: (alert) => set((state) => ({ alerts: [alert, ...state.alerts] })),
  updateAlert: (alert) => set((state) => ({
    alerts: state.alerts.map((a) => (a.id === alert.id ? { ...a, ...alert } : a))
  })),
  acknowledgeAlert: (alertId) => set((state) => ({
    alerts: state.alerts.map((a) => (a.id === alertId ? { ...a, status: 'Acknowledged', acknowledgedAt: new Date().toLocaleTimeString() } : a))
  })),

  activeToastAlert: null,
  setActiveToastAlert: (alert) => set({ activeToastAlert: alert }),
  triggerToastAlert: (alert) => {
    set({ activeToastAlert: alert });
    playSiren();
    if ((window as any).__toastTimer) clearTimeout((window as any).__toastTimer);
    (window as any).__toastTimer = setTimeout(() => {
      set({ activeToastAlert: null });
    }, 10000);
  },

  selectedZone: null,
  setSelectedZone: (zone) => set({ selectedZone: zone }),

  // 7 Refocused NER Landslide Layers (including Risk Heatmap Gradient)
  osirisLayers: {
    heatmap: true,
    rainfall: true,
    soil_moisture: true,
    slope_terrain: true,
    past_landslides: true,
    seismic: true,
    cctv: true
  },
  toggleOsirisLayer: (key) => set((state) => ({
    osirisLayers: { ...state.osirisLayers, [key]: !state.osirisLayers[key] }
  })),
  setAllOsirisLayers: (enabled) => set((state) => ({
    osirisLayers: Object.keys(state.osirisLayers).reduce((acc, k) => ({ ...acc, [k]: enabled }), {})
  })),

  mapProjectionMode: '2d',
  setMapProjectionMode: (mode) => set({ mapProjectionMode: mode }),

  heatmapOpacity: 0.7,
  setHeatmapOpacity: (heatmapOpacity) => set({ heatmapOpacity }),

  setSearchedLocation: (searchedLocation) => set((state) => {
    if (!searchedLocation) {
      return { 
        searchedLocation: null,
        liveTelemetry: {
          rainfallMm: 195.2,
          soilMoisturePct: 87.4,
          seismicMag: 4.2,
          lastHeartbeatSec: 1,
          computedScore: 84.5,
          severity: 'Very High',
          aiConfidencePct: 93,
          locationName: 'East Khasi Hills (Shillong Axis)',
          stateName: 'Meghalaya'
        }
      };
    }

    const rain = searchedLocation.weatherData?.precipitation ?? searchedLocation.weatherData?.precipitationMm ?? searchedLocation.rain ?? (searchedLocation.isNER ? 195.2 : 12.4);
    const soil = searchedLocation.weatherData?.soil_moisture_pct ?? searchedLocation.weatherData?.soilMoisturePct ?? searchedLocation.soilMoisture ?? (searchedLocation.isNER ? 87.4 : 54.0);
    const temp = searchedLocation.weatherData?.temperature_2m ?? searchedLocation.weatherData?.temperatureC ?? 24.0;
    const calc = calculateComputedRiskScore(rain, soil, 34, 45);

    return {
      searchedLocation,
      liveTelemetry: {
        ...state.liveTelemetry,
        rainfallMm: rain,
        soilMoisturePct: soil,
        temperatureC: temp,
        locationName: searchedLocation.name,
        stateName: searchedLocation.state || 'India',
        computedScore: searchedLocation.riskInfo?.riskScore ?? calc.riskScore,
        severity: searchedLocation.riskInfo?.riskLevel ?? calc.severity,
        aiConfidencePct: searchedLocation.riskInfo?.aiConfidencePct ?? calc.aiConfidencePct,
        seismicMag: searchedLocation.isNER ? 4.2 : 2.1
      }
    };
  }),

  activeCameraModal: null,
  setActiveCameraModal: (camera) => set({ activeCameraModal: camera }),

  liveTelemetry: {
    rainfallMm: 195.2,
    soilMoisturePct: 87.4,
    seismicMag: 4.2,
    lastHeartbeatSec: 1,
    computedScore: 84.5,
    severity: 'Very High',
    aiConfidencePct: 93,
    locationName: 'East Khasi Hills (Shillong Axis)',
    stateName: 'Meghalaya'
  },
  tickLiveTelemetry: () => set((state) => {
    const currentRain = state.liveTelemetry ? state.liveTelemetry.rainfallMm : 195.2;
    const currentSoil = state.liveTelemetry ? state.liveTelemetry.soilMoisturePct : 87.4;
    const rainDrift = (Math.random() * 0.4 - 0.2);
    const soilDrift = (Math.random() * 0.2 - 0.1);
    const newRain = Math.max(0, Math.min(450, parseFloat((currentRain + rainDrift).toFixed(1))));
    const newSoil = Math.max(10, Math.min(99.9, parseFloat((currentSoil + soilDrift).toFixed(1))));

    const calc = calculateComputedRiskScore(newRain, newSoil, 34, 45);

    return {
      liveTelemetry: {
        ...state.liveTelemetry,
        rainfallMm: newRain,
        soilMoisturePct: newSoil,
        lastHeartbeatSec: ((state.liveTelemetry ? state.liveTelemetry.lastHeartbeatSec : 1) % 5) + 1,
        computedScore: state.searchedLocation?.riskInfo?.riskScore ?? calc.riskScore,
        severity: state.searchedLocation?.riskInfo?.riskLevel ?? calc.severity,
        aiConfidencePct: state.searchedLocation?.riskInfo?.aiConfidencePct ?? calc.aiConfidencePct
      }
    };
  })
}));
