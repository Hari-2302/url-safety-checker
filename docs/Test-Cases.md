# Academic Test Cases & Verification Suite

The URL Safety Checker has been rigorously evaluated against standard benign URLs, phishing kits, evasive obfuscation techniques, and syntactically malformed inputs.

## Comprehensive Test Matrix

| # | Test Scenario | Input URL | Expected DFA Path | Regex Valid? | Detected Threat Indicators | Expected Risk Level | Status |
|---|---|---|---|---|---|---|---|
| **TC-01** | Standard Benign Search Engine | `https://www.google.com` | $q_0 \to q_1 \to q_2 \to q_3 \to q_4$ | Valid | None | **LOW (Safe-looking)** | ✅ Passed |
| **TC-02** | Benign URL with Path & Query | `https://github.com/project/repo?branch=main#readme` | $q_0 \to q_1 \to q_2 \to q_3 \to q_4$ | Valid | None | **LOW (Safe-looking)** | ✅ Passed |
| **TC-03** | Insecure HTTP Benign | `http://example.org` | $q_0 \to q_1 \to q_2 \to q_3 \to q_4$ | Valid | Insecure HTTP | **LOW (Safe-looking)** | ✅ Passed |
| **TC-04** | Userinfo `@` Phishing Spoof | `http://paypal.com@evil-attacker-site.com/signin` | $q_0 \to q_1 \to q_2 \to q_3 \to q_4$ | Valid | Deceptive Userinfo `@` Symbol | **CRITICAL (Phishing)** | ✅ Passed |
| **TC-05** | Raw IPv4 Host Authority | `http://192.168.1.1/login` | $q_0 \to q_1 \to q_2 \to q_3 \to q_4$ | Valid | Raw IP Host, Sensitive Keywords | **HIGH (Threat)** | ✅ Passed |
| **TC-06** | Known URL Shortener | `https://bit.ly/3xY7zSecure` | $q_0 \to q_1 \to q_2 \to q_3 \to q_4$ | Valid | Known URL Shortener | **MEDIUM (Suspicious)** | ✅ Passed |
| **TC-07** | Punycode IDN Homograph | `https://xn--pple-43d.com/signin` | $q_0 \to q_1 \to q_2 \to q_3 \to q_4$ | Valid | Punycode Homograph, Keywords | **HIGH (Threat)** | ✅ Passed |
| **TC-08** | Excessive Subdomain Nesting | `https://login.portal.bank.verify.secure.example.com` | $q_0 \to q_1 \to q_2 \to q_3 \to q_4$ | Valid | Excessive Subdomains, Keywords | **HIGH (Threat)** | ✅ Passed |
| **TC-09** | Non-standard Service Port | `http://example.com:31337/backdoor` | $q_0 \to q_1 \to q_2 \to q_3 \to q_4$ | Valid | Non-standard Port | **MEDIUM (Suspicious)** | ✅ Passed |
| **TC-10** | Obfuscated Hex / Path Traversal | `https://example.com/dir/%2e%2e/%00/payload` | $q_0 \to q_1 \to q_2 \to q_3 \to q_4$ | Valid | Excessive URL Hex Obfuscation | **HIGH (Threat)** | ✅ Passed |
| **TC-11** | High Shannon Entropy (DGA) | `https://qzxjkvwqnm1892.com` | $q_0 \to q_1 \to q_2 \to q_3 \to q_4$ | Valid | High Entropy Domain (DGA) | **MEDIUM (Suspicious)** | ✅ Passed |
| **TC-12** | Unsupported Scheme | `ftp://ftp.fileserver.org/download` | $q_0 \to q_{\text{reject}}$ | Invalid | Scheme violation | **MALFORMED (Rejected)** | ✅ Passed |
| **TC-13** | Missing Authority Separator | `http//malformed-url.com` | $q_0 \to q_1 \to q_{\text{reject}}$ | Invalid | Separator violation | **MALFORMED (Rejected)** | ✅ Passed |
| **TC-14** | Missing Domain / TLD | `https://localhost` | $q_0 \to q_1 \to q_2 \to q_{\text{reject}}$ | Invalid | Missing TLD | **MALFORMED (Rejected)** | ✅ Passed |
| **TC-15** | Illegal Whitespace in Path | `https://example.com/bad resource` | $q_0 \to q_1 \to q_2 \to q_3 \to q_4 \to q_{\text{reject}}$ | Invalid | Unencoded whitespace | **MALFORMED (Rejected)** | ✅ Passed |

---

## Automated Test Runner Output

```bash
cd backend
npm test
```

```
====================================================
🧪 Starting Academic Test Suite: URL Safety Checker
====================================================

1. Deterministic Finite Automaton (DFA) Tests:
  ✅ [PASS] DFA accepts standard HTTPS URL (https://www.google.com)
  ✅ [PASS] DFA accepts HTTP with path and query (http://example.org/path?page=1)
  ✅ [PASS] DFA rejects non-HTTP protocol (ftp://files.com)
  ✅ [PASS] DFA rejects missing protocol separator (http//missing.com)
  ✅ [PASS] DFA rejects missing domain or TLD (https://invalid)
  ✅ [PASS] DFA rejects illegal spaces (https://example.com/bad url)

2. Regular Expression Validation Tests:
  ✅ [PASS] Regex correctly parses components for standard URL
  ✅ [PASS] Regex detects raw IPv4 host authority
  ✅ [PASS] Regex rejects malformed string without protocol

3. Suspicious Threat Pattern Detection Tests:
  ✅ [PASS] Detects raw IP address host indicator
  ✅ [PASS] Detects misleading userinfo "@" symbol
  ✅ [PASS] Detects known URL shorteners
  ✅ [PASS] Detects sensitive authentication keywords
  ✅ [PASS] Detects Punycode IDN homograph encoding
  ✅ [PASS] Detects excessive subdomains

4. Risk Scoring & Synthesis Tests:
  ✅ [PASS] Benign URL (https://www.google.com) receives LOW risk score (< 25)
  ✅ [PASS] Deceptive URL with "@" receives CRITICAL risk score (>= 85)
  ✅ [PASS] Malformed syntax URL is marked REJECTED / CRITICAL

====================================================
📊 Test Summary: 18 passed, 0 failed out of 18 tests.
====================================================
```
