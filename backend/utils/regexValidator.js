/**
 * Regular Expression Validation Engine for URL Syntax & RFC 3986 Compliance
 * Complements the Deterministic Finite Automaton (DFA)
 */

// Comprehensive RFC 3986 URL Regular Expression pattern
const URL_REGEX = /^(https?):\/\/([a-zA-Z0-9\-._~%!$&'()*+,;=@]+)(?::([0-9]{1,5}))?(\/[^\s?#]*)?(\?[^\s#]*)?(#\S*)?$/i;

// Component-specific patterns
const PROTOCOL_REGEX = /^(https?)$/i;
const IPV4_REGEX = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
const DOMAIN_LABEL_REGEX = /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?$/;
const TLD_REGEX = /^[a-zA-Z]{2,24}$|^xn--[a-zA-Z0-9]+$/i;
const PORT_REGEX = /^([0-9]{1,5})$/;

function validateUrlWithRegex(inputUrl) {
  if (!inputUrl || typeof inputUrl !== 'string') {
    return {
      isValid: false,
      rawUrl: inputUrl,
      components: {},
      validationChecks: [],
      errors: ['Input URL cannot be empty or non-string']
    };
  }

  const trimmed = inputUrl.trim();
  const errors = [];
  const checks = [];

  // Check 1: Full RFC Regex Match
  const match = trimmed.match(URL_REGEX);
  const fullRegexPassed = match !== null;
  checks.push({
    name: 'RFC 3986 Regex Match',
    description: 'Matches overall standard web URL structure',
    pattern: URL_REGEX.toString(),
    passed: fullRegexPassed
  });

  if (!fullRegexPassed) {
    errors.push('URL does not conform to standard RFC 3986 URI format');
  }

  // Extract components
  let protocol = null;
  let authority = null;
  let host = null;
  let port = null;
  let path = null;
  let query = null;
  let hash = null;
  let userinfo = null;

  if (match) {
    protocol = match[1] ? match[1].toLowerCase() : null;
    authority = match[2] || null;
    port = match[3] || null;
    path = match[4] || '/';
    query = match[5] || null;
    hash = match[6] || null;

    // Handle userinfo if authority contains '@'
    if (authority && authority.includes('@')) {
      const parts = authority.split('@');
      userinfo = parts[0];
      host = parts[1];
    } else {
      host = authority;
    }
  } else {
    // Attempt best-effort parsing for diagnostic feedback
    const protoMatch = trimmed.match(/^([a-zA-Z0-9+.-]+):\/\//);
    if (protoMatch) {
      protocol = protoMatch[1].toLowerCase();
      const rest = trimmed.substring(protoMatch[0].length);
      const slashIndex = rest.indexOf('/');
      const qIndex = rest.indexOf('?');
      const hIndex = rest.indexOf('#');
      const cutIndices = [slashIndex, qIndex, hIndex].filter(i => i !== -1);
      const endHostIndex = cutIndices.length > 0 ? Math.min(...cutIndices) : rest.length;
      authority = rest.substring(0, endHostIndex);
      host = authority;
    }
  }

  // Check 2: Protocol Validation
  const protocolPassed = protocol !== null && PROTOCOL_REGEX.test(protocol);
  checks.push({
    name: 'Protocol Validation',
    description: 'Protocol must be either HTTP or HTTPS',
    pattern: PROTOCOL_REGEX.toString(),
    value: protocol,
    passed: protocolPassed
  });
  if (!protocolPassed) {
    errors.push(protocol ? `Unsupported protocol "${protocol}". Only http and https are permitted.` : 'Missing protocol scheme.');
  }

  // Check 3: Host / Domain Structure Validation
  let isIp = false;
  let subdomain = '';
  let domain = '';
  let tld = '';
  let hostPassed = false;

  if (host) {
    if (IPV4_REGEX.test(host)) {
      isIp = true;
      hostPassed = true;
      checks.push({
        name: 'IP Host Detection',
        description: 'Host is an explicit IPv4 address rather than a domain name',
        pattern: IPV4_REGEX.toString(),
        value: host,
        passed: true
      });
    } else {
      const labels = host.split('.');
      if (labels.length >= 2) {
        const lastLabel = labels[labels.length - 1];
        const tldValid = TLD_REGEX.test(lastLabel);
        const labelsValid = labels.every(lbl => DOMAIN_LABEL_REGEX.test(lbl));

        if (labelsValid && tldValid) {
          hostPassed = true;
          tld = lastLabel.toLowerCase();
          domain = labels[labels.length - 2] + '.' + tld;
          if (labels.length > 2) {
            subdomain = labels.slice(0, labels.length - 2).join('.');
          }
        }
      }
    }
  }

  checks.push({
    name: 'Domain & TLD Validation',
    description: 'Host must be a valid FQDN domain or IPv4 address',
    pattern: 'Domain labels must match RFC 1035 and have valid TLD',
    value: host,
    passed: hostPassed
  });

  if (!hostPassed) {
    errors.push(host ? `Malformed domain name "${host}". Must contain valid alphanumeric labels and a valid TLD.` : 'Missing domain or host authority.');
  }

  // Check 4: Port Validation (if present)
  let portPassed = true;
  if (port) {
    const portNum = parseInt(port, 10);
    portPassed = PORT_REGEX.test(port) && portNum >= 1 && portNum <= 65535;
    checks.push({
      name: 'Port Number Validation',
      description: 'Port must be an integer between 1 and 65535',
      pattern: PORT_REGEX.toString(),
      value: port,
      passed: portPassed
    });
    if (!portPassed) {
      errors.push(`Invalid port number "${port}". Must be between 1 and 65535.`);
    }
  }

  const isValid = fullRegexPassed && protocolPassed && hostPassed && portPassed;

  return {
    isValid,
    rawUrl: trimmed,
    components: {
      protocol,
      authority,
      userinfo,
      host,
      subdomain,
      domain: isIp ? host : domain,
      tld: isIp ? 'IPv4' : tld,
      isIp,
      port: port ? parseInt(port, 10) : (protocol === 'https' ? 443 : 80),
      path,
      query,
      hash
    },
    validationChecks: checks,
    errors
  };
}

module.exports = {
  validateUrlWithRegex,
  URL_REGEX,
  PROTOCOL_REGEX,
  IPV4_REGEX
};
