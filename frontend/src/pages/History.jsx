import React, { useState, useEffect } from 'react';
import { 
  History as HistoryIcon, Search, Filter, Trash2, ExternalLink, 
  RefreshCw, CheckCircle2, AlertTriangle, ShieldAlert, Download,
  Layers, ChevronLeft, ChevronRight, Eye, Globe
} from 'lucide-react';
import { getHistory, deleteHistoryItem, clearAllHistory } from '../services/api';
import RiskBadge from '../components/RiskBadge';

export default function HistoryPage({ onSelectUrl }) {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 15, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);

  const fetchRecords = async (page = 1) => {
    setLoading(true);
    const res = await getHistory({
      page,
      limit: 15,
      search: search.trim() || undefined,
      riskLevel: riskFilter || undefined
    });

    if (res.success && res.data) {
      setItems(res.data);
      if (res.meta) setMeta(res.meta);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRecords(1);
  }, [riskFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRecords(1);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (confirm('Delete this analysis record from database?')) {
      await deleteHistoryItem(id);
      fetchRecords(meta.page);
    }
  };

  const handleClearAll = async () => {
    if (confirm('Are you sure you want to clear the entire analysis history in MongoDB?')) {
      await clearAllHistory();
      fetchRecords(1);
    }
  };

  const exportToJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(items, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `url_analysis_history_${Date.now()}.json`);
    dlAnchorElem.click();
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Page Header */}
      <div className="cyber-panel rounded-2xl p-6 sm:p-7 border border-cyber-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-cyber-cyan font-mono text-xs uppercase tracking-wider mb-1">
            <HistoryIcon className="w-4 h-4" />
            <span>MongoDB Persistent Records</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-mono text-white tracking-tight">
            ANALYSIS AUDIT TRAIL & LOGS
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-0.5">
            Historical catalog of verified URLs, DFA acceptance trajectories, and calculated threat scores.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 font-mono text-xs">
          <button
            onClick={exportToJson}
            disabled={items.length === 0}
            className="px-3.5 py-2 rounded-lg bg-cyber-850 hover:bg-cyber-800 text-slate-300 border border-cyber-700 flex items-center space-x-1.5 transition-colors disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5 text-cyber-cyan" />
            <span>Export JSON</span>
          </button>
          <button
            onClick={handleClearAll}
            disabled={items.length === 0}
            className="px-3.5 py-2 rounded-lg bg-cyber-900 hover:bg-rose-950/60 text-rose-300 border border-rose-900/40 flex items-center space-x-1.5 transition-colors disabled:opacity-40"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span>Clear All</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="cyber-panel rounded-xl p-4 border border-cyber-700 flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input 
            type="text"
            placeholder="Search by URL or domain..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-cyber-950 border border-cyber-700 text-xs font-mono text-white focus:outline-none focus:border-cyber-cyan"
          />
        </form>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto font-mono text-xs">
          <span className="text-slate-400 text-[11px] mr-1 flex items-center space-x-1">
            <Filter className="w-3 h-3" />
            <span>Risk:</span>
          </span>
          {[
            { label: 'All', val: '' },
            { label: 'Low', val: 'LOW' },
            { label: 'Medium', val: 'MEDIUM' },
            { label: 'High', val: 'HIGH' },
            { label: 'Critical', val: 'CRITICAL' }
          ].map((f) => (
            <button
              key={f.val}
              onClick={() => setRiskFilter(f.val)}
              className={`px-2.5 py-1 rounded text-xs transition-all ${
                riskFilter === f.val 
                  ? 'bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/40 font-bold'
                  : 'text-slate-400 bg-cyber-900 border border-cyber-800 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
          <button
            onClick={() => fetchRecords(meta.page)}
            className="p-1.5 rounded bg-cyber-850 hover:bg-cyber-800 border border-cyber-700 text-slate-300 ml-2"
            title="Refresh list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

      </div>

      {/* History Items Table / List */}
      <div className="cyber-panel rounded-xl border border-cyber-700 overflow-hidden font-mono text-xs">
        {loading ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-cyber-cyan" />
            <p>Fetching records from MongoDB...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <HistoryIcon className="w-8 h-8 mx-auto text-slate-600" />
            <p className="text-white font-bold">No analysis records found.</p>
            <p className="text-xs text-slate-500 font-sans">
              Enter a URL in the Analyzer tab to run and persist your first verification.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-cyber-800 bg-cyber-900/70 text-slate-400 text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">URL & Domain</th>
                  <th className="py-3 px-4">DFA State Path</th>
                  <th className="py-3 px-4">Risk Verdict</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyber-800/60">
                {items.map((item) => (
                  <tr 
                    key={item._id}
                    onClick={() => setSelectedRecord(item)}
                    className="hover:bg-cyber-850/60 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap text-[11px]">
                      {new Date(item.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 max-w-xs sm:max-w-md truncate">
                      <div className="font-semibold text-white truncate hover:text-cyber-cyan">
                        {item.url}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center space-x-1 mt-0.5">
                        <Globe className="w-3 h-3" />
                        <span>Domain: {item.domain || 'N/A'}</span>
                        {item.protocol && <span>• {item.protocol.toUpperCase()}</span>}
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1 text-[11px]">
                        {(item.dfaStateSequence || ['q0', 'q4']).map((st, i) => (
                          <span key={i} className={`px-1.5 py-0.2 rounded ${
                            st === 'q4' ? 'bg-cyber-emerald/20 text-cyber-emerald' :
                            st === 'qReject' ? 'bg-cyber-rose/20 text-cyber-rose' :
                            'bg-cyber-800 text-slate-300'
                          }`}>
                            {st}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <RiskBadge 
                        level={item.riskLevel} 
                        statusLabel={item.statusLabel} 
                        score={item.riskScore} 
                        size="sm" 
                      />
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onSelectUrl) onSelectUrl(item.url);
                          }}
                          className="p-1 rounded bg-cyber-cyan/10 hover:bg-cyber-cyan/20 text-cyber-cyan"
                          title="Re-analyze this URL"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(item._id, e)}
                          className="p-1 rounded bg-rose-950/40 hover:bg-rose-900/60 text-rose-400"
                          title="Delete record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {meta.totalPages > 1 && (
          <div className="p-3 border-t border-cyber-800 flex items-center justify-between text-xs font-mono text-slate-400 bg-cyber-900/40">
            <div>
              Showing page <span className="text-white font-bold">{meta.page}</span> of <span className="text-white font-bold">{meta.totalPages}</span> ({meta.total} records)
            </div>
            <div className="flex items-center space-x-2">
              <button
                disabled={meta.page <= 1}
                onClick={() => fetchRecords(meta.page - 1)}
                className="p-1.5 rounded bg-cyber-850 hover:bg-cyber-800 text-white disabled:opacity-30 border border-cyber-700"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={meta.page >= meta.totalPages}
                onClick={() => fetchRecords(meta.page + 1)}
                className="p-1.5 rounded bg-cyber-850 hover:bg-cyber-800 text-white disabled:opacity-30 border border-cyber-700"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Record Inspection Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="cyber-panel rounded-2xl max-w-2xl w-full p-6 border border-cyber-cyan/40 max-h-[85vh] overflow-y-auto font-mono text-xs space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-cyber-800">
              <span className="text-cyber-cyan font-bold text-sm uppercase">Audit Record Details</span>
              <button 
                onClick={() => setSelectedRecord(null)}
                className="px-2 py-1 rounded bg-cyber-800 text-slate-300 hover:text-white"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 uppercase text-[10px]">Target URL:</span>
              <div className="text-white font-bold text-sm break-all bg-cyber-950 p-2.5 rounded border border-cyber-800">
                {selectedRecord.url}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-2.5 rounded bg-cyber-900 border border-cyber-800">
                <span className="text-slate-400 text-[10px] uppercase">Threat Score:</span>
                <div className="text-white font-bold text-lg mt-0.5">{selectedRecord.riskScore}/100</div>
              </div>
              <div className="p-2.5 rounded bg-cyber-900 border border-cyber-800">
                <span className="text-slate-400 text-[10px] uppercase">Verdict:</span>
                <div className="text-cyber-cyan font-bold mt-0.5">{selectedRecord.statusLabel}</div>
              </div>
            </div>

            <div>
              <span className="text-slate-400 uppercase text-[10px]">DFA Trajectory:</span>
              <div className="flex items-center space-x-1.5 mt-1 bg-cyber-950 p-2.5 rounded border border-cyber-800">
                {(selectedRecord.dfaStateSequence || []).join(' ➔ ')}
                <span className="ml-2 text-cyber-emerald font-bold">
                  ({selectedRecord.dfaAccepted ? 'Accepted' : 'Rejected'})
                </span>
              </div>
            </div>

            {selectedRecord.indicators && selectedRecord.indicators.length > 0 && (
              <div>
                <span className="text-slate-400 uppercase text-[10px]">Indicators:</span>
                <div className="mt-1 space-y-1.5">
                  {selectedRecord.indicators.map((ind, i) => (
                    <div key={i} className="p-2 rounded bg-cyber-900 border border-cyber-amber/30 text-slate-200">
                      <div className="font-bold text-white flex justify-between">
                        <span>{ind.name}</span>
                        <span className="text-cyber-amber">{ind.severity}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-sans mt-0.5">{ind.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => {
                  if (onSelectUrl) onSelectUrl(selectedRecord.url);
                  setSelectedRecord(null);
                }}
                className="px-4 py-2 rounded-lg bg-cyber-cyan hover:bg-cyan-400 text-cyber-950 font-bold transition-all"
              >
                Open in URL Analyzer
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
