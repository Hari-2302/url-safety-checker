import React, { useState } from 'react';
import { Terminal, ArrowRight, CheckCircle2, XCircle, Code2, ChevronDown, ChevronUp } from 'lucide-react';

export default function StepTraceViewer({ stepTrace = [], componentTransitions = [] }) {
  const [viewMode, setViewMode] = useState('components'); // 'components' or 'micro'

  return (
    <div className="cyber-panel rounded-xl p-5 border border-cyber-700">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-cyber-800 gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold font-mono tracking-wide text-white uppercase">
              Automata Execution Trace & Step-by-Step Log
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Programmatic validation logs generated during lexical parsing
            </p>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center space-x-1 bg-cyber-900 p-1 rounded-lg border border-cyber-800 text-xs font-mono">
          <button
            onClick={() => setViewMode('components')}
            className={`px-2.5 py-1 rounded transition-all ${
              viewMode === 'components' ? 'bg-cyber-cyan/20 text-cyber-cyan font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Component Macro-States
          </button>
          <button
            onClick={() => setViewMode('micro')}
            className={`px-2.5 py-1 rounded transition-all ${
              viewMode === 'micro' ? 'bg-cyber-cyan/20 text-cyber-cyan font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Granular Step Log ({stepTrace.length})
          </button>
        </div>
      </div>

      {/* Component Transitions Cards */}
      {viewMode === 'components' ? (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {componentTransitions.map((item, idx) => (
            <div 
              key={idx}
              className="p-3.5 rounded-lg bg-cyber-900/80 border border-cyber-800 hover:border-cyber-cyan/40 transition-all font-mono"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider">{item.component}</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/30">
                  {item.from} ➔ {item.to}
                </span>
              </div>
              <div className="text-sm font-bold text-white break-all bg-cyber-950 p-2 rounded border border-cyber-850">
                {item.token || '<empty>'}
              </div>
              <div className="mt-2 text-[11px] text-slate-300 flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3 text-cyber-emerald" />
                <span>{item.description || 'Valid component syntax'}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Granular Step List */
        <div className="mt-4 space-y-2 font-mono text-xs max-h-72 overflow-y-auto pr-1">
          {stepTrace.map((st, idx) => {
            const isReject = st.to === 'qReject';
            const isAccept = st.to === 'q4';

            return (
              <div 
                key={idx}
                className={`p-2.5 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                  isReject ? 'bg-cyber-rose/10 border-cyber-rose/30 text-rose-300' :
                  isAccept ? 'bg-cyber-emerald/10 border-cyber-emerald/30 text-emerald-300' :
                  'bg-cyber-900/60 border-cyber-800 text-slate-300'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <span className="w-6 h-6 rounded bg-cyber-950 flex items-center justify-center text-[10px] font-bold text-slate-400 border border-cyber-800">
                    #{st.step || idx + 1}
                  </span>
                  <div className="flex items-center space-x-1.5 font-bold">
                    <span>{st.from}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-cyber-cyan" />
                    <span className={isReject ? 'text-cyber-rose' : (isAccept ? 'text-cyber-emerald' : 'text-cyber-cyan')}>
                      {st.to}
                    </span>
                  </div>
                  <span className="text-slate-400 hidden md:inline">|</span>
                  <code className="bg-cyber-950 px-2 py-0.5 rounded text-white text-[11px]">
                    {st.rule || `δ(${st.from}, "${st.token}") = ${st.to}`}
                  </code>
                </div>

                <div className="text-[11px] text-slate-400 font-sans">
                  {st.note || st.description}
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
