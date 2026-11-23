import React, { useState, useEffect } from 'react';
import { 
  Activity, Shield, ShieldCheck, ShieldAlert, AlertTriangle, 
  Terminal, Cpu, History, ArrowRight, RefreshCw, ExternalLink, 
  Search, Lock, CheckCircle2, Globe, Database 
} from 'lucide-react';
import { getStats } from '../services/api';
import RiskBadge from '../components/RiskBadge';

export default function Dashboard({ setActivePage, setSharedUrl }) {
  const [stats, setStats] = useState({
    total: 0,
    safeCount: 0,
    mediumCount: 0,
    highCount: 0,
    recent: [],
    dbStatus: 'CONNECTING'
  });
  const [loading, setLoading] = useState(true);
  const [quickInput, setQuickInput] = useState('');

  const loadData = async () => {
    setLoading(true);
    const res = await getStats();
    if (res.success && res.data) {
      setStats(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleQuickScan = (e) => {
    e.preventDefault();
    if (quickInput.trim()) {
      setSharedUrl(quickInput.trim());
      setActivePage('analyzer');
    }
  };

  const sampleUrls = [
    { label: 'Google Search (Benign)', url: 'https://www.google.com', type: 'safe' },
    { label: 'Userinfo Spoofing Phish', url: 'http://paypal.com@evil-site.com/signin', type: 'threat' },
    { label: 'Raw IP Host Authority', url: 'http://192.168.1.1/login', type: 'suspicious' },
    { label: 'Known URL Shortener', url: 'https://bit.ly/3xY7zSecure', type: 'suspicious' },
    { label: 'Punycode Homograph', url: 'https://xn--pple-43d.com/login', type: 'threat' }
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Hero / Executive Header */}
      <div className="cyber-panel-glow rounded-2xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-cyber-cyan/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="max-w-3xl">
          <div className="flex items-center space-x-2 text-cyber-cyan font-mono text-xs uppercase tracking-wider mb-2">
            <span className="w-2 h-2 rounded-full bg-cyber-cyan animate-pulse"></span>
            <span>Security Operations Center • Active Telemetry</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-mono">
            CYBER URL SAFETY & AUTOMATA CHECKER
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed font-sans">
            Enterprise-grade URL verification synthesizing formal 
            <span className="text-cyber-cyan font-mono font-semibold"> Deterministic Finite Automata (DFA)</span>, 
            RFC 3986 Regular Expressions, and algorithmic phishing evasion detection.
          </p>

          {/* Quick Scan Input */}
          <form onSubmit={handleQuickScan} className="mt-6 flex flex-col sm:flex-row gap-2 max-w-2xl">
            <div className="relative flex-1">
              <Terminal className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input 
                type="text" 
                placeholder="Enter URL to inspect (e.g. https://www.google.com)..."
                value={quickInput}
                onChange={(e) => setQuickInput(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-cyber-950/90 border border-cyber-700 text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyber-cyan shadow-inner"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-cyber-cyan hover:bg-cyan-400 text-cyber-950 font-bold font-mono text-sm transition-all flex items-center justify-center space-x-2 shadow-[0_0_20px_rgba(6,182,212,0.4)]"
            >
              <span>Analyze URL</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Sample Pills */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">Sample Demos:</span>
            {sampleUrls.map((s, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSharedUrl(s.url);
                  setActivePage('analyzer');
                }}
                className={`px-2.5 py-1 rounded-md text-xs font-mono transition-all border ${
                  s.type === 'safe' ? 'bg-cyber-emerald/10 border-cyber-emerald/30 text-cyber-emerald hover:bg-cyber-emerald/20' :
                  s.type === 'threat' ? 'bg-cyber-rose/10 border-cyber-rose/30 text-cyber-rose hover:bg-cyber-rose/20' :
                  'bg-cyber-amber/10 border-cyber-amber/30 text-cyber-amber hover:bg-cyber-amber/20'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Total Scans */}
        <div className="cyber-panel rounded-xl p-5 border border-cyber-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Total Analyzed</span>
            <div className="p-2 rounded-lg bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/30">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold font-mono text-white">
            {stats.total}
          </div>
          <div className="mt-1 text-xs text-slate-400 font-mono flex items-center space-x-1">
            <Database className="w-3 h-3 text-cyber-cyan" />
            <span>MongoDB Logged Records</span>
          </div>
        </div>

        {/* Metric 2: Safe URLs */}
        <div className="cyber-panel rounded-xl p-5 border border-cyber-emerald/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-cyber-emerald">Safe / Low Risk</span>
            <div className="p-2 rounded-lg bg-cyber-emerald/10 text-cyber-emerald border border-cyber-emerald/30">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold font-mono text-cyber-emerald">
            {stats.safeCount}
          </div>
          <div className="mt-1 text-xs text-slate-400 font-mono">
            {stats.total > 0 ? `${Math.round((stats.safeCount / stats.total) * 100)}% of total scans` : 'Awaiting scans'}
          </div>
        </div>

        {/* Metric 3: Suspicious URLs */}
        <div className="cyber-panel rounded-xl p-5 border border-cyber-amber/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-cyber-amber">Suspicious URLs</span>
            <div className="p-2 rounded-lg bg-cyber-amber/10 text-cyber-amber border border-cyber-amber/30">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold font-mono text-cyber-amber">
            {stats.mediumCount}
          </div>
          <div className="mt-1 text-xs text-slate-400 font-mono">
            Elevated Heuristics Observed
          </div>
        </div>

        {/* Metric 4: High / Critical Threat URLs */}
        <div className="cyber-panel rounded-xl p-5 border border-cyber-rose/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-cyber-rose">Threat / Rejected</span>
            <div className="p-2 rounded-lg bg-cyber-rose/10 text-cyber-rose border border-cyber-rose/30">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold font-mono text-cyber-rose">
            {stats.highCount}
          </div>
          <div className="mt-1 text-xs text-slate-400 font-mono">
            Phishing / Trap State Violations
          </div>
        </div>

      </div>

      {/* Main Split: Recent Activity vs Automata Architecture */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Recent Activity Feed */}
        <div className="lg:col-span-2 cyber-panel rounded-xl p-6 border border-cyber-700">
          <div className="flex items-center justify-between pb-4 border-b border-cyber-800">
            <div className="flex items-center space-x-2">
              <History className="w-4 h-4 text-cyber-cyan" />
              <h3 className="text-sm font-bold font-mono tracking-wide text-white uppercase">
                Recent Analysis Activity
              </h3>
            </div>
            <button
              onClick={() => setActivePage('history')}
              className="text-xs font-mono text-cyber-cyan hover:underline flex items-center space-x-1"
            >
              <span>View Full History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-4 space-y-3 font-mono text-xs">
            {stats.recent && stats.recent.length > 0 ? (
              stats.recent.map((item, idx) => (
                <div 
                  key={idx}
                  onClick={() => {
                    setSharedUrl(item.url);
                    setActivePage('analyzer');
                  }}
                  className="p-3 rounded-lg bg-cyber-900/60 border border-cyber-800 hover:border-cyber-cyan/40 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <Globe className="w-4 h-4 text-slate-400 shrink-0" />
                    <div className="truncate">
                      <div className="text-white font-semibold truncate hover:text-cyber-cyan">
                        {item.url}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Domain: {item.domain || 'N/A'} • {new Date(item.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <RiskBadge level={item.riskLevel} statusLabel={item.statusLabel} score={item.riskScore} size="sm" />
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-slate-400 font-mono">
                No recent activity recorded yet. Run your first analysis above!
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Theoretical Automata Quick Info */}
        <div className="cyber-panel rounded-xl p-6 border border-cyber-700 space-y-4 font-mono text-xs">
          <div className="flex items-center space-x-2 pb-3 border-b border-cyber-800 text-white font-bold">
            <Cpu className="w-4 h-4 text-cyber-cyan" />
            <span className="uppercase">DFA Engine Specifications</span>
          </div>

          <p className="text-slate-300 leading-relaxed font-sans text-xs">
            The scanner executes a Deterministic Finite Automaton $M = (Q, \Sigma, \delta, q_0, F)$ 
            modeling the regular sub-language of valid Web URIs.
          </p>

          <div className="space-y-2 bg-cyber-950 p-3 rounded-lg border border-cyber-850">
            <div className="flex justify-between text-slate-400">
              <span>Start State:</span>
              <span className="text-cyber-cyan font-bold">q0 (Scheme await)</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Accepting Set (F):</span>
              <span className="text-cyber-emerald font-bold">&#123; q4 &#125; (TLD Validated)</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Trap State:</span>
              <span className="text-cyber-rose font-bold">qReject (Syntax Violation)</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Alphabet:</span>
              <span className="text-white">ASCII RFC 3986 classes</span>
            </div>
          </div>

          <button
            onClick={() => setActivePage('automata')}
            className="w-full py-2.5 rounded-lg bg-cyber-800 hover:bg-cyber-700 text-white font-bold transition-all border border-cyber-600 flex items-center justify-center space-x-2"
          >
            <Cpu className="w-4 h-4 text-cyber-cyan" />
            <span>Open Automata Visualizer</span>
          </button>
        </div>

      </div>

    </div>
  );
}
