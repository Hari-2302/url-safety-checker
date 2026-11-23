/**
 * Risk Scoring Engine for URL Security Assessment
 * Synthesizes DFA acceptance, Regex parsing, and Heuristic Indicators into an Academic Risk Model.
 */

function computeRiskScore({ dfaResult, regexResult, suspiciousResult }) {
  // If DFA or Regex strictly rejects the URL syntax
  if (!dfaResult.accepted || !regexResult.isValid) {
    return {
      score: 100,
      level: 'CRITICAL',
      statusLabel: 'MALFORMED / REJECTED',
      badgeColor: 'red',
      summary: 'The submitted URL failed foundational lexical analysis or RFC 3986 syntax validation.',
      reasons: [
        dfaResult.error || 'Failed Deterministic Finite Automaton state transitions.',
        ...(regexResult.errors || [])
      ],
      recommendation: 'Reject or block input. Do not process or navigate to malformed URLs.',
      disclaimer: 'Illustrative heuristic result, not a security guarantee. Syntactic validation and pattern detection do not replace live threat intelligence.',
      breakdown: {
        dfaPenalty: 50,
        regexPenalty: 50,
        suspiciousPenalty: 0
      }
    };
  }

  // Calculate cumulative penalty based on detected indicators
  const indicators = suspiciousResult.indicators || [];
  let baseScore = 0;
  let criticalCount = 0;
  let highCount = 0;

  for (const indicator of indicators) {
    baseScore += indicator.weight;
    if (indicator.severity === 'CRITICAL') criticalCount++;
    if (indicator.severity === 'HIGH') highCount++;
  }

  // Cap base score between 0 and 100
  let finalScore = Math.min(100, Math.max(0, baseScore));

  // If there are critical indicators (like @ symbol spoofing), score must be at least 85
  if (criticalCount > 0) {
    finalScore = Math.max(finalScore, 85);
  } else if (highCount >= 2) {
    finalScore = Math.max(finalScore, 75);
  } else if (highCount === 1) {
    finalScore = Math.max(finalScore, 55);
  }

  // Determine Risk Category
  let level = 'LOW';
  let statusLabel = 'SAFE-LOOKING';
  let badgeColor = 'emerald';
  let summary = 'No high-risk syntactic anomalies or phishing signatures detected.';
  let recommendation = 'URL conforms to standard web syntax. Standard browsing caution still applies.';

  if (finalScore >= 85) {
    level = 'CRITICAL';
    statusLabel = 'HIGH RISK / SEVERE PHISHING INDICATORS';
    badgeColor = 'rose';
    summary = 'Extreme risk detected. High probability of deceptive credential harvesting or credential spoofing.';
    recommendation = 'DO NOT VISIT. Block this URL immediately and submit to security operations.';
  } else if (finalScore >= 55) {
    level = 'HIGH';
    statusLabel = 'HIGH RISK';
    badgeColor = 'red';
    summary = 'Significant indicators of malicious or deceptive behavior identified.';
    recommendation = 'Avoid navigating to this URL. Verify destination authenticity through out-of-band channels.';
  } else if (finalScore >= 25) {
    level = 'MEDIUM';
    statusLabel = 'SUSPICIOUS / ELEVATED RISK';
    badgeColor = 'amber';
    summary = 'Moderate risk indicators observed (e.g. shortening service, sensitive keywords, or HTTP protocol).';
    recommendation = 'Exercise caution before entering any personal data or credentials.';
  } else {
    level = 'LOW';
    statusLabel = 'SAFE-LOOKING';
    badgeColor = 'emerald';
    summary = 'URL passed all syntax automaton states with zero elevated threat markers.';
    recommendation = 'URL appears syntactically legitimate. Note that benign syntax does not guarantee absolute safety.';
  }

  // Compile detailed justification reasons
  const reasons = [];
  if (indicators.length === 0) {
    reasons.push('Passed RFC 3986 regular expression validation.');
    reasons.push('Accepted by Deterministic Finite Automaton (q0 ➔ q1 ➔ q2 ➔ q3 ➔ q4).');
    reasons.push('No known URL shorteners, raw IP authorities, or credential spoofing tokens detected.');
  } else {
    for (const ind of indicators) {
      reasons.push(`[${ind.severity}] ${ind.name}: ${ind.description}`);
    }
  }

  return {
    score: finalScore,
    level,
    statusLabel,
    badgeColor,
    summary,
    reasons,
    recommendation,
    disclaimer: 'Illustrative heuristic result, not a security guarantee. Syntactic validation and pattern detection do not replace live threat intelligence.',
    breakdown: {
      totalIndicators: indicators.length,
      criticalIndicators: criticalCount,
      highIndicators: highCount,
      weightedPenalty: baseScore
    }
  };
}

module.exports = {
  computeRiskScore
};
