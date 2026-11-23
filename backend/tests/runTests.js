/**
 * Automated Verification & Academic Test Suite
 * Tests DFA state machine, Regex parser, Suspicious indicators, and Risk Scorer.
 */

const assert = require('assert');
const { processDfa } = require('../utils/dfaEngine');
const { validateUrlWithRegex } = require('../utils/regexValidator');
const { detectSuspiciousPatterns } = require('../utils/suspiciousDetector');
const { computeRiskScore } = require('../utils/riskScorer');

let passedTests = 0;
let failedTests = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`  ✅ [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ [FAIL] ${name}`);
    console.error(`     Error: ${err.message}`);
    failedTests++;
  }
}

console.log('====================================================');
console.log('🧪 Starting Academic Test Suite: URL Safety Checker');
console.log('====================================================\n');

console.log('1. Deterministic Finite Automaton (DFA) Tests:');
runTest('DFA accepts standard HTTPS URL (https://www.google.com)', () => {
  const result = processDfa('https://www.google.com');
  assert.strictEqual(result.accepted, true);
  assert.strictEqual(result.finalState, 'q4');
  assert.deepStrictEqual(result.stateSequence, ['q0', 'q1', 'q2', 'q3', 'q4']);
});

runTest('DFA accepts HTTP with path and query (http://example.org/path?page=1)', () => {
  const result = processDfa('http://example.org/path?page=1');
  assert.strictEqual(result.accepted, true);
  assert.strictEqual(result.finalState, 'q4');
});

runTest('DFA rejects non-HTTP protocol (ftp://files.com)', () => {
  const result = processDfa('ftp://files.com');
  assert.strictEqual(result.accepted, false);
  assert.strictEqual(result.finalState, 'qReject');
});

runTest('DFA rejects missing protocol separator (http//missing.com)', () => {
  const result = processDfa('http//missing.com');
  assert.strictEqual(result.accepted, false);
  assert.strictEqual(result.finalState, 'qReject');
});

runTest('DFA rejects missing domain or TLD (https://invalid)', () => {
  const result = processDfa('https://invalid');
  assert.strictEqual(result.accepted, false);
  assert.strictEqual(result.finalState, 'qReject');
});

runTest('DFA rejects illegal spaces (https://example.com/bad url)', () => {
  const result = processDfa('https://example.com/bad url');
  assert.strictEqual(result.accepted, false);
  assert.strictEqual(result.finalState, 'qReject');
});

console.log('\n2. Regular Expression Validation Tests:');
runTest('Regex correctly parses components for standard URL', () => {
  const result = validateUrlWithRegex('https://portal.bank.com:8443/login?redirect=true#top');
  assert.strictEqual(result.isValid, true);
  assert.strictEqual(result.components.protocol, 'https');
  assert.strictEqual(result.components.subdomain, 'portal');
  assert.strictEqual(result.components.domain, 'bank.com');
  assert.strictEqual(result.components.tld, 'com');
  assert.strictEqual(result.components.port, 8443);
  assert.strictEqual(result.components.path, '/login');
});

runTest('Regex detects raw IPv4 host authority', () => {
  const result = validateUrlWithRegex('http://192.168.1.100:8080/admin');
  assert.strictEqual(result.isValid, true);
  assert.strictEqual(result.components.isIp, true);
  assert.strictEqual(result.components.host, '192.168.1.100');
});

runTest('Regex rejects malformed string without protocol', () => {
  const result = validateUrlWithRegex('not-a-valid-url');
  assert.strictEqual(result.isValid, false);
  assert.ok(result.errors.length > 0);
});

console.log('\n3. Suspicious Threat Pattern Detection Tests:');
runTest('Detects raw IP address host indicator', () => {
  const regex = validateUrlWithRegex('http://192.168.1.1/login');
  const susp = detectSuspiciousPatterns('http://192.168.1.1/login', regex.components);
  assert.ok(susp.indicators.some(i => i.id === 'IP_ADDRESS_HOST'));
});

runTest('Detects misleading userinfo "@" symbol', () => {
  const url = 'http://legitimate-bank.com@evil-phishing-host.com/login';
  const regex = validateUrlWithRegex(url);
  const susp = detectSuspiciousPatterns(url, regex.components);
  assert.ok(susp.indicators.some(i => i.id === 'MISLEADING_AT_SYMBOL'));
  assert.strictEqual(susp.hasCriticalIndicator, true);
});

runTest('Detects known URL shorteners', () => {
  const url = 'https://bit.ly/3xyzSecret';
  const regex = validateUrlWithRegex(url);
  const susp = detectSuspiciousPatterns(url, regex.components);
  assert.ok(susp.indicators.some(i => i.id === 'URL_SHORTENER'));
});

runTest('Detects sensitive authentication keywords', () => {
  const url = 'https://secure-login-verify-account-update.com';
  const regex = validateUrlWithRegex(url);
  const susp = detectSuspiciousPatterns(url, regex.components);
  assert.ok(susp.indicators.some(i => i.id === 'SUSPICIOUS_KEYWORDS'));
});

runTest('Detects Punycode IDN homograph encoding', () => {
  const url = 'https://xn--pple-43d.com/signin';
  const regex = validateUrlWithRegex(url);
  const susp = detectSuspiciousPatterns(url, regex.components);
  assert.ok(susp.indicators.some(i => i.id === 'PUNYCODE_HOMOGRAPH'));
});

runTest('Detects excessive subdomains', () => {
  const url = 'https://login.portal.auth.identity.example.com';
  const regex = validateUrlWithRegex(url);
  const susp = detectSuspiciousPatterns(url, regex.components);
  assert.ok(susp.indicators.some(i => i.id === 'EXCESSIVE_SUBDOMAINS'));
});

console.log('\n4. Risk Scoring & Synthesis Tests:');
runTest('Benign URL (https://www.google.com) receives LOW risk score (< 25)', () => {
  const url = 'https://www.google.com';
  const dfa = processDfa(url);
  const regex = validateUrlWithRegex(url);
  const susp = detectSuspiciousPatterns(url, regex.components);
  const risk = computeRiskScore({ dfaResult: dfa, regexResult: regex, suspiciousResult: susp });
  assert.strictEqual(risk.level, 'LOW');
  assert.ok(risk.score < 25);
  assert.strictEqual(risk.statusLabel, 'SAFE-LOOKING');
});

runTest('Deceptive URL with "@" receives CRITICAL risk score (>= 85)', () => {
  const url = 'http://paypal.com@evil-site.com/signin';
  const dfa = processDfa(url);
  const regex = validateUrlWithRegex(url);
  const susp = detectSuspiciousPatterns(url, regex.components);
  const risk = computeRiskScore({ dfaResult: dfa, regexResult: regex, suspiciousResult: susp });
  assert.strictEqual(risk.level, 'CRITICAL');
  assert.ok(risk.score >= 85);
});

runTest('Malformed syntax URL is marked REJECTED / CRITICAL', () => {
  const url = 'ftp://malformed.invalid';
  const dfa = processDfa(url);
  const regex = validateUrlWithRegex(url);
  const susp = detectSuspiciousPatterns(url, regex.components);
  const risk = computeRiskScore({ dfaResult: dfa, regexResult: regex, suspiciousResult: susp });
  assert.strictEqual(risk.statusLabel, 'MALFORMED / REJECTED');
});

console.log('\n====================================================');
console.log(`📊 Test Summary: ${passedTests} passed, ${failedTests} failed out of ${passedTests + failedTests} tests.`);
console.log('====================================================\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('🎉 All Automata, Regex, and Security Heuristic tests passed perfectly!');
  process.exit(0);
}
