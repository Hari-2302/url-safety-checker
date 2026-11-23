import React, { useState, useEffect } from 'react';
import { Shield, ShieldAlert, ShieldCheck, Activity, Terminal, Database, Cpu, History, Info, Layers, RefreshCw } from 'lucide-react';
import { checkBackendHealth } from '../services/api';

export default function Navbar({ activePage, setActivePage }) {
  const [dbStatus, setDbStatus] = useState('checking');

  useEffect(() => {
    let isMounted = true;
    async function check() {
      const res = await checkBackendHealth();
      if (isMounted) {
        if (res.status === 'online') {
          setDbStatus(res.database?.connected ? 'connected' : 'fallback');
        } else {
          setDbStatus('offline');
        }
      }
    }
    check();
    const interval = setInterval(check, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'analyzer', label: 'URL Analyzer', icon: Terminal },
    { id: 'history', label: 'Analysis History', icon: History },
    { id: 'automata', label: 'Automata Visualization', icon: Cpu },
    { id: 'about', label: 'About Project', icon: Info },
  ];

  return (
    <header className="sticky top-0 z-50 bg-cyber-900/90 backdrop-blur-md border-b border-cyber-700/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <div 
          onClick={() => setActivePage('dashboard')}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-lg bg-cyber-850 border border-cyber-cyan/40 flex items-center justify-center group-hover:border-cyber-cyan transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <Shield className="w-6 h-6 text-cyber-cyan group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold tracking-wider text-lg text-white font-mono">
                URL<span className="text-cyber-cyan">SENTINEL</span>
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/30">
                DFA 2.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono tracking-tight">Cyber Threat & Automata Engine</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-mono transition-all ${
                  isActive
                    ? 'bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/40 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-cyber-850/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyber-cyan' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Backend & DB Status Pill */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-cyber-850 border border-cyber-700 text-xs font-mono">
            <Database className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] text-slate-400 hidden sm:inline">DB:</span>
            {dbStatus === 'connected' && (
              <span className="flex items-center space-x-1.5 text-cyber-emerald">
                <span className="w-2 h-2 rounded-full bg-cyber-emerald animate-pulse"></span>
                <span className="text-[11px] font-semibold">MongoDB Live</span>
              </span>
            )}
            {dbStatus === 'fallback' && (
              <span className="flex items-center space-x-1.5 text-cyber-amber">
                <span className="w-2 h-2 rounded-full bg-cyber-amber"></span>
                <span className="text-[11px] font-semibold">Local Store</span>
              </span>
            )}
            {dbStatus === 'offline' && (
              <span className="flex items-center space-x-1.5 text-cyber-rose">
                <span className="w-2 h-2 rounded-full bg-cyber-rose"></span>
                <span className="text-[11px] font-semibold">Offline</span>
              </span>
            )}
            {dbStatus === 'checking' && (
              <span className="flex items-center space-x-1 text-slate-400">
                <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                <span className="text-[10px]">Syncing...</span>
              </span>
            )}
          </div>
        </div>

      </div>

      {/* Mobile Nav Bar */}
      <div className="md:hidden flex overflow-x-auto border-t border-cyber-800 bg-cyber-950 px-2 py-1.5 space-x-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-mono whitespace-nowrap ${
                isActive ? 'bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/40' : 'text-slate-400'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
