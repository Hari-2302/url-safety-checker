# Formal Automata Transition Table ($\delta$ Function Matrix)

This document specifies the complete transition function $\delta: Q \times \Sigma \to Q$ for the URL validation Deterministic Finite Automaton.

## Transition Matrix

| Current State ($q$) | Input Symbol / Token Class ($\sigma$) | Next State ($\delta(q, \sigma)$) | Accepting? | Formal Grammar / Semantic Meaning |
|---|---|---|---|---|
| **$q_0$** | `"http"` \| `"https"` | **$q_1$** | No | Valid web protocol scheme recognized. |
| **$q_0$** | $\neg(\text{"http"} \mid \text{"https"})$ | **$q_{\text{reject}}$** | No | Unsupported scheme (e.g. `ftp`, `file`, `telnet`) or malformed prefix. |
| **$q_1$** | `"://"` | **$q_2$** | No | Protocol authority separator delimiter verified. |
| **$q_1$** | $\neg\text{"://"}$ | **$q_{\text{reject}}$** | No | Missing or malformed separator (e.g. `http//` or `http:/`). |
| **$q_2$** | Valid Domain Label `[a-zA-Z0-9]([a-zA-Z0-9\-]*[a-zA-Z0-9])?` | **$q_3$** | No | Domain name label parsed; adheres to RFC 1035 syntax. |
| **$q_2$** | Empty Host / Illegal Characters | **$q_{\text{reject}}$** | No | Host authority missing or contains illegal symbols. |
| **$q_3$** | Valid TLD (`.com`, `.org`, `.net`, `.edu`, `.gov`, `.io`, etc.) | **$q_4$** | **Yes [F]** | Valid Top-Level Domain suffix recognized. Automaton enters accepting state. |
| **$q_3$** | Missing or Invalid TLD | **$q_{\text{reject}}$** | No | Domain lacks recognized TLD suffix. |
| **$q_4$** | Valid Port (`:8080`, `:443`, `:3000`) | **$q_4$** | **Yes [F]** | Numeric port specification within legal range ($1 \le P \le 65535$). |
| **$q_4$** | Valid Path (`/api/v1/resource`) | **$q_4$** | **Yes [F]** | RFC 3986 path continuation loop. |
| **$q_4$** | Valid Query / Fragment (`?param=1#sec`) | **$q_4$** | **Yes [F]** | URL parameter string and anchor identifier. |
| **$q_4$** | Unencoded Whitespace / Control Characters | **$q_{\text{reject}}$** | No | Malformed URL continuation containing illegal characters. |
| **$q_{\text{reject}}$** | Any character $\sigma \in \Sigma$ | **$q_{\text{reject}}$** | No | Absorbing trap state; once entered, string is rejected. |

---

## Token Class Definitions

1. **Protocol Scheme Class**:
   $$\text{SCHEME} = \{ \text{"http"}, \text{"https"} \}$$
2. **Authority Separator Class**:
   $$\text{SEPARATOR} = \{ \text{"://"} \}$$
3. **Domain Label Class**:
   $$\text{LABEL} = \{ w \in \{a\dots z, 0\dots 9, -\} \mid \text{first and last characters are alphanumeric} \}$$
4. **Top-Level Domain Class**:
   $$\text{TLD} = \{ \text{known alphabetic TLDs with } 2 \le |w| \le 24 \} \cup \{ \text{"xn--"} \cdot [a\dots z0\dots 9]+ \}$$
5. **Resource Continuation Class**:
   $$\text{CONTINUATION} = \{ \text{port, path, query, fragment without unencoded whitespace} \}$$
