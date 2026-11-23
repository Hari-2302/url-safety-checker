import React, { useState, useEffect } from 'react';
import { 
  Cpu, Play, Pause, RotateCcw, ArrowRight, ArrowLeft, 
  CheckCircle2, XCircle, Layers, Code, BookOpen, Search 
} from 'lucide-react';
import { runClientDfa, FORMAL_5_TUPLE } from '../utils/dfaEngine';
import DfaVisualizer from '../components/DfaVisualizer';
import TransitionTableViewer from '../components/TransitionTableViewer';

export default function AutomataPage() {
  const [simInput, setSimInput] = useState('https://www.google.com');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [simulationData, setSimulationData] = useState(null);

  useEffect(() => {
    if (simInput.trim()) {
      const sim = runClientDfa(simInput.trim());
      setSimulationData(sim);
      setCurrentStepIndex(0);
      setIsPlaying(false);
    }
  }, [simInput]);

  // Stepper controls
  const totalSteps = simulationData?.stepTrace?.length || 0;

  const handleStepNext = () => {
    if (currentStepIndex < totalSteps) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handleStepPrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleReset = () => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
  };

  // Auto-play timer
  useEffect(() => {
    let timer = null;
    if (isPlaying) {
      if (currentStepIndex < totalSteps) {
        timer = setTimeout(() => {
          setCurrentStepIndex(prev => prev + 1);
        }, 800);
      } else {
        setIsPlaying(false);
      }
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isPlaying, currentStepIndex, totalSteps]);

  // Calculate current partial state sequence based on step index
  const activeSteps = (simulationData?.stepTrace || []).slice(0, currentStepIndex);
  const activeStateSequence = currentStepIndex === 0 
    ? ['q0'] 
    : ['q0', ...activeSteps.map(s => s.to)];
  const currentActiveState = activeStateSequence[activeStateSequence.length - 1];

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Page Header */}
      <div className="cyber-panel rounded-2xl p-6 sm:p-7 border border-cyber-700">
        <div className="flex items-center space-x-2 text-cyber-cyan font-mono text-xs uppercase tracking-wider mb-1">
          <Cpu className="w-4 h-4" />
          <span>Formal Language & Automata Theory</span>
        </div>
        <h2 className="text-xl sm:text-3xl font-black font-mono text-white tracking-tight">
          DETERMINISTIC FINITE AUTOMATON (DFA) EXPLORER
        </h2>
        <p className="mt-2 text-slate-300 text-xs sm:text-sm leading-relaxed max-w-3xl">
          Visual and mathematical demonstration of the DFA machine validating the Regular sub-language of RFC 3986 URLs.
          Inspect the formal 5-tuple, state transitions $\delta(q, \sigma)$, and step through any custom input.
        </p>
      </div>

      {/* Formal 5-tuple Card */}
      <div className="cyber-panel rounded-xl p-5 border border-cyber-700 font-mono text-xs">
        <div className="flex items-center space-x-2 pb-3 border-b border-cyber-800 text-white font-bold">
          <BookOpen className="w-4 h-4 text-cyber-cyan" />
          <span className="uppercase">Formal Mathematical 5-Tuple Definition: M = (Q, Σ, δ, q0, F)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-4">
          <div className="p-3 rounded bg-cyber-900 border border-cyber-800">
            <span className="text-[10px] text-slate-400 uppercase">Set of States (Q)</span>
            <div className="text-cyber-cyan font-bold mt-1 text-[11px]">&#123; q0, q1, q2, q3, q4, qReject &#125;</div>
            <p className="text-[10px] text-slate-500 mt-1 font-sans">6 finite control states</p>
          </div>

          <div className="p-3 rounded bg-cyber-900 border border-cyber-800">
            <span className="text-[10px] text-slate-400 uppercase">Input Alphabet (Σ)</span>
            <div className="text-white font-bold mt-1 text-[11px]">ASCII URL Token Classes</div>
            <p className="text-[10px] text-slate-500 mt-1 font-sans">Alphanumeric, :, /, ., -, @, ?</p>
          </div>

          <div className="p-3 rounded bg-cyber-900 border border-cyber-800">
            <span className="text-[10px] text-slate-400 uppercase">Start State (q0)</span>
            <div className="text-cyan-300 font-bold mt-1 text-sm">q0</div>
            <p className="text-[10px] text-slate-500 mt-1 font-sans">Awaiting scheme prefix</p>
          </div>

          <div className="p-3 rounded bg-cyber-900 border border-cyber-emerald/30">
            <span className="text-[10px] text-cyber-emerald uppercase">Accepting Set (F)</span>
            <div className="text-cyber-emerald font-bold mt-1 text-sm">&#123; q4 &#125;</div>
            <p className="text-[10px] text-slate-500 mt-1 font-sans">Concentric double circle</p>
          </div>

          <div className="p-3 rounded bg-cyber-900 border border-cyber-rose/30">
            <span className="text-[10px] text-cyber-rose uppercase">Trap State</span>
            <div className="text-cyber-rose font-bold mt-1 text-sm">qReject</div>
            <p className="text-[10px] text-slate-500 mt-1 font-sans">Non-accepting dead state</p>
          </div>
        </div>
      </div>

      {/* Interactive String Simulator */}
      <div className="cyber-panel rounded-xl p-6 border border-cyber-700 space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-cyber-800 gap-2">
          <div className="flex items-center space-x-2 font-mono">
            <Play className="w-4 h-4 text-cyber-cyan" />
            <h3 className="text-sm font-bold text-white uppercase">Interactive String Stepper & Simulator</h3>
          </div>
          <div className="text-xs font-mono text-slate-400">
            Step {currentStepIndex} of {totalSteps}
          </div>
        </div>

        {/* Input & Stepper Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            value={simInput}
            onChange={(e) => setSimInput(e.target.value)}
            placeholder="Type any test string to step through automata..."
            className="w-full sm:flex-1 px-4 py-2.5 rounded-lg bg-cyber-950 border border-cyber-700 text-xs font-mono text-white focus:outline-none focus:border-cyber-cyan"
          />

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end font-mono text-xs">
            <button
              onClick={handleStepPrev}
              disabled={currentStepIndex <= 0}
              className="px-3 py-2 rounded bg-cyber-900 hover:bg-cyber-850 text-slate-300 disabled:opacity-30 border border-cyber-800 flex items-center space-x-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Prev</span>
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-4 py-2 rounded bg-cyber-cyan text-cyber-950 font-bold hover:bg-cyan-400 flex items-center space-x-1.5 transition-all shadow-[0_0_12px_rgba(6,182,212,0.3)]"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'Pause' : 'Auto Play'}</span>
            </button>

            <button
              onClick={handleStepNext}
              disabled={currentStepIndex >= totalSteps}
              className="px-3 py-2 rounded bg-cyber-900 hover:bg-cyber-850 text-slate-300 disabled:opacity-30 border border-cyber-800 flex items-center space-x-1"
            >
              <span>Next</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleReset}
              className="p-2 rounded bg-cyber-900 hover:bg-cyber-850 text-slate-400 hover:text-white border border-cyber-800"
              title="Reset stepper"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Current State Indicator */}
        <div className="p-3.5 rounded-lg bg-cyber-950 border border-cyber-800 flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">Current State:</span>
            <span className={`px-2.5 py-1 rounded text-sm font-bold ${
              currentActiveState === 'q4' ? 'bg-cyber-emerald/20 text-cyber-emerald border border-cyber-emerald/40' :
              currentActiveState === 'qReject' ? 'bg-cyber-rose/20 text-cyber-rose border border-cyber-rose/40' :
              'bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/40'
            }`}>
              {currentActiveState}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-slate-400">Step Action:</span>
            <span className="text-white">
              {currentStepIndex === 0 
                ? 'Initialized in start state q0' 
                : activeSteps[activeSteps.length - 1]?.rule || 'Transition completed'}
            </span>
          </div>
        </div>

        {/* Dynamic DFA Graph bound to stepper */}
        <DfaVisualizer
          stateSequence={activeStateSequence}
          accepted={currentActiveState === 'q4'}
          finalState={currentActiveState}
        />

      </div>

      {/* Complete State Transition Matrix Table */}
      <TransitionTableViewer />

    </div>
  );
}
