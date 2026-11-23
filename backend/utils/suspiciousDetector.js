/**
 * Suspicious Pattern Detection Engine for Cybersecurity Risk Assessment
 * Evaluates phishing indicators, deceptive syntax, obfuscation, and heuristic threat patterns.
 */

const KNOWN_SHORTENERS = new Set([
  'bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'ow.ly', 'is.gd',
  'buff.ly', 'adf.ly', 'bit.do', 'cutt.ly', 'rb.gy', 'shorturl.at',
  'tiny.cc', 'shorte.st', 's.id', 'clck.ru', 'v.gd', 'bc.vc'
]);

const SENSITIVE_KEYWORDS = [
  'login', 'verify', 'secure', 'account', 'banking', 'update',
  'password', 'signin', 'confirm', 'wallet', 'admin', 'paypal',
  'appleid', 'support', 'billing', 'auth', 'security', 'identity',
  'credential', 'recover', 'token', 'passcode', 'verification',
  'ebay', 'amazon', 'netflix', 'microsoft', 'google-login', 'chase'
];

const STANDARD_PORTS = [80, 443, 8080, 3000, 5000, 5173];

/**
 * Calculate Shannon Entropy of a string to detect algorithmic domain generation (DGA)
 */
function calculateShannonEntropy(str) {
  if (!str || str.length === 0) return 0;
  const frequencies = {};
  for (const ch of str) {
    frequencies[ch] = (frequencies[ch] || 0) + 1;
  }
  let entropy = 0;
  const len = str.length;
  for (const count of Object.values(frequencies)) {
    const p = count / len;
    entropy -= p * Math.log2(p);
  }
  return parseFloat(entropy.toFixed(3));
}

function detectSuspiciousPatterns(inputUrl, parsedComponents = {}) {
  const indicators = [];
  const trimmed = (inputUrl || '').trim();
  const lowerUrl = trimmed.toLowerCase();

  const host = (parsedComponents.host || '').toLowerCase();
  const rawUrl = trimmed;

  // Indicator 1: IP address instead of domain name
  const ipv4Pattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const isIpHost = ipv4Pattern.test(host) || parsedComponents.isIp;
  if (isIpHost) {
    indicators.push({
      id: 'IP_ADDRESS_HOST',
      name: 'IP Address as Hostname',
      severity: 'HIGH',
      weight: 35,
      description: `URL uses a raw IP address (${host}) instead of a standard registered domain name. Threat actors frequently host malicious payloads on raw IPs to bypass domain reputation checks.`,
      detectedValue: host
    });
  }

  // Indicator 2: URL Shorteners
  let isShortener = false;
  for (const shortener of KNOWN_SHORTENERS) {
    if (host === shortener || host.endsWith('.' + shortener)) {
      isShortener = true;
      indicators.push({
        id: 'URL_SHORTENER',
        name: 'Known URL Shortener Service',
        severity: 'MEDIUM',
        weight: 20,
        description: `URL uses a shortening service (${shortener}) that masks the real destination address. Shorteners are commonly leveraged in phishing to evade automated scanners.`,
        detectedValue: shortener
      });
      break;
    }
  }

  // Indicator 3: Misleading '@' symbol
  if (trimmed.includes('@')) {
    indicators.push({
      id: 'MISLEADING_AT_SYMBOL',
      name: 'Deceptive Userinfo "@" Symbol',
      severity: 'CRITICAL',
      weight: 40,
      description: 'URL contains an "@" symbol in the authority component. Standard web browsers disregard characters preceding "@" as credentials and route to the host after the "@", enabling severe visual spoofing.',
      detectedValue: '@'
    });
  }

  // Indicator 4: Punycode / IDN Homograph attacks (xn--)
  if (host.includes('xn--') || lowerUrl.includes('xn--')) {
    indicators.push({
      id: 'PUNYCODE_HOMOGRAPH',
      name: 'Punycode / Homograph Cyrillic Domain',
      severity: 'HIGH',
      weight: 35,
      description: 'Domain uses internationalized punycode encoding ("xn--"). Attackers utilize lookalike Unicode characters (e.g., Cyrillic "а" instead of Latin "a") to visually mimic brand names.',
      detectedValue: 'xn--'
    });
  }

  // Indicator 5: Suspicious Keywords (Phishing / Credential Harvesting)
  const matchedKeywords = [];
  for (const kw of SENSITIVE_KEYWORDS) {
    if (lowerUrl.includes(kw)) {
      matchedKeywords.push(kw);
    }
  }

  if (matchedKeywords.length > 0) {
    // If keywords are present in subdomain or path, assess severity
    const inSubdomainOrPath = (parsedComponents.subdomain && matchedKeywords.some(kw => parsedComponents.subdomain.toLowerCase().includes(kw))) ||
                             (parsedComponents.path && matchedKeywords.some(kw => parsedComponents.path.toLowerCase().includes(kw)));
    
    indicators.push({
      id: 'SUSPICIOUS_KEYWORDS',
      name: 'Phishing & Authentication Keywords Detected',
      severity: matchedKeywords.length >= 2 || inSubdomainOrPath ? 'HIGH' : 'MEDIUM',
      weight: Math.min(30, matchedKeywords.length * 12),
      description: `URL contains sensitive authentication/banking keywords: [${matchedKeywords.join(', ')}]. Attackers embed these in subdomains or paths to trick targets into submitting credentials.`,
      detectedValue: matchedKeywords.join(', ')
    });
  }

  // Indicator 6: Excessive Subdomains (Deep hierarchy)
  const subdomains = (parsedComponents.subdomain || '').split('.').filter(Boolean);
  if (subdomains.length >= 3) {
    indicators.push({
      id: 'EXCESSIVE_SUBDOMAINS',
      name: 'Excessive Subdomain Hierarchy',
      severity: 'MEDIUM',
      weight: 20,
      description: `Domain contains ${subdomains.length} subdomain levels (${parsedComponents.subdomain}). Phishing kits often nest legitimate brand names as subdomains under an attacker-controlled base domain.`,
      detectedValue: `${subdomains.length} subdomains`
    });
  }

  // Indicator 7: Suspicious / Non-standard Ports
  if (parsedComponents.port && !STANDARD_PORTS.includes(Number(parsedComponents.port))) {
    indicators.push({
      id: 'SUSPICIOUS_PORT',
      name: 'Non-Standard Web Port',
      severity: 'MEDIUM',
      weight: 15,
      description: `URL explicitly specifies non-standard service port ${parsedComponents.port}. Most authentic public web applications operate strictly on standard HTTP (80) or HTTPS (443).`,
      detectedValue: `Port ${parsedComponents.port}`
    });
  }

  // Indicator 8: Unusual URL Hexadecimal / Percent-Encoding
  const percentMatches = trimmed.match(/%[0-9a-fA-F]{2}/g) || [];
  if (percentMatches.length >= 3 || lowerUrl.includes('%00') || lowerUrl.includes('%2e%2e')) {
    indicators.push({
      id: 'UNUSUAL_ENCODING',
      name: 'Excessive or Obfuscated Hex URL Encoding',
      severity: 'HIGH',
      weight: 25,
      description: `URL contains ${percentMatches.length} percent-encoded escape sequences or path traversal tokens (%00, %2e%2e). Excessive hex encoding is frequently used to evade signature detection filters.`,
      detectedValue: `${percentMatches.length} encoded sequences`
    });
  }

  // Indicator 9: High Hostname Entropy (Randomly Generated DGA)
  const mainDomainLabel = (parsedComponents.domain || host).split('.')[0] || '';
  const entropy = calculateShannonEntropy(mainDomainLabel);
  if (entropy > 3.8 && mainDomainLabel.length > 8) {
    indicators.push({
      id: 'HIGH_ENTROPY_DOMAIN',
      name: 'High Entropy Domain Name (Possible DGA)',
      severity: 'MEDIUM',
      weight: 18,
      description: `Primary domain label "${mainDomainLabel}" exhibits unusually high randomness (Shannon entropy: ${entropy} bits/char). This pattern is characteristic of Domain Generation Algorithms (DGA) used by botnets and ransomware.`,
      detectedValue: `${entropy} entropy bits`
    });
  }

  // Indicator 10: Multiple Hyphens in Domain
  const hyphenCount = (mainDomainLabel.match(/-/g) || []).length;
  if (hyphenCount >= 2) {
    indicators.push({
      id: 'EXCESSIVE_HYPHENS',
      name: 'Excessive Hyphenation in Domain',
      severity: 'LOW',
      weight: 10,
      description: `Domain contains ${hyphenCount} hyphens ("${mainDomainLabel}"). Phishers often concatenate brand names with hyphens (e.g., "paypal-account-security").`,
      detectedValue: `${hyphenCount} hyphens`
    });
  }

  // Indicator 11: Abnormal Length
  if (trimmed.length > 75) {
    indicators.push({
      id: 'ABNORMAL_LENGTH',
      name: 'Abnormally Long URL Structure',
      severity: 'LOW',
      weight: 10,
      description: `URL length is ${trimmed.length} characters (typical benign URLs average under 50). Elongated URLs are often used to push malicious domains out of view in mobile address bars.`,
      detectedValue: `${trimmed.length} characters`
    });
  }

  // Indicator 12: Insecure HTTP Protocol
  if (parsedComponents.protocol === 'http') {
    indicators.push({
      id: 'INSECURE_HTTP',
      name: 'Insecure Cleartext Protocol (HTTP)',
      severity: 'LOW',
      weight: 10,
      description: 'URL transmits data in plaintext without TLS/SSL encryption, making it vulnerable to eavesdropping and man-in-the-middle (MitM) attacks.',
      detectedValue: 'http'
    });
  }

  return {
    totalIndicators: indicators.length,
    indicators,
    isSuspicious: indicators.length > 0,
    entropy,
    hasCriticalIndicator: indicators.some(i => i.severity === 'CRITICAL'),
    hasHighIndicator: indicators.some(i => i.severity === 'HIGH')
  };
}

module.exports = {
  detectSuspiciousPatterns,
  calculateShannonEntropy,
  KNOWN_SHORTENERS,
  SENSITIVE_KEYWORDS
};
