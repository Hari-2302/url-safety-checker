# REST API Documentation

Base URL: `http://localhost:5000/api`

---

## 1. URL Analysis Endpoint

### `POST /api/analyze`
Analyzes a URL using the dual-engine Deterministic Finite Automaton (DFA) and RFC 3986 Regular Expression parser, executes suspicious heuristic checks, and persists results to MongoDB.

#### Request Headers
* `Content-Type: application/json`

#### Request Body
```json
{
  "url": "https://www.google.com"
}
```

#### Successful Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "id": "6741b2a9f4c3...",
    "url": "https://www.google.com",
    "risk": {
      "score": 0,
      "level": "LOW",
      "statusLabel": "SAFE-LOOKING",
      "badgeColor": "emerald",
      "summary": "URL passed all syntax automaton states with zero elevated threat markers.",
      "reasons": [
        "Passed RFC 3986 regular expression validation.",
        "Accepted by Deterministic Finite Automaton (q0 ➔ q1 ➔ q2 ➔ q3 ➔ q4).",
        "No known URL shorteners, raw IP authorities, or credential spoofing tokens detected."
      ],
      "recommendation": "URL appears syntactically legitimate. Note that benign syntax does not guarantee absolute safety.",
      "disclaimer": "Illustrative heuristic result, not a security guarantee. Syntactic validation and pattern detection do not replace live threat intelligence."
    },
    "dfa": {
      "accepted": true,
      "finalState": "q4",
      "stateSequence": ["q0", "q1", "q2", "q3", "q4"],
      "stepTrace": [
        { "step": 1, "from": "q0", "to": "q1", "rule": "δ(q0, Scheme) = q1" }
      ],
      "componentTransitions": [
        { "from": "q0", "to": "q1", "component": "Protocol", "token": "https" },
        { "from": "q1", "to": "q2", "component": "Separator", "token": "://" },
        { "from": "q2", "to": "q3", "component": "Domain Labels", "token": "www.google" },
        { "from": "q3", "to": "q4", "component": "TLD", "token": ".com" }
      ],
      "transitionSummary": "q0 ➔ q1 ➔ q2 ➔ q3 ➔ q4 (ACCEPTED)"
    },
    "regex": {
      "isValid": true,
      "components": {
        "protocol": "https",
        "domain": "google.com",
        "tld": "com",
        "port": 443,
        "path": "/"
      }
    },
    "suspicious": {
      "totalIndicators": 0,
      "indicators": [],
      "isSuspicious": false
    },
    "dbStatus": "MONGODB_CONNECTED",
    "createdAt": "2026-11-23T06:00:00.000Z"
  }
}
```

#### Error Response (`400 Bad Request`)
```json
{
  "success": false,
  "error": "URL cannot be empty or whitespace."
}
```

---

## 2. Analysis History Endpoints

### `GET /api/history`
Retrieves past URL analyses from MongoDB with pagination, filtering, and search.

#### Query Parameters
| Parameter | Type | Required | Description |
|---|---|---|---|
| `page` | Integer | No | Page number (default: 1) |
| `limit` | Integer | No | Records per page (default: 50, max: 100) |
| `riskLevel` | String | No | Filter by risk: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` |
| `search` | String | No | Search query for URL or domain substring |

#### Response (`200 OK`)
```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "total": 42,
    "page": 1,
    "limit": 50,
    "totalPages": 1,
    "dbMode": "MONGODB_CONNECTED"
  }
}
```

### `GET /api/history/:id`
Retrieves full details including full micro-trace for a single audit record.

### `DELETE /api/history/:id`
Removes a specific analysis record from MongoDB.

### `DELETE /api/history`
Clears the entire analysis collection.

---

## 3. Analytics & Theoretical Model Endpoints

### `GET /api/stats`
Returns aggregated metrics for the Security Operations Center (SOC) dashboard.
```json
{
  "success": true,
  "data": {
    "total": 128,
    "safeCount": 85,
    "mediumCount": 27,
    "highCount": 16,
    "dbStatus": "MONGODB_CONNECTED",
    "recent": [ ... ]
  }
}
```

### `GET /api/dfa-model`
Returns the formal 5-tuple, state roster, and complete $\delta$ transition table.

### `GET /api/health`
Health check status of the backend API and database connection.
```json
{
  "status": "online",
  "service": "URL Safety Checker API",
  "version": "1.0.0",
  "database": {
    "connected": true,
    "mode": "MONGODB_CONNECTED",
    "uri": "mongodb://127.0.0.1:27017/url_safety_checker"
  }
}
```
