/**
 * Client-side DFA Engine for Live Interactive State Simulation
 * Formal 5-tuple: M = (Q, Σ, δ, q0, F)
 */

export const DFA_STATES = {
  q0: { id: 'q0', label: 'q0: Start', description: 'Initial state awaiting protocol scheme (http/https)' },
  q1: { id: 'q1', label: 'q1: Protocol', description: 'Protocol scheme recognized (http or https)' },
  q2: { id: 'q2', label: 'q2: Separator', description: 'Protocol delimiter "://" verified' },
  q3: { id: 'q3', label: 'q3: Domain', description: 'Valid domain label(s) parsed' },
  q4: { id: 'q4', label: 'q4: TLD (Accept)', description: 'Valid Top-Level Domain detected (Accepting State)' },
  qReject: { id: 'qReject', label: 'qReject: Trap', description: 'Syntax violation / Malformed input (Trap State)' }
};

export const FORMAL_5_TUPLE = {
  Q: '{ q0, q1, q2, q3, q4, qReject }',
  Sigma: 'ASCII printable characters partitioned into Token Classes',
  delta: 'Q × Σ ➔ Q (Formal transition function)',
  q0: 'q0 (Initial State)',
  F: '{ q4 } (Final Accepting States)'
};

export const TRANSITION_TABLE_DATA = [
  { currentState: 'q0', input: 'http / https', nextState: 'q1', description: 'Valid web protocol scheme detected' },
  { currentState: 'q0', input: '¬(http | https)', nextState: 'qReject', description: 'Unsupported scheme (e.g. ftp, file, telnet) or invalid character' },
  { currentState: 'q1', input: '://', nextState: 'q2', description: 'Authority separator delimiter detected' },
  { currentState: 'q1', input: '¬"://"', nextState: 'qReject', description: 'Missing or malformed :// delimiter' },
  { currentState: 'q2', input: 'Valid domain label(s)', nextState: 'q3', description: 'Valid alphanumeric and hyphenated domain labels' },
  { currentState: 'q2', input: 'Invalid characters / empty', nextState: 'qReject', description: 'Empty host authority or illegal characters' },
  { currentState: 'q3', input: 'Valid TLD (.com, .org, etc.)', nextState: 'q4', description: 'Recognized Top-Level Domain suffix' },
  { currentState: 'q3', input: 'Missing / invalid TLD', nextState: 'qReject', description: 'Malformed or missing TLD suffix' },
  { currentState: 'q4', input: 'Valid port / path / query', nextState: 'q4', description: 'Valid resource path and parameters continuation loop' },
  { currentState: 'q4', input: 'Illegal whitespace / control char', nextState: 'qReject', description: 'Malformed URL continuation syntax' },
  { currentState: 'qReject', input: 'Any character', nextState: 'qReject', description: 'Dead/Trap state with no recovery' }
];

export function runClientDfa(url) {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return {
      accepted: false,
      finalState: 'qReject',
      stateSequence: ['q0', 'qReject'],
      stepTrace: [{ step: 1, from: 'q0', to: 'qReject', token: 'ε', note: 'Empty string rejected' }],
      componentTransitions: []
    };
  }

  const trimmed = url.trim();
  const stepTrace = [];
  const stateSequence = ['q0'];
  const componentTransitions = [];

  let currentState = 'q0';
  let index = 0;
  const len = trimmed.length;

  // Protocol
  let proto = '';
  while (index < len && trimmed[index] !== ':') {
    proto += trimmed[index];
    index++;
  }

  const lowerProto = proto.toLowerCase();
  if (lowerProto === 'http' || lowerProto === 'https') {
    currentState = 'q1';
    stateSequence.push('q1');
    componentTransitions.push({ from: 'q0', to: 'q1', component: 'Protocol', token: lowerProto, valid: true });
    stepTrace.push({ step: 1, from: 'q0', to: 'q1', token: lowerProto, rule: 'δ(q0, Scheme) = q1', note: `Scheme "${lowerProto}" accepted` });
  } else {
    currentState = 'qReject';
    stateSequence.push('qReject');
    stepTrace.push({ step: 1, from: 'q0', to: 'qReject', token: proto || 'ε', rule: 'δ(q0, ¬Scheme) = qReject', note: `Invalid scheme "${proto}"` });
    return { accepted: false, finalState: 'qReject', stateSequence, stepTrace, componentTransitions, error: 'Invalid protocol. Expected http or https.' };
  }

  // Separator
  if (index + 2 < len && trimmed.substring(index, index + 3) === '://') {
    index += 3;
    currentState = 'q2';
    stateSequence.push('q2');
    componentTransitions.push({ from: 'q1', to: 'q2', component: 'Separator', token: '://', valid: true });
    stepTrace.push({ step: 2, from: 'q1', to: 'q2', token: '://', rule: 'δ(q1, "://") = q2', note: 'Valid separator authority recognized' });
  } else {
    currentState = 'qReject';
    stateSequence.push('qReject');
    stepTrace.push({ step: 2, from: 'q1', to: 'qReject', token: trimmed.substring(index, index + 3), rule: 'δ(q1, ¬"://") = qReject', note: 'Missing :// delimiter' });
    return { accepted: false, finalState: 'qReject', stateSequence, stepTrace, componentTransitions, error: 'Missing protocol separator "://"' };
  }

  // Domain & TLD
  let host = '';
  while (index < len && !['/', ':', '?', '#'].includes(trimmed[index])) {
    host += trimmed[index];
    index++;
  }

  let effectiveHost = host;
  if (host.includes('@')) {
    const parts = host.split('@');
    effectiveHost = parts[parts.length - 1];
  }

  const labels = effectiveHost.split('.');
  const isIpv4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.test(effectiveHost);
  let validHost = false;
  let domainPart = '';
  let tldPart = '';

  if (isIpv4) {
    validHost = true;
    domainPart = effectiveHost;
    tldPart = 'IPv4';
  } else if (labels.length >= 2) {
    const labelRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/;
    const allLabelsValid = labels.every(l => labelRegex.test(l));
    const lastLabel = labels[labels.length - 1].toLowerCase();
    const validTld = /^[a-zA-Z]{2,24}$/.test(lastLabel) || /^xn--[a-zA-Z0-9]+$/.test(lastLabel);

    if (allLabelsValid && validTld) {
      validHost = true;
      domainPart = labels.slice(0, -1).join('.');
      tldPart = '.' + lastLabel;
    }
  }

  if (validHost) {
    currentState = 'q3';
    stateSequence.push('q3');
    componentTransitions.push({ from: 'q2', to: 'q3', component: 'Domain Labels', token: domainPart, valid: true });
    stepTrace.push({ step: 3, from: 'q2', to: 'q3', token: domainPart, rule: 'δ(q2, DomainLabels) = q3', note: `Domain "${domainPart}" recognized` });

    currentState = 'q4';
    stateSequence.push('q4');
    componentTransitions.push({ from: 'q3', to: 'q4', component: 'TLD', token: tldPart, valid: true });
    stepTrace.push({ step: 4, from: 'q3', to: 'q4', token: tldPart, rule: 'δ(q3, ValidTLD) = q4', note: `TLD "${tldPart}" recognized (Accepting State)` });
  } else {
    currentState = 'qReject';
    stateSequence.push('qReject');
    stepTrace.push({ step: 3, from: 'q2', to: 'qReject', token: host, rule: 'δ(q2, InvalidDomain) = qReject', note: `Invalid domain host "${host}"` });
    return { accepted: false, finalState: 'qReject', stateSequence, stepTrace, componentTransitions, error: 'Malformed domain name or invalid TLD.' };
  }

  // Continuation loop q4 -> q4
  if (index < len) {
    const remainder = trimmed.substring(index);
    if (/\s/.test(remainder)) {
      currentState = 'qReject';
      stateSequence.push('qReject');
      stepTrace.push({ step: 5, from: 'q4', to: 'qReject', token: remainder, rule: 'δ(q4, Whitespace) = qReject', note: 'Whitespace in path/query' });
      return { accepted: false, finalState: 'qReject', stateSequence, stepTrace, componentTransitions, error: 'Illegal whitespace in URL path.' };
    }
    stepTrace.push({ step: 5, from: 'q4', to: 'q4', token: remainder, rule: 'δ(q4, ValidPath) = q4', note: `Valid continuation "${remainder}"` });
    componentTransitions.push({ from: 'q4', to: 'q4', component: 'Continuation', token: remainder, valid: true });
  }

  return {
    accepted: true,
    finalState: 'q4',
    stateSequence,
    stepTrace,
    componentTransitions,
    error: null
  };
}
