import React, { useState } from 'react';
import { Cpu, CheckCircle2, XCircle, ArrowRight, Info, Play, Layers } from 'lucide-react';

export default function DfaVisualizer({ 
  stateSequence = ['q0', 'q1', 'q2', 'q3', 'q4'], 
  accepted = true, 
  finalState = 'q4',
  activeStep = null,
  interactive = true 
}) {
  const [selectedState, setSelectedState] = useState(null);

  // States layout coordinates for SVG
  const states = [
    { id: 'q0', label: 'q0', title: 'Start', sub: 'Protocol prefix', x: 70, y: 110, isStart: true, isAccept: false },
    { id: 'q1', label: 'q1', title: 'Protocol', sub: 'http / https', x: 210, y: 110, isStart: false, isAccept: false },
    { id: 'q2', label: 'q2', title: 'Separator', sub: '://', x: 350, y: 110, isStart: false, isAccept: false },
    { id: 'q3', label: 'q3', title: 'Domain', sub: 'Alphanumeric label', x: 490, y: 110, isStart: false, isAccept: false },
    { id: 'q4', label: 'q4', title: 'TLD (Accept)', sub: 'Valid TLD / Suffix', x: 630, y: 110, isStart: false, isAccept: true },
    { id: 'qReject', label: 'qReject', title: 'Trap State', sub: 'Syntax Error', x: 350, y: 240, isStart: false, isReject: true }
  ];

  const stateDetails = {
    q0: {
      name: 'Initial State (q0)',
      description: 'The automaton start state. Initializes lexical scan expecting protocol scheme prefix "http" or "https".',
      transitions: [
        { on: 'http / https', to: 'q1', note: 'Scheme match' },
        { on: 'Other characters', to: 'qReject', note: 'Invalid scheme' }
      ]
    },
    q1: {
      name: 'Protocol Detected (q1)',
      description: 'Protocol scheme verified. Automaton expects authority delimiter "://".',
      transitions: [
        { on: '://', to: 'q2', note: 'Authority separator matched' },
        { on: '¬"://"', to: 'qReject', note: 'Missing separator' }
      ]
    },
    q2: {
      name: 'Separator Recognized (q2)',
      description: 'Authority separator confirmed. Automaton parses domain labels and hostname characters.',
      transitions: [
        { on: 'Valid label [a-z0-9-]', to: 'q3', note: 'Domain label syntax' },
        { on: 'Empty or illegal char', to: 'qReject', note: 'Domain format error' }
      ]
    },
    q3: {
      name: 'Domain Detected (q3)',
      description: 'Domain labels successfully scanned. Automaton expects recognized Top-Level Domain (TLD) suffix.',
      transitions: [
        { on: 'Valid TLD (.com, .org...)', to: 'q4', note: 'Transitions to accepting state' },
        { on: 'Invalid / missing TLD', to: 'qReject', note: 'TLD verification failure' }
      ]
    },
    q4: {
      name: 'Accepting State (q4) [F]',
      description: 'Valid Top-Level Domain confirmed. Automaton accepts the URL. Optional loops parse resource port, path, query parameters, and fragments.',
      transitions: [
        { on: 'Valid path / query / port', to: 'q4', note: 'Self-loop on valid continuation' },
        { on: 'Illegal whitespace / control', to: 'qReject', note: 'Continuation syntax error' }
      ]
    },
    qReject: {
      name: 'Trap / Reject State (qReject)',
      description: 'Non-accepting dead state. Once entered, no further transitions can accept the string. Indicates malformed URL syntax.',
      transitions: [
        { on: 'Any input', to: 'qReject', note: 'Absorbing trap state' }
      ]
    }
  };

  const isStateInPath = (id) => stateSequence.includes(id);
  const isCurrentFinal = (id) => finalState === id;

  return (
    <div className="cyber-panel rounded-xl p-5 border border-cyber-700">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-cyber-800 gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold font-mono tracking-wide text-white uppercase">
              Deterministic Finite Automaton (DFA) State Graph
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Formal Model M = (Q, Σ, δ, q0, F) with F = &#123;q4&#125;
            </p>
          </div>
        </div>

        {/* Status Pill */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono text-slate-400">Path Verdict:</span>
          {accepted ? (
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-cyber-emerald/15 border border-cyber-emerald/40 text-cyber-emerald text-xs font-mono font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>ACCEPTED [q4]</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-cyber-rose/15 border border-cyber-rose/40 text-cyber-rose text-xs font-mono font-semibold">
              <XCircle className="w-3.5 h-3.5" />
              <span>REJECTED [{finalState}]</span>
            </span>
          )}
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative overflow-x-auto py-4">
        <svg 
          viewBox="0 0 720 290" 
          className="w-full min-w-[650px] h-auto select-none"
        >
          <defs>
            {/* Arrow Marker */}
            <marker id="arrow" viewBox="0 0 10 10" refX="24" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#06b6d4" />
            </marker>
            <marker id="arrow-active" viewBox="0 0 10 10" refX="24" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#10b981" />
            </marker>
            <marker id="arrow-reject" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#f43f5e" />
            </marker>
            <marker id="arrow-dim" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#334155" />
            </marker>

            {/* Glowing filter */}
            <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="glow-emerald" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Grid Pattern */}
          <rect width="720" height="290" fill="#090d16" rx="8" />

          {/* Start Arrow pointing into q0 */}
          <path d="M 20 110 L 45 110" stroke="#06b6d4" strokeWidth="2.5" markerEnd="url(#arrow)" />
          <text x="25" y="100" fill="#06b6d4" fontSize="10" fontFamily="monospace" fontWeight="bold">START</text>

          {/* Forward Transition Arrows (q0 -> q1 -> q2 -> q3 -> q4) */}
          {/* q0 -> q1 */}
          <path 
            d="M 70 110 L 210 110" 
            stroke={isStateInPath('q1') ? '#10b981' : '#334155'} 
            strokeWidth={isStateInPath('q1') ? '3' : '1.5'} 
            strokeDasharray={isStateInPath('q1') ? '6 3' : 'none'}
            markerEnd={isStateInPath('q1') ? 'url(#arrow-active)' : 'url(#arrow-dim)'} 
          />
          <text x="140" y="98" fill={isStateInPath('q1') ? '#10b981' : '#64748b'} fontSize="10" fontFamily="monospace" textAnchor="middle">
            http / https
          </text>

          {/* q1 -> q2 */}
          <path 
            d="M 210 110 L 350 110" 
            stroke={isStateInPath('q2') ? '#10b981' : '#334155'} 
            strokeWidth={isStateInPath('q2') ? '3' : '1.5'} 
            strokeDasharray={isStateInPath('q2') ? '6 3' : 'none'}
            markerEnd={isStateInPath('q2') ? 'url(#arrow-active)' : 'url(#arrow-dim)'} 
          />
          <text x="280" y="98" fill={isStateInPath('q2') ? '#10b981' : '#64748b'} fontSize="10" fontFamily="monospace" textAnchor="middle">
            ://
          </text>

          {/* q2 -> q3 */}
          <path 
            d="M 350 110 L 490 110" 
            stroke={isStateInPath('q3') ? '#10b981' : '#334155'} 
            strokeWidth={isStateInPath('q3') ? '3' : '1.5'} 
            strokeDasharray={isStateInPath('q3') ? '6 3' : 'none'}
            markerEnd={isStateInPath('q3') ? 'url(#arrow-active)' : 'url(#arrow-dim)'} 
          />
          <text x="420" y="98" fill={isStateInPath('q3') ? '#10b981' : '#64748b'} fontSize="10" fontFamily="monospace" textAnchor="middle">
            domain label
          </text>

          {/* q3 -> q4 */}
          <path 
            d="M 490 110 L 630 110" 
            stroke={isStateInPath('q4') ? '#10b981' : '#334155'} 
            strokeWidth={isStateInPath('q4') ? '3' : '1.5'} 
            strokeDasharray={isStateInPath('q4') ? '6 3' : 'none'}
            markerEnd={isStateInPath('q4') ? 'url(#arrow-active)' : 'url(#arrow-dim)'} 
          />
          <text x="560" y="98" fill={isStateInPath('q4') ? '#10b981' : '#64748b'} fontSize="10" fontFamily="monospace" textAnchor="middle">
            valid TLD
          </text>

          {/* Self loop on q4 (Valid continuation) */}
          <path 
            d="M 620 85 C 610 40, 650 40, 640 85" 
            fill="none" 
            stroke={isStateInPath('q4') && accepted ? '#10b981' : '#334155'} 
            strokeWidth="1.5" 
            markerEnd={isStateInPath('q4') && accepted ? 'url(#arrow-active)' : 'url(#arrow-dim)'} 
          />
          <text x="630" y="35" fill={isStateInPath('q4') ? '#10b981' : '#64748b'} fontSize="9" fontFamily="monospace" textAnchor="middle">
            path / query
          </text>

          {/* Error transitions to qReject */}
          <path 
            d="M 210 135 L 325 220" 
            stroke={finalState === 'qReject' && stateSequence[stateSequence.length - 2] === 'q1' ? '#f43f5e' : '#1e293b'} 
            strokeWidth="1.2" 
            strokeDasharray="4 2"
            markerEnd={finalState === 'qReject' ? 'url(#arrow-reject)' : 'url(#arrow-dim)'} 
          />
          <path 
            d="M 350 135 L 350 215" 
            stroke={finalState === 'qReject' && stateSequence[stateSequence.length - 2] === 'q2' ? '#f43f5e' : '#1e293b'} 
            strokeWidth="1.2" 
            strokeDasharray="4 2"
            markerEnd={finalState === 'qReject' ? 'url(#arrow-reject)' : 'url(#arrow-dim)'} 
          />
          <path 
            d="M 490 135 L 375 220" 
            stroke={finalState === 'qReject' && stateSequence[stateSequence.length - 2] === 'q3' ? '#f43f5e' : '#1e293b'} 
            strokeWidth="1.2" 
            strokeDasharray="4 2"
            markerEnd={finalState === 'qReject' ? 'url(#arrow-reject)' : 'url(#arrow-dim)'} 
          />

          {/* Self-loop on qReject */}
          <path 
            d="M 365 260 C 390 285, 390 265, 375 250" 
            fill="none" 
            stroke="#f43f5e" 
            strokeWidth="1" 
            markerEnd="url(#arrow-reject)" 
          />
          <text x="415" y="275" fill="#f43f5e" fontSize="9" fontFamily="monospace">
            any char
          </text>

          {/* Render State Nodes */}
          {states.map((st) => {
            const inPath = isStateInPath(st.id);
            const isFinal = isCurrentFinal(st.id);
            const isSelected = selectedState === st.id;

            let circleFill = '#0f172a';
            let strokeColor = '#334155';
            let strokeWidth = '2';

            if (st.isReject) {
              if (inPath && isFinal) {
                circleFill = '#2a0e14';
                strokeColor = '#f43f5e';
                strokeWidth = '3';
              } else {
                strokeColor = '#471822';
              }
            } else if (inPath) {
              if (st.isAccept) {
                circleFill = '#06261c';
                strokeColor = '#10b981';
                strokeWidth = '3';
              } else {
                circleFill = '#0a222e';
                strokeColor = '#06b6d4';
                strokeWidth = '2.5';
              }
            }

            return (
              <g 
                key={st.id} 
                className="cursor-pointer transition-all hover:opacity-90"
                onClick={() => setSelectedState(st.id)}
              >
                {/* Accepting Double Circle Outer Ring */}
                {st.isAccept && (
                  <circle
                    cx={st.x}
                    cy={st.y}
                    r="30"
                    fill="none"
                    stroke={inPath ? '#10b981' : '#334155'}
                    strokeWidth="1.5"
                    filter={inPath ? 'url(#glow-emerald)' : 'none'}
                  />
                )}

                {/* Main State Circle */}
                <circle
                  cx={st.x}
                  cy={st.y}
                  r="24"
                  fill={circleFill}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  filter={inPath ? (st.isReject ? '' : 'url(#glow-cyan)') : 'none'}
                />

                {/* State Identifier */}
                <text
                  x={st.x}
                  y={st.y + 5}
                  textAnchor="middle"
                  fill={inPath ? (st.isReject ? '#f43f5e' : (st.isAccept ? '#10b981' : '#06b6d4')) : '#94a3b8'}
                  fontSize="13"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {st.label}
                </text>

                {/* Descriptive Subtitle under node */}
                <text
                  x={st.x}
                  y={st.y + 42}
                  textAnchor="middle"
                  fill="#cbd5e1"
                  fontSize="10"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {st.title}
                </text>
                <text
                  x={st.x}
                  y={st.y + 54}
                  textAnchor="middle"
                  fill="#64748b"
                  fontSize="8.5"
                  fontFamily="monospace"
                >
                  {st.sub}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Path Breadcrumbs */}
      <div className="mt-3 p-3 rounded-lg bg-cyber-900 border border-cyber-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center space-x-2">
          <span className="text-slate-400">Execution Trajectory:</span>
          <div className="flex items-center space-x-1.5 flex-wrap">
            {stateSequence.map((st, i) => (
              <React.Fragment key={i}>
                <span className={`px-2 py-0.5 rounded font-bold ${
                  st === 'q4' ? 'bg-cyber-emerald/20 text-cyber-emerald border border-cyber-emerald/40' :
                  st === 'qReject' ? 'bg-cyber-rose/20 text-cyber-rose border border-cyber-rose/40' :
                  'bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/30'
                }`}>
                  {st}
                </span>
                {i < stateSequence.length - 1 && (
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="text-slate-400 text-[11px]">
          Click any state circle above to inspect δ transitions
        </div>
      </div>

      {/* Selected State Inspector Modal / Drawer */}
      {selectedState && stateDetails[selectedState] && (
        <div className="mt-3 p-4 rounded-lg bg-cyber-850 border border-cyber-cyan/30 text-xs font-mono animate-fadeIn">
          <div className="flex items-center justify-between pb-2 border-b border-cyber-700">
            <span className="font-bold text-cyber-cyan text-sm">
              State Inspector: {stateDetails[selectedState].name}
            </span>
            <button 
              onClick={() => setSelectedState(null)}
              className="text-slate-400 hover:text-white px-1.5 py-0.5 rounded bg-cyber-800"
            >
              ✕ Close
            </button>
          </div>
          <p className="text-slate-300 mt-2">{stateDetails[selectedState].description}</p>
          <div className="mt-3">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
              Outgoing δ Transition Rules:
            </span>
            <div className="mt-1 space-y-1">
              {stateDetails[selectedState].transitions.map((t, idx) => (
                <div key={idx} className="flex items-center space-x-2 bg-cyber-900/60 p-1.5 rounded border border-cyber-800">
                  <span className="text-slate-400">δ({selectedState}, "{t.on}")</span>
                  <ArrowRight className="w-3 h-3 text-cyber-cyan" />
                  <span className="font-bold text-white">{t.to}</span>
                  <span className="text-slate-500 text-[10px]">({t.note})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
