import React from 'react';
import { 
  BookOpen, Shield, Cpu, Code2, Layers, CheckCircle2, 
  AlertTriangle, Terminal, Database, Globe, Lock, Info 
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
      
      {/* Title Header */}
      <div className="cyber-panel rounded-2xl p-6 sm:p-8 border border-cyber-700">
        <div className="flex items-center space-x-2 text-cyber-cyan font-mono text-xs uppercase tracking-wider mb-2">
          <BookOpen className="w-4 h-4" />
          <span>Academic Project Specifications & Theoretical Documentation</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold font-mono text-white tracking-tight">
          ABOUT URL SENTINEL
        </h1>
        <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed font-sans">
          A full-stack cybersecurity application integrating 
          <span className="text-cyber-cyan font-mono font-semibold"> Formal Language & Automata Theory (FLAT)</span> with 
          modern web security heuristic analysis to detect deceptive, malformed, and high-risk Uniform Resource Locators (URLs).
        </p>
      </div>

      {/* Project Objectives */}
      <div className="cyber-panel rounded-xl p-6 border border-cyber-700 space-y-4">
        <div className="flex items-center space-x-2 pb-3 border-b border-cyber-800 text-white font-mono font-bold text-sm uppercase">
          <Shield className="w-4 h-4 text-cyber-cyan" />
          <span>1. Project Objectives & Problem Statement</span>
        </div>

        <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-sans">
          In contemporary enterprise cybersecurity, malicious URLs represent the initial infection vector in over 90% of targeted spear-phishing, credential harvesting, and malware delivery campaigns. Attackers frequently exploit human perceptual limitations and obscure URI specification quirks to mislead targets.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3 font-mono text-xs">
          <div className="p-3.5 rounded-lg bg-cyber-900 border border-cyber-800 space-y-1.5">
            <div className="text-cyber-cyan font-bold flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Lexical Automata Processing</span>
            </div>
            <p className="text-slate-400 font-sans text-xs">
              Demonstrate practical application of Deterministic Finite Automata (DFA) in validating URL syntax state transitions in real time.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-cyber-900 border border-cyber-800 space-y-1.5">
            <div className="text-cyber-cyan font-bold flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Phishing Evasion Detection</span>
            </div>
            <p className="text-slate-400 font-sans text-xs">
              Detect adversarial techniques including '@' userinfo spoofing, raw IP hosts, IDN homograph Cyrillic punycode, and URL shortener cloaking.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-cyber-900 border border-cyber-800 space-y-1.5">
            <div className="text-cyber-cyan font-bold flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Explainable AI & Risk Scoring</span>
            </div>
            <p className="text-slate-400 font-sans text-xs">
              Generate transparent risk justifications explaining exact structural and syntactic reasons for every assigned threat level.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-cyber-900 border border-cyber-800 space-y-1.5">
            <div className="text-cyber-cyan font-bold flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Full-Stack Persistent Architecture</span>
            </div>
            <p className="text-slate-400 font-sans text-xs">
              Provide persistent audit logging via MongoDB and Mongoose with responsive React user interfaces.
            </p>
          </div>
        </div>
      </div>

      {/* Theoretical Computer Science Foundation */}
      <div className="cyber-panel rounded-xl p-6 border border-cyber-700 space-y-4 font-mono text-xs">
        <div className="flex items-center space-x-2 pb-3 border-b border-cyber-800 text-white font-bold text-sm uppercase">
          <Cpu className="w-4 h-4 text-cyber-cyan" />
          <span>2. Theoretical Computer Science & Automata Design</span>
        </div>

        <p className="text-slate-300 font-sans text-xs sm:text-sm leading-relaxed">
          According to the <strong className="text-white">Chomsky Hierarchy</strong>, web URL syntax forms a subset of <strong className="text-cyber-cyan">Type-3 Regular Languages</strong>, which are formally recognized by Finite State Machines. By Kleene’s Theorem, any language definable by a Regular Expression can be accepted by an equivalent Deterministic Finite Automaton (DFA).
        </p>

        {/* 5-tuple table */}
        <div className="p-4 rounded-lg bg-cyber-950 border border-cyber-800 space-y-2">
          <div className="text-cyber-cyan font-bold text-xs uppercase">
            Formal 5-Tuple Definition: M = (Q, Σ, δ, q0, F)
          </div>
          <ul className="space-y-1.5 text-slate-300">
            <li>• <strong className="text-white">Q = &#123; q0, q1, q2, q3, q4, qReject &#125;</strong>: The finite set of internal control states.</li>
            <li>• <strong className="text-white">Σ</strong>: The input alphabet consisting of ASCII alphanumeric and RFC 3986 reserved delimiter characters.</li>
            <li>• <strong className="text-white">q0</strong>: The unique start state awaiting protocol token prefix.</li>
            <li>• <strong className="text-white">F = &#123; q4 &#125;</strong>: The singleton set of accepting states (valid Top-Level Domain suffix validated).</li>
            <li>• <strong className="text-white">δ: Q × Σ ➔ Q</strong>: The deterministic state transition function mapping current state and input token to next state.</li>
          </ul>
        </div>

        <div className="p-3.5 rounded-lg bg-cyber-900/60 border border-cyber-800 text-slate-300 font-sans text-xs leading-relaxed">
          <strong className="text-white font-mono">The Trap State (qReject):</strong> If the automaton encounters an unexpected character, invalid scheme, missing separator (<code className="text-cyber-cyan">://</code>), or missing domain label, it transitions irreversibly to <code className="text-cyber-rose font-mono">qReject</code>, an absorbing dead state from which no acceptance is possible.
        </div>
      </div>

      {/* Dual Engine Architecture */}
      <div className="cyber-panel rounded-xl p-6 border border-cyber-700 space-y-4">
        <div className="flex items-center space-x-2 pb-3 border-b border-cyber-800 text-white font-mono font-bold text-sm uppercase">
          <Layers className="w-4 h-4 text-cyber-cyan" />
          <span>3. Dual-Engine Methodology & Architecture</span>
        </div>

        <p className="text-slate-300 text-xs sm:text-sm font-sans leading-relaxed">
          Rather than relying solely on regular expressions, URL Sentinel utilizes a layered security analysis pipeline:
        </p>

        <div className="space-y-3 font-mono text-xs">
          <div className="p-3 rounded-lg bg-cyber-900 border border-cyber-800">
            <span className="text-cyber-cyan font-bold">Step 1: Finite Automata Lexical Scanning</span>
            <p className="text-slate-300 font-sans text-xs mt-1">
              Processes the URL character-by-character and token-by-token through state machine $M$. Generates full audit step traces and verifies whether string $w \in L(M)$.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-cyber-900 border border-cyber-800">
            <span className="text-cyber-cyan font-bold">Step 2: RFC 3986 Regular Expression Parsing</span>
            <p className="text-slate-300 font-sans text-xs mt-1">
              Decomposes valid URLs into structural components: protocol, authority, userinfo, domain, subdomain, TLD, port, path, query, and fragment.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-cyber-900 border border-cyber-800">
            <span className="text-cyber-cyan font-bold">Step 3: Algorithmic Heuristic & Evasion Detection</span>
            <p className="text-slate-300 font-sans text-xs mt-1">
              Evaluates 12 specific threat indicators including IPv4 hosts, URL shorteners, sensitive banking/phishing keywords, Shannon entropy calculation for DGA detection, and punycode tags.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-cyber-900 border border-cyber-800">
            <span className="text-cyber-cyan font-bold">Step 4: Academic Risk Model & Persistence</span>
            <p className="text-slate-300 font-sans text-xs mt-1">
              Synthesizes DFA acceptance and heuristic weights into a 0-100 risk score and persists complete audit logs in MongoDB.
            </p>
          </div>
        </div>
      </div>

      {/* Critical Academic Disclaimer */}
      <div className="cyber-panel rounded-xl p-6 border border-cyber-amber/40 bg-cyber-amber/5 space-y-3">
        <div className="flex items-center space-x-2 text-cyber-amber font-mono font-bold text-sm uppercase">
          <AlertTriangle className="w-5 h-5 text-cyber-amber" />
          <span>4. Academic Disclaimer & Limitations</span>
        </div>

        <p className="text-slate-200 text-xs sm:text-sm font-sans leading-relaxed">
          <strong className="text-white">Syntax Validity ≠ Real-Time Threat Intelligence:</strong> A URL that conforms completely to lexical syntax and is accepted by the DFA (e.g. reaching state <code className="text-cyber-emerald font-mono">q4</code>) is not guaranteed to be harmless. Attackers can register syntactically valid domains on standard TLDs. 
        </p>
        <p className="text-slate-300 text-xs font-sans leading-relaxed">
          In production enterprise environments, heuristic syntactic checking must be complemented by live DNS reputation, TLS certificate validation, WHOIS domain age lookups, and dynamic threat intelligence feeds (such as Google Safe Browsing and VirusTotal).
        </p>
      </div>

      {/* Technology Stack Table */}
      <div className="cyber-panel rounded-xl p-6 border border-cyber-700 space-y-4 font-mono text-xs">
        <div className="flex items-center space-x-2 pb-3 border-b border-cyber-800 text-white font-bold text-sm uppercase">
          <Code2 className="w-4 h-4 text-cyber-cyan" />
          <span>5. Technology Stack & Deliverables</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 rounded bg-cyber-950 border border-cyber-800">
            <div className="text-cyber-cyan font-bold">React 18 + Vite</div>
            <div className="text-[10px] text-slate-400 mt-1">Frontend Client</div>
          </div>
          <div className="p-3 rounded bg-cyber-950 border border-cyber-800">
            <div className="text-cyber-cyan font-bold">Tailwind CSS</div>
            <div className="text-[10px] text-slate-400 mt-1">Cyber / SOC UI</div>
          </div>
          <div className="p-3 rounded bg-cyber-950 border border-cyber-800">
            <div className="text-cyber-cyan font-bold">Node.js + Express</div>
            <div className="text-[10px] text-slate-400 mt-1">Backend REST API</div>
          </div>
          <div className="p-3 rounded bg-cyber-950 border border-cyber-800">
            <div className="text-cyber-cyan font-bold">MongoDB + Mongoose</div>
            <div className="text-[10px] text-slate-400 mt-1">Database Store</div>
          </div>
        </div>
      </div>

    </div>
  );
}
