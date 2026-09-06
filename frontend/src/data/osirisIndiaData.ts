export interface CCTVCamera {
  id: string;
  name: string;
  location: string;
  lat: number;
  lng: number;
  status: 'Live' | 'Maintenance' | 'Heavy Traffic' | 'Alert';
  speed: string;
  videoUrl: string;
  snapshotUrl: string;
  highway: string;
  city: string;
  state: string;
  lastUpdate: string;
}

export interface EarthquakeEvent {
  id: string;
  place: string;
  magnitude: number;
  depth: string;
  lat: number;
  lng: number;
  time: string;
  severity: 'Minor' | 'Moderate' | 'Severe';
}

export interface PastLandslideSite {
  id: string;
  name: string;
  district: string;
  state: string;
  lat: number;
  lng: number;
  date: string;
  severity: 'Severe' | 'Moderate' | 'High';
  cause: string;
  fatalities?: number;
  roadBlocked: string;
}

export interface SoilMoistureZone {
  id: string;
  district: string;
  state: string;
  saturationPercentage: number;
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical';
  lat: number;
  lng: number;
  lastReading: string;
}

export interface IndiaNewsItem {
  id: string;
  title: string;
  source: string;
  category: 'Landslide Warning' | 'Monsoon Alert' | 'Highway Status' | 'Seismic Trigger';
  timestamp: string;
  urgent: boolean;
  link?: string;
}

export interface IndiaIncident {
  id: string;
  title: string;
  type: 'Landslide' | 'Flash Flood' | 'Bridge Blockade' | 'Seismic Tremor';
  state: string;
  district: string;
  lat: number;
  lng: number;
  severity: 'Critical' | 'High' | 'Moderate';
  updatedAt: string;
}

// ----------------------------------------------------
// NORTH EASTERN REGION (NER) LANDSLIDE DATASETS
// ----------------------------------------------------

export const NER_CCTV_CAMERAS: CCTVCamera[] = [
  {
    id: 'cctv-ner-01',
    name: 'NH-6 Shillong Corridor (Km 42 Jorabat-Jowai)',
    location: 'East Khasi Hills',
    state: 'Meghalaya',
    lat: 25.5788,
    lng: 91.8933,
    status: 'Alert',
    speed: '12 km/h (Active Slope Creep)',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    snapshotUrl: '/images/camera-feeds/shillong-nh6.jpg',
    highway: 'NH-6 Highway',
    city: 'Shillong',
    lastUpdate: 'Live • 1 min ago'
  },
  {
    id: 'cctv-ner-02',
    name: 'Haflong Hill Bypass (NH-27 Km 118)',
    location: 'Dima Hasao',
    state: 'Assam',
    lat: 25.1812,
    lng: 92.9461,
    status: 'Live',
    speed: '28 km/h',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    snapshotUrl: '/images/camera-feeds/haflong-nh27.jpg',
    highway: 'NH-27 Highway',
    city: 'Haflong',
    lastUpdate: 'Live • Just now'
  },
  {
    id: 'cctv-ner-03',
    name: 'Gangtok - Siliguri Corridor (NH-10 Sevoke Curve)',
    location: 'Mangan / Pakyong Margin',
    state: 'Sikkim',
    lat: 27.3314,
    lng: 88.6138,
    status: 'Alert',
    speed: '08 km/h (Debris Spill)',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    snapshotUrl: '/images/camera-feeds/gangtok-nh10.jpg',
    highway: 'NH-10 Highway',
    city: 'Gangtok',
    lastUpdate: 'Live • 2 mins ago'
  },
  {
    id: 'cctv-ner-04',
    name: 'Aizawl North Bypass (NH-54 Sairang Section)',
    location: 'Aizawl District',
    state: 'Mizoram',
    lat: 23.7307,
    lng: 92.7173,
    status: 'Live',
    speed: '35 km/h',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    snapshotUrl: '/images/camera-feeds/shillong-nh6.jpg',
    highway: 'NH-54 Highway',
    city: 'Aizawl',
    lastUpdate: 'Live • Just now'
  },
  {
    id: 'cctv-ner-05',
    name: 'Tawang Pass Road (NH-13 Sela Tunnel Approach)',
    location: 'Tawang District',
    state: 'Arunachal Pradesh',
    lat: 27.5860,
    lng: 91.8594,
    status: 'Heavy Traffic',
    speed: '15 km/h',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutback2013.mp4',
    snapshotUrl: '/images/camera-feeds/tawang-nh13.jpg',
    highway: 'NH-13 Trans-Arunachal Highway',
    city: 'Tawang',
    lastUpdate: 'Live • 3 mins ago'
  },
  {
    id: 'cctv-ner-06',
    name: 'Kohima - Dimapur Highway (NH-29 Phesama)',
    location: 'Kohima District',
    state: 'Nagaland',
    lat: 25.6747,
    lng: 94.1100,
    status: 'Live',
    speed: '40 km/h',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4',
    snapshotUrl: '/images/camera-feeds/haflong-nh27.jpg',
    highway: 'NH-29 Highway',
    city: 'Kohima',
    lastUpdate: 'Live • Just now'
  }
];

export const NER_PAST_LANDSLIDES: PastLandslideSite[] = [
  {
    id: 'pls-01',
    name: 'NH-6 Sonapur Tunnel Debris Fall',
    district: 'East Jaintia Hills',
    state: 'Meghalaya',
    lat: 25.1182,
    lng: 92.3641,
    date: 'June 17, 2024',
    severity: 'Severe',
    cause: 'Heavy monsoon rain causing mass mud movement',
    fatalities: 0,
    roadBlocked: 'NH-6 Highway (Blocked 48h)'
  },
  {
    id: 'pls-02',
    name: 'Haflong Railway Hill Slope Collapse',
    district: 'Dima Hasao',
    state: 'Assam',
    lat: 25.1630,
    lng: 92.9320,
    date: 'May 15, 2022',
    severity: 'Severe',
    cause: 'Unprecedented rainfall leading to total slope shear',
    fatalities: 3,
    roadBlocked: 'Haflong Link Road & Lumding Line'
  },
  {
    id: 'pls-03',
    name: 'Mangan North Sikkim Slope Washout',
    district: 'Mangan',
    state: 'Sikkim',
    lat: 27.5082,
    lng: 88.5360,
    date: 'June 12, 2024',
    severity: 'Severe',
    cause: 'Teesta flash flood & saturated upper soil planes',
    fatalities: 6,
    roadBlocked: 'Mangan-Chungthang Road'
  },
  {
    id: 'pls-04',
    name: 'Tupul Yard Noney Mass Landslide',
    district: 'Noney',
    state: 'Manipur',
    lat: 24.8150,
    lng: 93.6810,
    date: 'June 30, 2022',
    severity: 'Severe',
    cause: 'Deep-seated rotational failure on railway cutting',
    fatalities: 61,
    roadBlocked: 'Jiribam-Imphal Railway Works'
  },
  {
    id: 'pls-05',
    name: 'Hunli Slope Slip',
    district: 'Lower Dibang Valley',
    state: 'Arunachal Pradesh',
    lat: 28.2710,
    lng: 95.9620,
    date: 'July 04, 2023',
    severity: 'Moderate',
    cause: 'Cloudburst event over steep hill gradient',
    fatalities: 0,
    roadBlocked: 'Roing-Anini Highway'
  }
];

export const NER_SOIL_MOISTURE_ZONES: SoilMoistureZone[] = [
  {
    id: 'smz-01',
    district: 'East Khasi Hills',
    state: 'Meghalaya',
    saturationPercentage: 88.4,
    riskLevel: 'Critical',
    lat: 25.57,
    lng: 91.88,
    lastReading: 'Live Sync • 4s ago'
  },
  {
    id: 'smz-02',
    district: 'Dima Hasao',
    state: 'Assam',
    saturationPercentage: 79.2,
    riskLevel: 'High',
    lat: 25.18,
    lng: 92.95,
    lastReading: 'Live Sync • 4s ago'
  },
  {
    id: 'smz-03',
    district: 'Mangan',
    state: 'Sikkim',
    saturationPercentage: 84.6,
    riskLevel: 'Critical',
    lat: 27.51,
    lng: 88.54,
    lastReading: 'Live Sync • 4s ago'
  },
  {
    id: 'smz-04',
    district: 'Aizawl',
    state: 'Mizoram',
    saturationPercentage: 62.1,
    riskLevel: 'Moderate',
    lat: 23.73,
    lng: 92.71,
    lastReading: 'Live Sync • 4s ago'
  },
  {
    id: 'smz-05',
    district: 'Noney',
    state: 'Manipur',
    saturationPercentage: 74.8,
    riskLevel: 'High',
    lat: 24.81,
    lng: 93.68,
    lastReading: 'Live Sync • 4s ago'
  }
];

export const NER_SEISMIC_TRIGGERS: EarthquakeEvent[] = [
  {
    id: 'eq-ner-01',
    place: '42 km N of Tezpur, Assam',
    magnitude: 4.2,
    depth: '14 km',
    lat: 26.9621,
    lng: 92.7932,
    time: '25 mins ago',
    severity: 'Moderate'
  },
  {
    id: 'eq-ner-02',
    place: '18 km E of Mangan, Sikkim',
    magnitude: 3.9,
    depth: '10 km',
    lat: 27.5210,
    lng: 88.6420,
    time: '2 hours ago',
    severity: 'Minor'
  },
  {
    id: 'eq-ner-03',
    place: '22 km SW of Churachandpur, Manipur',
    magnitude: 4.5,
    depth: '22 km',
    lat: 24.2810,
    lng: 93.5820,
    time: '6 hours ago',
    severity: 'Moderate'
  }
];

export const NER_EMERGENCY_BULLETINS: IndiaNewsItem[] = [
  {
    id: 'news-ner-01',
    title: 'IMD Red Alert: Heavy Downpour Exceeding 120mm/hr in East Khasi Hills & Dima Hasao',
    source: 'India Meteorological Department (IMD Regional Center Guwahati)',
    category: 'Monsoon Alert',
    timestamp: '5 mins ago',
    urgent: true
  },
  {
    id: 'news-ner-02',
    title: 'High Slope Saturation (>85%) Detected across Shillong-Jowai NH-6 Corridor',
    source: 'Geotechnical Soil Probe Grid (NESAC & SDMA)',
    category: 'Landslide Warning',
    timestamp: '15 mins ago',
    urgent: true
  },
  {
    id: 'news-ner-03',
    title: 'NH-10 Sevoke Curve Partially Blocked by Rockfall Debris; One Lane Operational',
    source: 'Sikkim PWD & Border Roads Organisation (BRO)',
    category: 'Highway Status',
    timestamp: '32 mins ago',
    urgent: false
  },
  {
    id: 'news-ner-04',
    title: 'M4.2 Tremor Recorded near Tezpur Fault Plane — Trigger Watch Active on Weak Slopes',
    source: 'National Center for Seismology (NCS)',
    category: 'Seismic Trigger',
    timestamp: '1 hour ago',
    urgent: false
  }
];

export const NER_INCIDENTS: IndiaIncident[] = [
  {
    id: 'inc-ner-01',
    title: 'Active Slope Creep & Debris Flow on NH-6 (Km 44 Shillong Corridor)',
    type: 'Landslide',
    state: 'Meghalaya',
    district: 'East Khasi Hills',
    lat: 25.57,
    lng: 91.88,
    severity: 'Critical',
    updatedAt: '5 mins ago'
  },
  {
    id: 'inc-ner-02',
    title: 'Rockfall Debris Clearance on NH-10 Sikkim Corridor',
    type: 'Bridge Blockade',
    state: 'Sikkim',
    district: 'Mangan Border',
    lat: 27.33,
    lng: 88.61,
    severity: 'High',
    updatedAt: '18 mins ago'
  },
  {
    id: 'inc-ner-03',
    title: 'Flash Flood Watch near Haflong Railway Hill Link Road',
    type: 'Flash Flood',
    state: 'Assam',
    district: 'Dima Hasao',
    lat: 25.18,
    lng: 92.95,
    severity: 'High',
    updatedAt: '30 mins ago'
  }
];

// Aliases for backwards compatibility
export const INDIA_CCTV_CAMERAS = NER_CCTV_CAMERAS;
export const INDIA_EARTHQUAKES = NER_SEISMIC_TRIGGERS;
export const INDIA_NEWS_FEED = NER_EMERGENCY_BULLETINS;
export const INDIA_INCIDENTS = NER_INCIDENTS;
