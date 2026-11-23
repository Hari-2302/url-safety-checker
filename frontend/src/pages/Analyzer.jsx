import React, { useState, useEffect } from 'react';
import { 
  Terminal, ShieldCheck, ShieldAlert, AlertTriangle, Cpu, 
  ArrowRight, RefreshCw, CheckCircle2, XCircle, Info, ExternalLink,
  Layers, Lock, Globe, Hash, Zap, Code
} from 'lucide-react';
import { analyzeUrl } from '../services/api';
import { runClientDfa } from '../utils/dfaEngine';
import RiskBadge from '../components/RiskBadge';
import DfaVisualizer from '../components/DfaVisualizer';
import StepTraceViewer from '../components/StepTraceViewer';

export default function Analyzer({ initialUrl = '', onAnalysisComplete }) {
  const [inputUrl, setInputUrl] = useState(initialUrl || 'https://www.google.com');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Client-side instant preview trace while typing
  const [clientPreview, setClientPreview] = useState(null);

  useEffect(() => {
    if (initialUrl) {
      setInputUrl(initialUrl);
      executeAnalysis(initialUrl);
    } else {
      executeAnalysis('https://www.google.com');
    }
  }, [initialUrl]);

  // Live preview update
  useEffect(() => {
    if (inputUrl.trim()) {
      const sim = runClientDfa(inputUrl.trim());
      setClientPreview(sim);
    } else {
      setClientPreview(null);
    }
  }, [inputUrl]);

  const executeAnalysis = async (urlToTest) => {
    const target = (urlToTest || inputUrl || '').trim();
    if (!target) return;

    setLoading(true);
    setError(null);

    try {
      const response = await analyzeUrl(target);
      if (response.success && response.data) {
        setResult(response.data);
        if (onAnalysisComplete) onAnalysisComplete(response.data);
      } else {
        setError(response.error || 'Failed to analyze URL');
      }
    } catch (err) {
      console.warn('API error, falling back to client evaluation:', err.message);
      // Run full client-side evaluation fallback
      const simDfa = runClientDfa(target);
      const isHttps = target.startsWith('https://');
      const isHttp = target.startsWith('http://');
      const hasAt = target.includes('@');
      const hasIp = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(target);
      const isShortener = ['bit.ly', 'tinyurl.com', 't.co'].some(s => target.includes(s));
      const hasKeywords = ['login', 'verify', 'account', 'secure', 'bank'].some(k => target.toLowerCase().includes(k));

      const indicators = [];
      if (hasAt) indicators.push({ id: 'MISLEADING_AT_SYMBOL', name: 'Deceptive Userinfo "@" Symbol', severity: 'CRITICAL', description: 'Browser disregards characters before @, spoofing destination.' });
      if (hasIp) indicators.push({ id: 'IP_ADDRESS_HOST', name: 'IP Address as Hostname', severity: 'HIGH', description: 'Host is a raw IP address bypassing domain reputation.' });
      if (isShortener) indicators.push({ id: 'URL_SHORTENER', name: 'URL Shortener Service', severity: 'MEDIUM', description: 'Hides true destination.' });
      if (hasKeywords) indicators.push({ id: 'SUSPICIOUS_KEYWORDS', name: 'Authentication Keywords', severity: 'MEDIUM', description: 'Contains sensitive authentication terms.' });

      let score = 0;
      if (!simDfa.accepted) score = 100;
      else if (hasAt) score = 90;
      else if (hasIp) score = 65;
      else if (isShortener || hasKeywords) score = 35;
      else score = 10;

      const fallbackData = {
        url: target,
        risk: {
          score,
          level: score >= 85 ? 'CRITICAL' : score >= 55 ? 'HIGH' : score >= 25 ? 'MEDIUM' : 'LOW',
          statusLabel: !simDfa.accepted ? 'MALFORMED / REJECTED' : score < 25 ? 'SAFE-LOOKING' : score >= 85 ? 'CRITICAL RISK / PHISHING' : 'SUSPICIOUS / ELEVATED RISK',
          summary: simDfa.accepted ? (score < 25 ? 'No threat indicators detected.' : 'Elevated threat patterns observed.') : 'Lexical automata rejection.',
          reasons: indicators.map(i => `[${i.severity}] ${i.name}: ${i.description}`),
          recommendation: score < 25 ? 'Benign syntax observed.' : 'Exercise caution.',
          disclaimer: 'Illustrative heuristic result, not a security guarantee. Syntactic validation and pattern detection do not replace live threat intelligence.'
        },
        dfa: simDfa,
        regex: {
          isValid: simDfa.accepted,
          components: {
            protocol: isHttps ? 'https' : (isHttp ? 'http' : 'unknown'),
            domain: target.replace(/https?:\/\//, '').split('/')[0],
            tld: 'com',
            port: isHttps ? 443 : 80,
            path: '/'
          },
          validationChecks: [
            { name: 'RFC 3986 Match', passed: simDfa.accepted },
            { name: 'Protocol Check', passed: isHttp || isHttps }
          ],
          errors: simDfa.accepted ? [] : [simDfa.error || 'Syntax rejected']
        },
        suspicious: {
          indicators,
          totalIndicators: indicators.length
        },
        createdAt: new Date().toISOString()
      };
      setResult(fallbackData);
    } finally {
      setLoading(false);
    }
  };

  const samplePresets = [
    { label: 'Google (Benign)', url: 'https://www.google.com', badge: 'Safe' },
    { label: 'PayPal @ Spoofing', url: 'http://paypal.com@evil-phishing-host.com/signin', badge: 'Critical' },
    { label: 'Raw IP Host Authority', url: 'http://192.168.1.1/login', badge: 'High' },
    { label: 'Bit.ly Shortener', url: 'https://bit.ly/3xY7zSecure', badge: 'Medium' },
    { label: 'Punycode Homograph', url: 'https://xn--pple-43d.com/signin', badge: 'High' },
    { label: 'Malformed Protocol', url: 'ftp://unsupported-service.com', badge: 'Reject' }
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Search & URL Input Box */}
      <div className="cyber-panel rounded-2xl p-6 sm:p-7 border border-cyber-700">
        <div className="flex items-center space-x-2 text-cyber-cyan font-mono text-xs uppercase tracking-wider mb-2">
          <Terminal className="w-4 h-4" />
          <span>Interactive URL Security Scanner</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black font-mono text-white tracking-tight">
          ANALYZE URL SYNTAX & THREAT HEURISTICS
        </h2>
        <p className="text-slate-300 text-xs sm:text-sm mt-1">
          Inspect URLs via dual-engine Deterministic Finite Automata (DFA) state parsing and RFC 3986 validation.
        </p>

        {/* Input Form */}
        <form onSubmit={(e) => { e.preventDefault(); executeAnalysis(); }} className="mt-5">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="Enter URL (e.g. https://www.google.com)..."
                className="w-full pl-4 pr-10 py-3.5 rounded-xl bg-cyber-950 border border-cyber-700 text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyber-cyan shadow-inner"
              />
              {inputUrl && (
                <button
                  type="button"
                  onClick={() => setInputUrl('')}
                  className="absolute right-3.5 top-3.5 text-slate-500 hover:text-white text-xs font-mono"
                >
                  Clear
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={loading || !inputUrl.trim()}
              className="px-7 py-3.5 rounded-xl bg-cyber-cyan hover:bg-cyan-400 disabled:opacity-50 text-cyber-950 font-extrabold font-mono text-sm transition-all flex items-center justify-center space-x-2 shadow-[0_0_20px_rgba(6,182,212,0.4)]"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Scanning...</span>
                </>
              ) : (
                <>
                  <span>Run Analysis</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Live Typing Automata Micro-Preview */}
        {clientPreview && (
          <div className="mt-3 px-3 py-2 rounded-lg bg-cyber-950/80 border border-cyber-800 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center space-x-2 text-slate-400">
              <span className="text-[11px] uppercase">Live Lexical State:</span>
              <span className="text-white font-bold">{clientPreview.stateSequence.join(' ➔ ')}</span>
            </div>
            <div>
              {clientPreview.accepted ? (
                <span className="text-cyber-emerald flex items-center space-x-1 font-semibold text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Accepted by DFA [q4]</span>
                </span>
              ) : (
                <span className="text-cyber-rose flex items-center space-x-1 font-semibold text-[11px]">
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Trap State [{clientPreview.finalState}]</span>
                </span>
              )}
            </div>
          </div>
        )}

        {/* Quick Demo Presets */}
        <div className="mt-4 pt-4 border-t border-cyber-800/80 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-mono">Quick Test Presets:</span>
          {samplePresets.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setInputUrl(p.url);
                executeAnalysis(p.url);
              }}
              className="px-2.5 py-1 rounded bg-cyber-900 hover:bg-cyber-800 border border-cyber-700 text-xs font-mono text-slate-300 transition-colors flex items-center space-x-1.5"
            >
              <span>{p.label}</span>
              <span className={`text-[10px] px-1 py-0.2 rounded font-bold ${
                p.badge === 'Safe' ? 'bg-cyber-emerald/20 text-cyber-emerald' :
                p.badge === 'Critical' ? 'bg-cyber-rose/20 text-cyber-rose' :
                p.badge === 'High' ? 'bg-rose-500/20 text-rose-300' :
                p.badge === 'Medium' ? 'bg-cyber-amber/20 text-cyber-amber' :
                'bg-slate-700 text-slate-300'
              }`}>
                {p.badge}
              </span>
            </button>
          ))}
        </div>

      </div>

      {/* Analysis Output Section */}
      {result && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Main Risk Result Card */}
          <div className="cyber-panel rounded-2xl p-6 sm:p-7 border border-cyber-700">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-cyber-800 gap-3">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Analysis Verdict</span>
                <h3 className="text-lg font-bold font-mono text-white mt-0.5 break-all">
                  {result.url}
                </h3>
              </div>
              <div className="shrink-0">
                <RiskBadge 
                  level={result.risk?.level} 
                  statusLabel={result.risk?.statusLabel} 
                  score={result.risk?.score} 
                />
              </div>
            </div>

            {/* Academic Heuristic Disclaimer Notice */}
            <div className="mt-4 p-3 rounded-lg bg-cyber-950 border border-cyber-800 flex items-start space-x-2.5 text-xs font-mono text-slate-400">
              <Info className="w-4 h-4 text-cyber-cyan shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-200 font-bold">Academic Evaluation Note: </span>
                {result.risk?.disclaimer || 'Illustrative heuristic result, not a security guarantee. Syntactic validation and pattern detection do not replace live threat intelligence.'}
              </div>
            </div>

            {/* Justification Reasons */}
            <div className="mt-4">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                Risk Evaluation Findings & Justifications:
              </span>
              <ul className="mt-2 space-y-1.5 font-mono text-xs">
                {result.risk?.reasons && result.risk.reasons.length > 0 ? (
                  result.risk.reasons.map((r, i) => (
                    <li key={i} className="flex items-start space-x-2 text-slate-200 bg-cyber-900/60 p-2 rounded border border-cyber-800">
                      <span className="text-cyber-cyan font-bold">•</span>
                      <span>{r}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-slate-400">No anomalies detected.</li>
                )}
              </ul>
            </div>

            {/* Recommendation */}
            {result.risk?.recommendation && (
              <div className="mt-4 p-3 rounded-lg bg-cyber-900 border border-cyber-cyan/30 text-xs font-mono">
                <span className="text-cyber-cyan font-bold uppercase">Security Recommendation: </span>
                <span className="text-slate-200">{result.risk.recommendation}</span>
              </div>
            )}

          </div>

          {/* Validation Breakdown: Protocol, Domain, Regex & Suspicious Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left Card: RFC 3986 & Component Breakdown */}
            <div className="cyber-panel rounded-xl p-5 border border-cyber-700 font-mono text-xs space-y-3">
              <div className="flex items-center space-x-2 pb-3 border-b border-cyber-800 text-white font-bold">
                <Lock className="w-4 h-4 text-cyber-cyan" />
                <span className="uppercase">RFC 3986 Syntax Validation</span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 rounded bg-cyber-900/60 border border-cyber-800">
                  <span className="text-slate-400">URL Format Syntax:</span>
                  <span className={`font-bold ${result.regex?.isValid ? 'text-cyber-emerald' : 'text-cyber-rose'}`}>
                    {result.regex?.isValid ? 'VALID' : 'MALFORMED'}
                  </span>
                </div>

                <div className="flex justify-between items-center p-2 rounded bg-cyber-900/60 border border-cyber-800">
                  <span className="text-slate-400">Protocol Scheme:</span>
                  <span className="text-white font-bold uppercase">
                    {result.regex?.components?.protocol || 'None'}
                  </span>
                </div>

                <div className="flex justify-between items-center p-2 rounded bg-cyber-900/60 border border-cyber-800">
                  <span className="text-slate-400">Domain / Authority:</span>
                  <span className="text-white font-bold truncate max-w-[200px]">
                    {result.regex?.components?.domain || result.regex?.components?.host || 'None'}
                  </span>
                </div>

                <div className="flex justify-between items-center p-2 rounded bg-cyber-900/60 border border-cyber-800">
                  <span className="text-slate-400">Top-Level Domain (TLD):</span>
                  <span className="text-cyber-cyan font-bold">
                    {result.regex?.components?.tld || 'N/A'}
                  </span>
                </div>

                <div className="flex justify-between items-center p-2 rounded bg-cyber-900/60 border border-cyber-800">
                  <span className="text-slate-400">Service Port:</span>
                  <span className="text-white font-bold">
                    {result.regex?.components?.port || 80}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Card: Suspicious Pattern Findings */}
            <div className="cyber-panel rounded-xl p-5 border border-cyber-700 font-mono text-xs space-y-3">
              <div className="flex items-center space-x-2 pb-3 border-b border-cyber-800 text-white font-bold">
                <ShieldAlert className="w-4 h-4 text-cyber-amber" />
                <span className="uppercase">Suspicious Threat Indicators</span>
              </div>

              {result.suspicious?.indicators && result.suspicious.indicators.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {result.suspicious.indicators.map((ind, idx) => (
                    <div 
                      key={idx}
                      className="p-2.5 rounded bg-cyber-900/90 border border-cyber-amber/30 text-xs"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-white">{ind.name}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          ind.severity === 'CRITICAL' ? 'bg-cyber-rose/20 text-cyber-rose border border-cyber-rose/40' :
                          ind.severity === 'HIGH' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                          'bg-cyber-amber/20 text-cyber-amber border border-cyber-amber/30'
                        }`}>
                          {ind.severity}
                        </span>
                      </div>
                      <p className="text-slate-300 text-[11px] leading-relaxed font-sans">{ind.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded bg-cyber-900/40 border border-cyber-emerald/30 text-center text-cyber-emerald">
                  <CheckCircle2 className="w-6 h-6 mx-auto mb-1 text-cyber-emerald" />
                  <span className="font-bold">No suspicious evasion patterns detected</span>
                  <p className="text-slate-400 text-[11px] mt-1 font-sans">
                    Zero URL shorteners, raw IP authorities, or credential harvesting keywords found.
                  </p>
                </div>
              )}
            </div>

          </div>

          {/* Automata Processing Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-white font-mono font-bold text-sm uppercase">
              <Cpu className="w-4 h-4 text-cyber-cyan" />
              <span>Finite Automata Processing (q0 ➔ q1 ➔ q2 ➔ q3 ➔ q4)</span>
            </div>

            {/* Interactive DFA Graph */}
            <DfaVisualizer 
              stateSequence={result.dfa?.stateSequence || ['q0', 'q1', 'q2', 'q3', 'q4']}
              accepted={result.dfa?.accepted}
              finalState={result.dfa?.finalState}
            />

            {/* Step-by-Step Transition Log */}
            <StepTraceViewer 
              stepTrace={result.dfa?.stepTrace || []}
              componentTransitions={result.dfa?.componentTransitions || []}
            />
          </div>

        </div>
      )}

    </div>
  );
}
