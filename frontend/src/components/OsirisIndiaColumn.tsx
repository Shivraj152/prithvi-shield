import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { tAuto, tNum } from '../i18n';
import { useUIStore } from '../store/uiStore';
import { 
  NER_CCTV_CAMERAS, 
  NER_EMERGENCY_BULLETINS, 
  NER_SEISMIC_TRIGGERS, 
  NER_SOIL_MOISTURE_ZONES, 
  NER_PAST_LANDSLIDES
} from '../data/osirisIndiaData';
import { 
  CloudRain, Droplets, Mountain, MapPin, Activity, Video, 
  Layers, CheckSquare, Square, Play, X, Compass, Radio, Eye, Flame
} from 'lucide-react';
import { CctvCanvasSimulator } from './CctvCanvasSimulator';

export const OsirisIndiaColumn: React.FC = () => {
  const { t } = useTranslation();
  const { 
    osirisLayers, 
    toggleOsirisLayer, 
    setAllOsirisLayers,
    mapProjectionMode,
    setMapProjectionMode,
    activeCameraModal,
    setActiveCameraModal
  } = useUIStore();

  const [filterState, setFilterState] = useState<string>('all');

  const layerDefinitions = [
    { key: 'heatmap', name: t('layer_heatmap'), icon: Flame, color: 'text-red-400', count: 'Blended Gradient Overlay' },
    { key: 'rainfall', name: t('layer_rainfall'), icon: CloudRain, color: 'text-cyan-400', count: 'Live Radar & Forecast' },
    { key: 'soil_moisture', name: t('layer_soil_moisture'), icon: Droplets, color: 'text-blue-400', count: `${NER_SOIL_MOISTURE_ZONES.length} Probe Clusters` },
    { key: 'slope_terrain', name: t('layer_slope'), icon: Mountain, color: 'text-amber-400', count: 'DEM Hazard Zones' },
    { key: 'past_landslides', name: t('layer_past_landslides'), icon: MapPin, color: 'text-rose-400', count: `${NER_PAST_LANDSLIDES.length} Recorded Failures` },
    { key: 'seismic', name: t('layer_seismic'), icon: Activity, color: 'text-purple-400', count: `${NER_SEISMIC_TRIGGERS.length} NER Epicenters` },
    { key: 'cctv', name: t('layer_cctv'), icon: Video, color: 'text-emerald-400', count: `${NER_CCTV_CAMERAS.length} Highway Feeds` },
  ];

  const allSelected = Object.values(osirisLayers).every(Boolean);

  const filteredCCTVs = filterState === 'all' 
    ? NER_CCTV_CAMERAS 
    : NER_CCTV_CAMERAS.filter(c => c.state.toLowerCase().includes(filterState.toLowerCase()));

  return (
    <div className="flex flex-col h-full bg-slate-900/95 backdrop-blur-md border-l border-slate-800 text-slate-100 overflow-hidden w-full max-w-md shadow-2xl">
      {/* Header Banner */}
      <div className="p-4 bg-gradient-to-r from-emerald-950 via-slate-900 to-cyan-950 border-b border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="font-bold text-base tracking-wide bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              PRITHVI-SHIELD • NER Command
            </h2>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            NORTH EAST REGION
          </span>
        </div>
        <p className="text-xs text-slate-400 leading-tight">
          Real-time GIS Landslide Risk Monitoring for Assam, Meghalaya, Sikkim, Mizoram, Manipur, Nagaland, Tripura, & Arunachal Pradesh.
        </p>
      </div>

      {/* Single Clean Scrollable Panel */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">
        
        {/* SECTION 1: LAYER TOGGLES (6 Core NER Layers) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-200">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>{tAuto('NER Landslide Layers')}</span>
            </div>
            <button
              onClick={() => setAllOsirisLayers(!allSelected)}
              className="flex items-center space-x-1 text-xs text-emerald-400 hover:text-emerald-300 font-medium"
            >
              {allSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
              <span>{allSelected ? tAuto('Deselect All') : tAuto('Select All')}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {layerDefinitions.map((layer) => {
              const IconComponent = layer.icon;
              const isEnabled = osirisLayers[layer.key];

              return (
                <div
                  key={layer.key}
                  onClick={() => toggleOsirisLayer(layer.key)}
                  className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all duration-200 ${
                    isEnabled
                      ? 'bg-slate-800/80 border-slate-700 text-slate-100 shadow-sm'
                      : 'bg-slate-950/30 border-slate-900/80 text-slate-500 opacity-60 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div className={`p-1.5 rounded-md ${isEnabled ? 'bg-slate-700/60' : 'bg-slate-900'}`}>
                      <IconComponent className={`w-4 h-4 ${layer.color}`} />
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-medium truncate">{layer.name}</div>
                      <div className="text-[10px] text-slate-400">{layer.count}</div>
                    </div>
                  </div>

                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                    isEnabled ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-slate-700 bg-slate-900'
                  }`}>
                    {isEnabled && <span className="text-[10px] font-bold">✓</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 2: LIVE NER ROAD CAMERAS */}
        <div className="space-y-3 pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5 text-emerald-400" />
              <span>NER Highway Feeds ({NER_CCTV_CAMERAS.length})</span>
            </h3>
            {/* Filter pills by State */}
            <div className="flex items-center space-x-1 overflow-x-auto text-[10px]">
              {['all', 'Meghalaya', 'Assam', 'Sikkim', 'Mizoram'].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterState(st)}
                  className={`px-2 py-0.5 rounded-full transition ${
                    filterState === st ? 'bg-emerald-600 text-white font-bold' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {filteredCCTVs.map((cam) => (
              <div 
                key={cam.id}
                className="group bg-slate-950/70 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition shadow-md"
              >
                {/* Preview Image */}
                <div className="relative h-32 bg-slate-900 overflow-hidden">
                  <img 
                    src={cam.snapshotUrl} 
                    alt={cam.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/40" />

                  <div className="absolute top-2 left-2 flex items-center space-x-1.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center space-x-1 ${
                      cam.status === 'Alert' ? 'bg-rose-600/90 text-white animate-pulse' :
                      cam.status === 'Heavy Traffic' ? 'bg-amber-600/90 text-white' :
                      'bg-emerald-600/90 text-white'
                    }`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                      <span>{cam.status}</span>
                    </span>
                  </div>

                  <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-md text-[10px] font-mono text-cyan-300 border border-cyan-500/30">
                    ⚡ {cam.speed}
                  </div>

                  {/* Play stream trigger */}
                  <button
                    onClick={() => setActiveCameraModal(cam)}
                    className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs"
                  >
                    <div className="p-2.5 rounded-full bg-emerald-500 text-white shadow-xl transform group-hover:scale-110 transition">
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    </div>
                  </button>
                </div>

                <div className="p-3">
                  <h4 className="font-bold text-xs text-slate-200 truncate">{cam.name}</h4>
                  <p className="text-[11px] text-slate-400 flex items-center space-x-1 mt-0.5">
                    <span>📍 {cam.location}, {cam.state}</span>
                  </p>

                  <div className="mt-2 flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px]">
                    <span className="text-slate-500">{cam.lastUpdate}</span>
                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => {
                          setMapProjectionMode('streetview');
                          setActiveCameraModal(cam);
                        }}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-medium flex items-center space-x-1"
                      >
                        <Compass className="w-3 h-3 text-emerald-400" />
                        <span>360° Street</span>
                      </button>
                      <button
                        onClick={() => setActiveCameraModal(cam)}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium flex items-center space-x-1"
                      >
                        <Video className="w-3 h-3" />
                        <span>Stream</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 3: NER EMERGENCY BULLETINS */}
        <div className="space-y-3 pt-2 border-t border-slate-800">
          <div className="bg-amber-950/40 border border-amber-500/30 p-3 rounded-lg">
            <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs mb-1">
              <Radio className="w-4 h-4 animate-pulse" />
              <span>NER Emergency Bulletins</span>
            </div>
            <p className="text-xs text-amber-200/90 font-medium leading-relaxed">
              IMD Red Alert for East Khasi Hills & Dima Hasao. Soil saturation exceeds 85% on NH-6 & NH-10.
            </p>
          </div>

          <div className="space-y-2">
            {NER_EMERGENCY_BULLETINS.map((news) => (
              <div key={news.id} className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg space-y-1">
                <div className="flex items-center justify-between">
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${
                    news.urgent ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}>
                    {news.category}
                  </span>
                  <span className="text-[10px] text-slate-500">{news.timestamp}</span>
                </div>
                <h4 className="text-xs font-medium text-slate-200 leading-snug">{news.title}</h4>
                <p className="text-[10px] text-slate-400">Source: {news.source}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* CCTV LIVE STREAM MODAL OVERLAY */}
      {activeCameraModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl">
            <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <h3 className="font-bold text-sm text-slate-100">{activeCameraModal.name}</h3>
              </div>
              <button
                onClick={() => setActiveCameraModal(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
              <CctvCanvasSimulator
                cameraName={activeCameraModal.name}
                highway={activeCameraModal.highway}
                speed={activeCameraModal.speed}
                lat={activeCameraModal.lat}
                lng={activeCameraModal.lng}
              />

              {/* Bottom Metadata Bar & Close Feed Button */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-slate-300 pointer-events-auto">
                <span className="bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700 font-mono text-[11px] text-cyan-300 shadow-lg truncate max-w-[70%]">
                  STREAM FPS: 60 • LAT: {activeCameraModal.lat}°N LON: {activeCameraModal.lng}°E • ELEV: 1,496m • SPEED: {activeCameraModal.speed}
                </span>
                <button
                  onClick={() => setActiveCameraModal(null)}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-lg text-xs transition"
                >
                  Close Feed
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
