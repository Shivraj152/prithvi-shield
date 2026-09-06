import React, { useState } from 'react';
import { ShieldAlert, Users, Radio, Building2, ShieldCheck, ArrowRight, Lock } from 'lucide-react';
import { useUIStore, type User } from '../store/uiStore';

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { setUser } = useUIStore();
  const [name, setName] = useState<string>('Shivraj (Officer)');
  const [email, setEmail] = useState<string>('officer@prithvi.gov.in');
  const [selectedRole, setSelectedRole] = useState<string>('SDMA Super Admin');

  if (!isOpen) return null;

  const roles = [
    {
      id: 'Citizen',
      title: 'Citizen / Community',
      badge: 'Public Portal',
      icon: Users,
      color: 'from-blue-500/20 to-cyan-500/10 border-blue-500/30 text-blue-400',
      description: 'Public hazard reports, live weather alerts, highway status & evacuation routes.'
    },
    {
      id: 'Field Officer',
      title: 'Field Officer / First Responder',
      badge: 'Operational',
      icon: Radio,
      color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400',
      description: 'On-ground observations, sensor telemetry monitoring & hazard verification.'
    },
    {
      id: 'District Administrator',
      title: 'District Administrator',
      badge: 'Regional Admin',
      icon: Building2,
      color: 'from-purple-500/20 to-indigo-500/10 border-purple-500/30 text-purple-400',
      description: 'District road closures, hazard report approval & localized alert dispatch.'
    },
    {
      id: 'SDMA Super Admin',
      title: 'SDMA Super Admin',
      badge: 'Master Command',
      icon: ShieldCheck,
      color: 'from-red-500/20 to-rose-500/10 border-red-500/30 text-red-400',
      description: 'Full regional command hub, multi-district override & high-severity warning dispatch.'
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: User = {
      id: selectedRole === 'Citizen' ? 4 : selectedRole === 'Field Officer' ? 3 : selectedRole === 'District Administrator' ? 2 : 1,
      name: name || 'Operator',
      email: email || 'user@prithvi.gov.in',
      phone: '+919999999999',
      role: selectedRole,
      preferred_language: 'en'
    };
    setUser(newUser);
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl space-y-0">
        
        {/* Header */}
        <div className="p-6 bg-slate-950 border-b border-slate-800 flex items-center space-x-4">
          <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-center text-emerald-400 shadow-inner">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-white tracking-wide">PRITHVI-SHIELD Portal Access</h2>
              <span className="px-2 py-0.5 bg-slate-800 text-slate-300 text-[10px] font-mono font-bold rounded border border-slate-700">MOCK AUTH</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Select your role to access role-tailored dashboards and operational controls.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Identity Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Your Name / Call Sign</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Officer Shivraj"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Official Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="e.g. officer@prithvi.gov.in"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
              />
            </div>
          </div>

          {/* Role Selection Cards */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>Select Operational Role</span>
              <span className="text-[11px] font-normal text-slate-400">Controls UI permissions & landing view</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {roles.map(r => {
                const Icon = r.icon;
                const isSelected = selectedRole === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedRole(r.id)}
                    className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between space-y-2 relative overflow-hidden ${
                      isSelected
                        ? `bg-gradient-to-br ${r.color} ring-2 ring-emerald-500/50 shadow-lg`
                        : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/40 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center space-x-2">
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                        <span className={`font-bold text-xs ${isSelected ? 'text-white' : 'text-slate-200'}`}>{r.title}</span>
                      </div>
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${isSelected ? 'bg-black/40 text-emerald-300 border-emerald-500/40' : 'bg-slate-900 text-slate-500 border-slate-800'}`}>
                        {r.badge}
                      </span>
                    </div>

                    <p className={`text-[11px] leading-relaxed ${isSelected ? 'text-slate-200' : 'text-slate-400'}`}>
                      {r.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Action Button */}
          <div className="pt-2 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Lock className="w-3 h-3 text-slate-400" /> Identity saved in browser session
            </span>
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center space-x-2"
            >
              <span>Enter System as {selectedRole}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
