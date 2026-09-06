import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { tAuto, tNum } from '../i18n';
import { AlertTriangle, ShieldAlert, Navigation, Users, Clock, CheckCircle2, Flame, ArrowUpRight, HelpCircle, Info } from 'lucide-react';
import { useUIStore, calculateComputedRiskScore } from '../store/uiStore';

export const EmergencyPrioritisationView: React.FC = () => {
  const { incidents, roads, liveTelemetry, acknowledgeAlert } = useUIStore();
  const [showFormulaModal, setShowFormulaModal] = useState(false);

  // Compute live formula score
  const computed = calculateComputedRiskScore(
    liveTelemetry?.rainfallMm || 195.2,
    liveTelemetry?.soilMoisturePct || 87.4,
    34,
    45
  );

  // Ranked Response Priority List
  const priorityList = [
    {
      rank: 1,
      tier: tAuto('URGENT PRIORITISATION'),
      title: tAuto('Debris Flow & Slope Failure — East Khasi Hills (Shillong Bypass NH-06)'),
      location: tAuto('Shillong Corridor (Km 42 Jorabat-Jowai)'),
      riskScore: computed.riskScore,
      severity: computed.severity,
      aiConfidence: computed.aiConfidencePct,
      impact: tAuto('Primary Regional Arterial Highway Blocked (Est. 12,500 daily commuters affected)'),
      action: tAuto('Deploy NDRF Heavy Excavation Unit & SDRF Ground Response Team'),
      status: tAuto('Active Command')
    },
    {
      rank: 2,
      tier: tAuto('HIGH PRIORITY'),
      title: tAuto('Hill Slope Creep & Saturated Soil Slips — Haflong Dima Hasao'),
      location: tAuto('Haflong Town Zone (NH-27 Km 118)'),
      riskScore: 78.4,
      severity: tAuto('High'),
      aiConfidence: 91,
      impact: tAuto('Secondary Rail-Road Corridor Impassable (Lumding-Badarpur Railway Line Watch)'),
      action: tAuto('Activate District Traffic Diversion & Piezometer Telemetry Warning'),
      status: tAuto('En Route')
    },
    {
      rank: 3,
      tier: tAuto('HIGH PRIORITY'),
      title: tAuto('Rockfall Obstruction & Highway Collapse — North Sikkim Corridor'),
      location: tAuto('Mangan-Lachen Axis (NH-10)'),
      riskScore: 74.2,
      severity: tAuto('High'),
      aiConfidence: 89,
      impact: tAuto('Border Defense & Tourist Route Access Reduced to 1 Lane'),
      action: tAuto('Dispatch BRO Clearing Units & Emergency Medical Support'),
      status: tAuto('In Progress')
    },
    {
      rank: 4,
      tier: tAuto('MODERATE PRIORITY'),
      title: tAuto('Residential Slope Instability — Aizawl North Slope (Chaltlang)'),
      location: tAuto('Chaltlang Ridge Rim'),
      riskScore: 56.8,
      severity: tAuto('Moderate'),
      aiConfidence: 85,
      impact: tAuto('Local Settlement Urban Slope Pore Pressure Accumulation'),
      action: tAuto('Issue Precautionary Local Community Advisory & Evacuation Preparedness'),
      status: tAuto('Monitored')
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header & Risk Formula Banner */}
      <div className="flex items-center justify-between flex-wrap gap-4 bg-navy-900/80 border border-navy-800 rounded-2xl p-5 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-ping"></span>
            <h2 className="text-xl font-black text-white tracking-wide">{tAuto('Emergency Response Prioritisation Protocol')}</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {tAuto('Dynamic Incident & Disaster Response Ranking based on Severity, Road Criticality, and Population Vulnerability.')}
          </p>
        </div>

        <button
          onClick={() => setShowFormulaModal(true)}
          className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-sm"
        >
          <Info className="w-4 h-4" />
          <span>ℹ️ {tAuto('How Risk Score is Calculated')}</span>
        </button>
      </div>

      {/* Formula Explanation Modal */}
      {showFormulaModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-navy-900 border border-navy-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-navy-800 pb-3">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
                <ShieldAlert className="w-5 h-5" />
                <span>{tAuto('PRITHVI-SHIELD Explainable Risk Scoring Engine')}</span>
              </div>
              <button 
                onClick={() => setShowFormulaModal(false)}
                className="text-slate-400 hover:text-white font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-slate-300">
              <p>
                {tAuto('PRITHVI-SHIELD uses a Transparent Rules-Based Risk Calculation Engine rather than an unexplainable black box. The live score updates dynamically with real-time IoT sensor telemetry:')}
              </p>

              <div className="bg-navy-950 p-4 rounded-xl border border-navy-800 font-mono text-[11px] text-emerald-300 leading-relaxed">
                <strong>{tAuto('Risk Score Formula:')}</strong>
                <br />
                <code>riskScore = (0.35 × Normalized Rainfall) + (0.35 × Soil Moisture %) + (0.15 × Slope Angle) + (0.15 × Historical Landslide Density)</code>
                <br /><br />
                <strong>{tAuto('AI Confidence Formula:')}</strong>
                <br />
                <code>aiConfidence = Math.min(99, Math.round(72 + (riskScore × 0.25)))</code>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-navy-950 p-2.5 rounded border border-navy-800">
                  <span className="text-slate-400">{tAuto('Current 24h Rainfall:')}</span>
                  <div className="font-bold text-cyan-400 text-sm">{tNum(liveTelemetry?.rainfallMm || 195.2)} mm</div>
                </div>
                <div className="bg-navy-950 p-2.5 rounded border border-navy-800">
                  <span className="text-slate-400">{tAuto('Current Soil Moisture:')}</span>
                  <div className="font-bold text-teal-300 text-sm">{tNum(liveTelemetry?.soilMoisturePct || 87.4)}%</div>
                </div>
                <div className="bg-navy-950 p-2.5 rounded border border-navy-800">
                  <span className="text-slate-400">{tAuto('Computed Risk Score:')}</span>
                  <div className="font-bold text-red-400 text-sm">{tNum(computed.riskScore)} / 100</div>
                </div>
                <div className="bg-navy-950 p-2.5 rounded border border-navy-800">
                  <span className="text-slate-400">{tAuto('AI Confidence:')}</span>
                  <div className="font-bold text-emerald-400 text-sm">{tNum(computed.aiConfidencePct)}%</div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowFormulaModal(false)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs"
              >
                {tAuto('Got It')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Response Priority Cards List */}
      <div className="space-y-4">
        {priorityList.map((item) => (
          <div 
            key={item.rank}
            className={`bg-navy-900/70 border rounded-2xl p-5 transition-all shadow-lg flex flex-col md:flex-row justify-between gap-5 ${
              item.rank === 1 ? 'border-red-500/50 bg-red-950/10' : 'border-navy-800'
            }`}
          >
            <div className="space-y-2 flex-1">
              <div className="flex items-center space-x-3 flex-wrap gap-2">
                <span className={`px-3 py-1 rounded-xl text-xs font-black tracking-wider ${
                  item.rank === 1 ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-800 text-slate-200'
                }`}>
                  RANK #{tNum(item.rank)} — {item.tier}
                </span>

                <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
                  📍 {item.location}
                </span>
              </div>

              <h3 className="text-base font-extrabold text-white">{item.title}</h3>

              <p className="text-xs text-slate-300 leading-relaxed">
                <strong>{tAuto('Infrastructure Impact:')}</strong> {item.impact}
              </p>

              <div className="bg-navy-950/80 p-3 rounded-xl border border-navy-800 text-xs text-emerald-300 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><strong>{tAuto('Recommended Action:')}</strong> {item.action}</span>
              </div>
            </div>

            {/* Right Risk Metrics */}
            <div className="flex md:flex-col justify-between items-end gap-3 shrink-0 border-t md:border-t-0 md:border-l border-navy-800 pt-3 md:pt-0 md:pl-5">
              <div className="text-right">
                <div className="text-[10px] text-slate-400 uppercase font-bold">{tAuto('COMPUTED RISK SCORE')}</div>
                <div className="text-2xl font-black text-red-400">{tNum(item.riskScore)} <span className="text-xs text-slate-500">/100</span></div>
              </div>

              <div className="text-right">
                <div className="text-[10px] text-slate-400 uppercase font-bold">{tAuto('AI MODEL CONFIDENCE')}</div>
                <div className="text-sm font-bold text-emerald-400">{tNum(item.aiConfidence)}%</div>
              </div>

              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-mono font-bold">
                {item.status}
              </span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

