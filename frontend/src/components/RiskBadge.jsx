import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, XCircle, Info } from 'lucide-react';

export default function RiskBadge({ level = 'LOW', statusLabel = 'SAFE-LOOKING', score = 0, size = 'md' }) {
  const normLevel = (level || 'LOW').toUpperCase();

  const configs = {
    LOW: {
      bg: 'bg-cyber-emerald/15',
      border: 'border-cyber-emerald/40',
      text: 'text-cyber-emerald',
      glow: 'shadow-[0_0_15px_rgba(16,185,129,0.25)]',
      icon: ShieldCheck,
      defaultLabel: 'SAFE-LOOKING',
      subtext: 'Low Risk'
    },
    MEDIUM: {
      bg: 'bg-cyber-amber/15',
      border: 'border-cyber-amber/40',
      text: 'text-cyber-amber',
      glow: 'shadow-[0_0_15px_rgba(245,158,11,0.25)]',
      icon: AlertTriangle,
      defaultLabel: 'SUSPICIOUS / ELEVATED RISK',
      subtext: 'Medium Risk'
    },
    HIGH: {
      bg: 'bg-cyber-rose/15',
      border: 'border-cyber-rose/50',
      text: 'text-cyber-rose',
      glow: 'shadow-[0_0_20px_rgba(244,63,94,0.35)]',
      icon: ShieldAlert,
      defaultLabel: 'HIGH RISK / SUSPICIOUS',
      subtext: 'High Risk'
    },
    CRITICAL: {
      bg: 'bg-red-500/20',
      border: 'border-red-500/70',
      text: 'text-red-400',
      glow: 'shadow-[0_0_25px_rgba(239,68,68,0.5)] animate-pulse',
      icon: ShieldAlert,
      defaultLabel: 'CRITICAL RISK / PHISHING DETECTED',
      subtext: 'Critical Threat'
    },
    REJECTED: {
      bg: 'bg-slate-700/30',
      border: 'border-slate-500/50',
      text: 'text-slate-300',
      glow: 'shadow-[0_0_10px_rgba(148,163,184,0.2)]',
      icon: XCircle,
      defaultLabel: 'MALFORMED SYNTAX / REJECTED',
      subtext: 'Invalid URL'
    }
  };

  const key = normLevel === 'CRITICAL' && statusLabel?.includes('MALFORMED') ? 'REJECTED' : (configs[normLevel] ? normLevel : 'LOW');
  const cfg = configs[key];
  const Icon = cfg.icon;

  if (size === 'sm') {
    return (
      <span className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium ${cfg.bg} ${cfg.border} border ${cfg.text} ${cfg.glow}`}>
        <Icon className="w-3.5 h-3.5" />
        <span>{statusLabel || cfg.defaultLabel}</span>
      </span>
    );
  }

  return (
    <div className={`p-4 rounded-xl border ${cfg.bg} ${cfg.border} ${cfg.glow} transition-all`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-2.5 rounded-lg bg-cyber-900/80 border ${cfg.border}`}>
            <Icon className={`w-7 h-7 ${cfg.text}`} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className={`text-base font-extrabold tracking-wider font-mono ${cfg.text}`}>
                {statusLabel || cfg.defaultLabel}
              </span>
            </div>
            <p className="text-xs text-slate-300 font-mono mt-0.5">
              Risk Level: <span className="font-semibold text-white">{cfg.subtext}</span>
            </p>
          </div>
        </div>

        {/* Score Ring / Pill */}
        <div className="text-right">
          <div className="text-2xl font-black font-mono tracking-tight text-white">
            {score}<span className="text-xs text-slate-400 font-normal">/100</span>
          </div>
          <div className="text-[10px] uppercase font-mono tracking-widest text-slate-400">
            Threat Score
          </div>
        </div>
      </div>
    </div>
  );
}
