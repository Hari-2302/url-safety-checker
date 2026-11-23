import React, { useState } from 'react';
import { Layers, Search, Filter, Cpu } from 'lucide-react';
import { TRANSITION_TABLE_DATA } from '../utils/dfaEngine';

export default function TransitionTableViewer({ customTransitions = null }) {
  const [filterState, setFilterState] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const tableData = customTransitions || TRANSITION_TABLE_DATA;

  const filtered = tableData.filter(row => {
    const matchesState = filterState === 'ALL' || row.currentState === filterState || row.nextState === filterState;
    const matchesSearch = row.input.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          row.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          row.currentState.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesState && matchesSearch;
  });

  const stateFilters = ['ALL', 'q0', 'q1', 'q2', 'q3', 'q4', 'qReject'];

  return (
    <div className="cyber-panel rounded-xl p-5 border border-cyber-700">
      
      {/* Table Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-cyber-800 gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold font-mono tracking-wide text-white uppercase">
              Automata Transition Table (δ Function Matrix)
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Academic Mapping δ: Q × Σ ➔ Q
            </p>
          </div>
        </div>

        {/* Search & State Filter */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input 
              type="text" 
              placeholder="Search token / rule..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg bg-cyber-900 border border-cyber-700 text-xs font-mono text-white focus:outline-none focus:border-cyber-cyan w-40 sm:w-48"
            />
          </div>
        </div>
      </div>

      {/* State Filter Buttons */}
      <div className="flex items-center space-x-1.5 overflow-x-auto py-3 border-b border-cyber-800/80">
        <span className="text-[11px] font-mono text-slate-400 mr-2 flex items-center space-x-1">
          <Filter className="w-3 h-3" />
          <span>Filter:</span>
        </span>
        {stateFilters.map((st) => (
          <button
            key={st}
            onClick={() => setFilterState(st)}
            className={`px-2.5 py-1 rounded text-xs font-mono transition-all ${
              filterState === st
                ? 'bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/40 font-bold'
                : 'text-slate-400 hover:text-white bg-cyber-900/60 border border-cyber-800'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto mt-2">
        <table className="w-full text-left font-mono text-xs">
          <thead>
            <tr className="border-b border-cyber-800 text-slate-400 text-[11px] uppercase tracking-wider bg-cyber-900/50">
              <th className="py-2.5 px-3">Current State (q)</th>
              <th className="py-2.5 px-3">Input Symbol / Token (σ)</th>
              <th className="py-2.5 px-3">Next State δ(q, σ)</th>
              <th className="py-2.5 px-3">State Semantics & Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cyber-800/60">
            {filtered.map((row, idx) => {
              const isAccepting = row.nextState === 'q4';
              const isRejecting = row.nextState === 'qReject';

              return (
                <tr key={idx} className="hover:bg-cyber-850/60 transition-colors">
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded font-bold bg-cyber-800 text-cyan-300 border border-cyber-700">
                      {row.currentState}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-200">
                    <code className="text-cyber-cyan bg-cyber-900/90 px-1.5 py-0.5 rounded border border-cyber-800">
                      {row.input}
                    </code>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded font-bold ${
                      isAccepting ? 'bg-cyber-emerald/20 text-cyber-emerald border border-cyber-emerald/40' :
                      isRejecting ? 'bg-cyber-rose/20 text-cyber-rose border border-cyber-rose/40' :
                      'bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/30'
                    }`}>
                      {row.nextState}
                      {isAccepting && ' [F]'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-300 text-xs">
                    {row.description}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}
