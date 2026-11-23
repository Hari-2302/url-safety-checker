/**
 * Mathematical DFA Engine for URL Syntax Validation
 * 
 * Formal 5-tuple Definition:
 * M = (Q, Σ, δ, q0, F)
 * 
 * Q = { q0, q1, q2, q3, q4, qReject }
 *   q0: Initial state (Awaiting Protocol)
 *   q1: Valid protocol detected (http or https)
 *   q2: Separator detected (://)
 *   q3: Valid Domain name detected
 *   q4: Valid TLD & Optional Continuation (Accepting State)
 *   qReject: Syntax Error / Malformed Input (Rejecting Trap State)
 * 
 * Σ = Character classes { PROTOCOL_CHAR, SEPARATOR_CHAR, DOMAIN_CHAR, DOT, TLD_CHAR, CONTINUATION_CHAR, INVALID_CHAR }
 * δ: Q × Σ -> Q (Defined in transition table)
 * q0 = Initial State
 * F = { q4 } (Final Accepting States)
 */

const KNOWN_TLDS = new Set([
  'com', 'org', 'net', 'edu', 'gov', 'mil', 'int',
  'io', 'co', 'ai', 'dev', 'app', 'info', 'biz', 'me', 'tv', 'cc',
  'in', 'uk', 'us', 'ca', 'au', 'de', 'fr', 'jp', 'cn', 'br', 'ru',
  'tech', 'online', 'site', 'store', 'cloud', 'xyz', 'top', 'security',
  'bank', 'finance', 'agency', 'live', 'club', 'pro', 'mobi', 'space'
]);

// Formal Component-level States and Descriptions
const DFA_STATES = {
  q0: { id: 'q0', name: 'Start', description: 'Initial state awaiting protocol' },
  q1: { id: 'q1', name: 'Protocol Detected', description: 'Valid protocol scheme recognized (http or https)' },
  q2: { id: 'q2', name: 'Separator Detected', description: 'Valid :// protocol separator recognized' },
  q3: { id: 'q3', name: 'Domain Detected', description: 'Valid domain label(s) recognized' },
  q4: { id: 'q4', name: 'TLD / Accepting', description: 'Valid Top-Level Domain detected; optional path/query valid (Accepting)' },
  qReject: { id: 'qReject', name: 'Rejected', description: 'Syntax violation or invalid input (Trap State)' }
};

// Character Token Classes for Delta function
function classifyChar(ch, context = {}) {
  if (/[a-zA-Z0-9]/.test(ch)) return 'ALPHANUMERIC';
  if (ch === ':') return 'COLON';
  if (ch === '/') return 'SLASH';
  if (ch === '.') return 'DOT';
  if (ch === '-') return 'HYPHEN';
  if (ch === '_') return 'UNDERSCORE';
  if (ch === '?') return 'QUESTION';
  if (ch === '=') return 'EQUALS';
  if (ch === '&') return 'AMPERSAND';
  if (ch === '%') return 'PERCENT';
  if (ch === '#') return 'HASH';
  if (ch === '@') return 'AT_SIGN';
  return 'OTHER';
}

/**
 * Execute DFA on input URL string.
 * Generates both character-level micro-step traces and formal macro-state transitions.
 */
function processDfa(inputUrl) {
  if (!inputUrl || typeof inputUrl !== 'string') {
    return {
      accepted: false,
      finalState: 'qReject',
      stateSequence: ['q0', 'qReject'],
      stepTrace: [{ step: 1, from: 'q0', input: '', to: 'qReject', note: 'Empty or non-string input' }],
      componentTransitions: [],
      error: 'Empty or invalid input string',
      formalDefinition: getFormalDefinition()
    };
  }

  const trimmed = inputUrl.trim();
  const stepTrace = [];
  const stateSequence = ['q0'];
  const componentTransitions = [];

  let currentState = 'q0';
  let index = 0;
  const len = trimmed.length;

  // Step 1: Protocol Recognition (q0 -> q1)
  let protocolBuffer = '';
  while (index < len && trimmed[index] !== ':') {
    const ch = trimmed[index];
    protocolBuffer += ch;
    index++;
  }

  const lowerProto = protocolBuffer.toLowerCase();
  if (lowerProto === 'http' || lowerProto === 'https') {
    currentState = 'q1';
    stateSequence.push('q1');
    componentTransitions.push({
      from: 'q0',
      to: 'q1',
      token: lowerProto,
      component: 'Protocol',
      valid: true,
      description: `Protocol "${lowerProto}" accepted`
    });
    stepTrace.push({
      step: stepTrace.length + 1,
      from: 'q0',
      to: 'q1',
      token: lowerProto,
      rule: 'δ(q0, "http" | "https") = q1',
      note: `Valid scheme recognized: ${lowerProto}`
    });
  } else {
    currentState = 'qReject';
    stateSequence.push('qReject');
    stepTrace.push({
      step: stepTrace.length + 1,
      from: 'q0',
      to: 'qReject',
      token: protocolBuffer,
      rule: 'δ(q0, ¬("http" | "https")) = qReject',
      note: `Unsupported or invalid scheme "${protocolBuffer}". Only http/https supported.`
    });
    return buildResult(false, currentState, stateSequence, stepTrace, componentTransitions, 'Invalid protocol scheme. Expected "http" or "https".');
  }

  // Step 2: Separator Recognition (q1 -> q2)
  if (index + 2 < len && trimmed.substring(index, index + 3) === '://') {
    index += 3;
    currentState = 'q2';
    stateSequence.push('q2');
    componentTransitions.push({
      from: 'q1',
      to: 'q2',
      token: '://',
      component: 'Separator',
      valid: true,
      description: 'Separator "://" accepted'
    });
    stepTrace.push({
      step: stepTrace.length + 1,
      from: 'q1',
      to: 'q2',
      token: '://',
      rule: 'δ(q1, "://") = q2',
      note: 'Valid protocol authority separator recognized.'
    });
  } else {
    currentState = 'qReject';
    stateSequence.push('qReject');
    stepTrace.push({
      step: stepTrace.length + 1,
      from: 'q1',
      to: 'qReject',
      token: trimmed.substring(index, Math.min(index + 3, len)),
      rule: 'δ(q1, ¬"://") = qReject',
      note: 'Expected "://" delimiter after protocol.'
    });
    return buildResult(false, currentState, stateSequence, stepTrace, componentTransitions, 'Missing or malformed "://" separator after protocol.');
  }

  // Step 3: Domain and Host Recognition (q2 -> q3)
  // Extract host until '/', ':', '?', '#' or end
  let hostBuffer = '';
  const hostStartIndex = index;
  while (index < len && !['/', ':', '?', '#'].includes(trimmed[index])) {
    hostBuffer += trimmed[index];
    index++;
  }

  if (!hostBuffer || hostBuffer.length === 0) {
    currentState = 'qReject';
    stateSequence.push('qReject');
    stepTrace.push({
      step: stepTrace.length + 1,
      from: 'q2',
      to: 'qReject',
      token: '',
      rule: 'δ(q2, ε) = qReject',
      note: 'Empty host authority.'
    });
    return buildResult(false, currentState, stateSequence, stepTrace, componentTransitions, 'Empty domain/host component.');
  }

  // Handle misleading userinfo '@' symbol in host part for syntax
  let effectiveHost = hostBuffer;
  if (hostBuffer.includes('@')) {
    const parts = hostBuffer.split('@');
    effectiveHost = parts[parts.length - 1]; // Browser routes to part after @
  }

  // Split domain into labels
  const labels = effectiveHost.split('.');
  
  // Check if host is IPv4 address
  const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const isIpv4 = ipv4Regex.test(effectiveHost);

  let validHost = false;
  let domainPart = '';
  let tldPart = '';

  if (isIpv4) {
    // IPv4 is syntactically a host, but transitions to q3 -> q4 with indicator
    const octets = effectiveHost.split('.').map(Number);
    const validOctets = octets.every(o => o >= 0 && o <= 255);
    if (validOctets) {
      validHost = true;
      domainPart = octets.slice(0, 3).join('.');
      tldPart = String(octets[3]);
    }
  } else if (labels.length >= 2) {
    // Standard domain with at least 1 label + 1 TLD
    const labelPattern = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/;
    const allLabelsValid = labels.every(lbl => labelPattern.test(lbl));
    const lastLabel = labels[labels.length - 1].toLowerCase();

    // TLD must be alphabetic or valid punycode
    const validTld = /^[a-zA-Z]{2,24}$/.test(lastLabel) || /^xn--[a-zA-Z0-9]+$/.test(lastLabel);

    if (allLabelsValid && validTld) {
      validHost = true;
      domainPart = labels.slice(0, -1).join('.');
      tldPart = '.' + lastLabel;
    }
  }

  if (validHost) {
    // Transition q2 -> q3 (Domain Labels)
    currentState = 'q3';
    stateSequence.push('q3');
    componentTransitions.push({
      from: 'q2',
      to: 'q3',
      token: domainPart,
      component: 'Domain Labels',
      valid: true,
      description: `Domain label(s) "${domainPart}" accepted`
    });
    stepTrace.push({
      step: stepTrace.length + 1,
      from: 'q2',
      to: 'q3',
      token: domainPart,
      rule: 'δ(q2, ValidDomainLabel) = q3',
      note: `Valid domain label(s) recognized: ${domainPart}`
    });

    // Step 4: TLD Recognition (q3 -> q4) -> Accepting State!
    currentState = 'q4';
    stateSequence.push('q4');
    componentTransitions.push({
      from: 'q3',
      to: 'q4',
      token: tldPart,
      component: 'TLD',
      valid: true,
      description: `Top-Level Domain "${tldPart}" recognized (Accepting)`
    });
    stepTrace.push({
      step: stepTrace.length + 1,
      from: 'q3',
      to: 'q4',
      token: tldPart,
      rule: 'δ(q3, ValidTLD) = q4',
      note: `Valid TLD reached: ${tldPart}. Automaton in Accepting State.`
    });
  } else {
    currentState = 'qReject';
    stateSequence.push('qReject');
    stepTrace.push({
      step: stepTrace.length + 1,
      from: 'q2',
      to: 'qReject',
      token: hostBuffer,
      rule: 'δ(q2, InvalidDomain) = qReject',
      note: `Malformed domain or invalid TLD: "${hostBuffer}"`
    });
    return buildResult(false, currentState, stateSequence, stepTrace, componentTransitions, `Malformed domain name or invalid TLD: "${hostBuffer}".`);
  }

  // Step 5: Optional Continuation (Port, Path, Query, Fragment) (q4 -> q4 loop)
  if (index < len) {
    const remainder = trimmed.substring(index);
    // Validate continuation syntax (no illegal unencoded whitespace)
    if (/\s/.test(remainder)) {
      currentState = 'qReject';
      stateSequence.push('qReject');
      stepTrace.push({
        step: stepTrace.length + 1,
        from: 'q4',
        to: 'qReject',
        token: remainder,
        rule: 'δ(q4, Whitespace) = qReject',
        note: 'Illegal unencoded whitespace character in URL continuation.'
      });
      return buildResult(false, currentState, stateSequence, stepTrace, componentTransitions, 'Illegal whitespace character in URL continuation path/query.');
    }

    // Valid continuation in q4
    stepTrace.push({
      step: stepTrace.length + 1,
      from: 'q4',
      to: 'q4',
      token: remainder,
      rule: 'δ(q4, ValidContinuation) = q4',
      note: `Parsed valid port/path/query/fragment continuation: "${remainder}"`
    });
    componentTransitions.push({
      from: 'q4',
      to: 'q4',
      token: remainder,
      component: 'Continuation',
      valid: true,
      description: `Continuation "${remainder.length > 25 ? remainder.substring(0, 22) + '...' : remainder}" valid`
    });
  }

  return buildResult(currentState === 'q4', currentState, stateSequence, stepTrace, componentTransitions, null);
}

function buildResult(accepted, finalState, stateSequence, stepTrace, componentTransitions, error) {
  return {
    accepted,
    finalState,
    stateSequence,
    stepTrace,
    componentTransitions,
    error,
    formalDefinition: getFormalDefinition(),
    transitionSummary: `${stateSequence.join(' ➔ ')} (${accepted ? 'ACCEPTED' : 'REJECTED'})`
  };
}

function getFormalDefinition() {
  return {
    states: DFA_STATES,
    alphabet: [
      'Alphanumeric [a-zA-Z0-9]',
      'Colon (:)',
      'Slash (/)',
      'Dot (.)',
      'Hyphen (-)',
      'Query/Fragment (?, =, &, %, #)',
      'At symbol (@)'
    ],
    initialState: 'q0',
    acceptingStates: ['q4'],
    rejectionState: 'qReject',
    transitionTable: [
      { currentState: 'q0', input: 'http / https', nextState: 'q1', description: 'Protocol scheme recognized' },
      { currentState: 'q0', input: '¬(http | https)', nextState: 'qReject', description: 'Unsupported protocol or invalid prefix' },
      { currentState: 'q1', input: '://', nextState: 'q2', description: 'Protocol separator verified' },
      { currentState: 'q1', input: '¬"://"', nextState: 'qReject', description: 'Missing separator delimiter' },
      { currentState: 'q2', input: 'Valid domain label(s)', nextState: 'q3', description: 'Domain name label syntax parsed' },
      { currentState: 'q2', input: 'Invalid characters / empty', nextState: 'qReject', description: 'Domain label violates RFC standards' },
      { currentState: 'q3', input: 'Valid TLD (.com, .org, etc.)', nextState: 'q4', description: 'Recognized Top-Level Domain (Accepting)' },
      { currentState: 'q3', input: 'Missing / invalid TLD', nextState: 'qReject', description: 'Invalid or missing TLD suffix' },
      { currentState: 'q4', input: 'Valid path / query / port / fragment', nextState: 'q4', description: 'Valid resource continuation loop' },
      { currentState: 'q4', input: 'Illegal whitespace / control char', nextState: 'qReject', description: 'Malformed continuation syntax' },
      { currentState: 'qReject', input: 'Any input', nextState: 'qReject', description: 'Trap state; no recovery possible' }
    ]
  };
}

module.exports = {
  processDfa,
  getFormalDefinition,
  DFA_STATES,
  KNOWN_TLDS
};
