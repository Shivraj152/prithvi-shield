import React from 'react';
import { useTranslation } from 'react-i18next';
import { tAuto } from '../i18n';
import { Cpu, CheckCircle, Clock } from 'lucide-react';

export const ArchitectureRoadmapView: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-navy-900/80 border border-navy-800 rounded-2xl p-6 shadow-xl space-y-2">
        <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
          <Cpu className="w-4 h-4" />
          <span>{tAuto(t('arch_banner_tag', 'SYSTEM ARCHITECTURE & PRODUCTION ROADMAP'))}</span>
        </div>
        <h2 className="text-xl font-black text-white tracking-wide">{tAuto(t('arch_title', 'PRITHVI-SHIELD Prototype Scope & Production Deployment Path'))}</h2>
        <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
          {tAuto(t('arch_desc', 'Honest technical breakdown of active features implemented in this prototype vs. planned integrations for full state/national government deployment.'))}
        </p>
      </div>

      {/* Grid Comparison: Implemented Now vs Production Path */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Column 1: Implemented in Prototype */}
        <div className="bg-navy-900/60 border border-emerald-500/30 rounded-2xl p-5 space-y-4 shadow-lg">
          <div className="flex items-center space-x-2 border-b border-navy-800 pb-3">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <h3 className="font-extrabold text-sm text-white">{tAuto(t('arch_col1_title', '1. Active Prototype Features'))}</h3>
          </div>

          <div className="space-y-3 text-xs text-slate-300">
            <div className="bg-navy-950 p-3 rounded-xl border border-navy-800 space-y-1">
              <span className="font-bold text-emerald-300">🌐 {tAuto(t('arch_feat_1', 'Real-Time Open-Meteo Weather API Integration'))}</span>
              <p className="text-[11px] text-slate-400">
                {tAuto(t('arch_feat_1_desc', 'Queries live temperature, humidity, precipitation (mm), and wind speed for any location in India via Open-Meteo REST API.'))}
              </p>
            </div>

            <div className="bg-navy-950 p-3 rounded-xl border border-navy-800 space-y-1">
              <span className="font-bold text-emerald-300">🔊 {tAuto(t('arch_feat_2', 'In-Browser Real-Time Siren & Toast Warning System (Active)'))}</span>
              <p className="text-[11px] text-slate-400">
                {tAuto(t('arch_feat_2_desc', 'Dispatches instant visual alert popups across all pages with audio siren sounds and emergency warning emails to subscribed users when high-risk warnings occur.'))}
              </p>
            </div>

            <div className="bg-navy-950 p-3 rounded-xl border border-navy-800 space-y-1">
              <span className="font-bold text-emerald-300">🤖 {tAuto(t('arch_feat_3', 'Google Gemini AI Hazard Summary Endpoint'))}</span>
              <p className="text-[11px] text-slate-400">
                {tAuto(t('arch_feat_3_desc', 'Backend Proxy (POST /alerts/ai-location-risk) invokes Gemini AI model to generate concise location risk assessments.'))}
              </p>
            </div>

            <div className="bg-navy-950 p-3 rounded-xl border border-navy-800 space-y-1">
              <span className="font-bold text-emerald-300">💾 {tAuto(t('arch_feat_4', 'Offline IndexedDB Queue & Low-Network Sync'))}</span>
              <p className="text-[11px] text-slate-400">
                {tAuto(t('arch_feat_4_desc', 'Citizen photo reports submitted offline are queued in browser IndexedDB and automatically synchronized when connection restores.'))}
              </p>
            </div>

            <div className="bg-navy-950 p-3 rounded-xl border border-navy-800 space-y-1">
              <span className="font-bold text-emerald-300">🗺️ {tAuto(t('arch_feat_5', 'Leaflet GIS Mapping & Osiris India Layers'))}</span>
              <p className="text-[11px] text-slate-400">
                {tAuto(t('arch_feat_5_desc', 'Interactive GIS map supporting 6 NER layers, CCTV camera modals, heatmaps, and geocoded location search.'))}
              </p>
            </div>
          </div>
        </div>

        {/* Column 2: Production Roadmap Path */}
        <div className="bg-navy-900/60 border border-cyan-500/30 rounded-2xl p-5 space-y-4 shadow-lg">
          <div className="flex items-center space-x-2 border-b border-navy-800 pb-3">
            <Clock className="w-5 h-5 text-cyan-400" />
            <h3 className="font-extrabold text-sm text-white">{tAuto(t('arch_col2_title', '2. Production Roadmap Path'))}</h3>
          </div>

          <div className="space-y-3 text-xs text-slate-300">
            <div className="bg-navy-950 p-3 rounded-xl border border-navy-800 space-y-1">
              <span className="font-bold text-cyan-300">📡 {tAuto(t('arch_road_1', 'Direct IMD (India Meteorological Dept) API Integration'))}</span>
              <p className="text-[11px] text-slate-400">
                {tAuto(t('arch_road_1_desc', 'Production path: Direct API pipeline to IMD Doppler Weather Radar (DWR) and automatic weather stations (AWS).'))}
              </p>
            </div>

            <div className="bg-navy-950 p-3 rounded-xl border border-navy-800 space-y-1">
              <span className="font-bold text-cyan-300">🛰️ {tAuto(t('arch_road_2', 'ISRO Bhuvan & Sentinel-2 Satellite Rasters Ingestion'))}</span>
              <p className="text-[11px] text-slate-400">
                {tAuto(t('arch_road_2_desc', 'Production path: Automated InSAR radar interferometry pipelines for detecting mm-scale slope displacement.'))}
              </p>
            </div>

            <div className="bg-navy-950 p-3 rounded-xl border border-navy-800 space-y-1">
              <span className="font-bold text-cyan-300">📱 {tAuto(t('arch_road_3', 'NIC / CDAC Cellular SMS & Push Gateway (Paused)'))}</span>
              <p className="text-[11px] text-slate-400">
                {tAuto(t('arch_road_3_desc', 'Production path: Cellular SMS & Push broadcasts are paused pending security review. Planned integration with TRAI cell broadcast infrastructure.'))}
              </p>
            </div>

            <div className="bg-navy-950 p-3 rounded-xl border border-navy-800 space-y-1">
              <span className="font-bold text-cyan-300">🧠 {tAuto(t('arch_road_4', 'Trained Deep Learning Landslide Prediction Model'))}</span>
              <p className="text-[11px] text-slate-400">
                {tAuto(t('arch_road_4_desc', 'Production path: Spatial ConvLSTM / XGBoost model trained on 20+ years of GSI historical records.'))}
              </p>
            </div>

            <div className="bg-navy-950 p-3 rounded-xl border border-navy-800 space-y-1">
              <span className="font-bold text-cyan-300">☁️ {tAuto(t('arch_road_5', 'Multi-Region AWS / NIC Cloud Infrastructure'))}</span>
              <p className="text-[11px] text-slate-400">
                {tAuto(t('arch_road_5_desc', 'Production path: High-availability Kubernetes cluster with offline edge gateways deployed at District Emergency Operation Centers (DEOC).'))}
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
