const fs = require('fs');
const path = require('path');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  ShadingType
} = require('docx');

async function createDocument() {
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: 'Calibri',
            size: 22, // 11pt
            color: '2D3748'
          },
          paragraph: {
            spacing: {
              line: 276,
              before: 120,
              after: 120
            }
          }
        }
      }
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch
              bottom: 1440,
              left: 1440,
              right: 1440
            }
          }
        },
        children: [
          // Title
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 100 },
            children: [
              new TextRun({
                text: 'ACADEMIC TECHNICAL REPORT',
                bold: true,
                size: 32, // 16pt
                color: '1A365D'
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 300 },
            children: [
              new TextRun({
                text: 'URL Safety Checker & Finite Automata Architecture',
                bold: true,
                size: 26, // 13pt
                color: '2B6CB0'
              })
            ]
          }),

          // 1. NETWORK TOPOLOGY
          heading1('1. NETWORK TOPOLOGY & DEVICE INTERCONNECTION'),
          heading2('1.1 Network Architecture & Topology Classification'),
          p('The URL Safety Checker implements a Hybrid Multi-Tier Client-Server Star Topology deployed over a Wide Area Network (WAN / Public Internet). The system interconnects three distinct architectural tiers: the Edge Client Tier (Analyst React Dashboard deployed on GitHub Pages CDN), the Application Server Tier (Node.js & Express REST Engine on Render Cloud Container), and the Cloud Database Tier (MongoDB Atlas Multi-Region Replica Set).'),
          
          heading2('1.2 Network Interconnection & Hardware Device Roles'),
          p('In this network architecture, several physical and logical network devices work together to guarantee reliable and secure transmission:'),
          bullet('Network Interface Card (NIC): Operates at Physical & Data Link layers (OSI Layers 1 & 2) on the workstation to encode and transmit digital frames over Wi-Fi (IEEE 802.11) or Ethernet (IEEE 802.3).'),
          bullet('Network Switch (Layer 2): Maintains a CAM MAC Address Table to forward Ethernet frames within the local subnet without collisions.'),
          bullet('Local Gateway Router (Layer 3): Acts as the default gateway (192.168.1.1), provides DHCP dynamic IP configuration, executes Network Address Translation (NAT) to map private IPs to public WAN IPs, and routes packets to the Internet Service Provider (ISP).'),
          bullet('ISP Edge Routers & Autonomous Systems (AS): Route packets across the Internet backbone using Border Gateway Protocol (BGP).'),
          bullet('Cloud Reverse Proxy & Load Balancer (Cloud Edge): Receives incoming HTTPS traffic on Port 443, handles TLS termination, performs DDoS protection, and distributes HTTP requests to backend container instances on Port 5000.'),
          bullet('MongoDB Atlas Replica Set Router (mongos): Routes database write queries across multi-region replica nodes to ensure high availability and zero data loss.'),

          heading2('1.3 Topology Interconnection Diagram'),
          codeBox([
            '[Analyst Workstation / Browser Dashboard]',
            '    │ (LAN: 192.168.1.15 : Ephemeral Port 53210)',
            '    ▼',
            '[Local Gateway / NAT Router] (LAN: 192.168.1.1 ──> Public IP: 103.212.x.x)',
            '    │',
            '    ▼ (WAN / ISP Optical Fiber / BGP Internet Routing)',
            '[GitHub Pages Anycast CDN] (185.199.108.153 : Port 443 ──> Serves React SPA)',
            '    │',
            '    ▼ (HTTPS REST Ingestion: POST /api/analyze)',
            '[Cloud Load Balancer & Reverse Proxy] (Public Anycast IP : Port 443)',
            '    │ (Internal Container Binding: 0.0.0.0 : Port 5000)',
            '    ▼',
            '[Node.js + Express Backend Server] (Evaluates DFA: q0 -> q1 -> q2 -> q3 -> q4)',
            '    │',
            '    ▼ (Secure TLS TCP Socket : Port 27017)',
            '[MongoDB Atlas Cloud Database Cluster] (Host: cluster0.ug1wfgq.mongodb.net)',
            '    ├── Primary Database Node (Active Read/Write: url_safety_checker)',
            '    └── Secondary Replica Nodes (Automatic Failover & Redundancy)'
          ]),

          // 2. IP ADDRESSING SCHEME
          heading1('2. IP ADDRESSING SCHEME & COMMUNICATION ANALYSIS'),
          p('IP addressing provides logical identification and routing for every node across the Internet. The table below identifies each entity in our URL Safety Checker system, its assigned IP address, category, and functional role:'),
          createTable(
            ['Network Entity', 'Assigned IP / Domain', 'IP Class / Type', 'Functional Role'],
            [
              ['Client Workstation', '192.168.1.15', 'Private IPv4 (Class C, /24)', 'Originates URL analysis requests & loads cyber UI'],
              ['Local Gateway Router', '192.168.1.1', 'Private Gateway IPv4', 'Performs DHCP allocation and stateful NAT translation'],
              ['Client Public IP', '103.212.x.x (Dynamic)', 'Public Routable IPv4', 'Identifies the client LAN across the public Internet'],
              ['GitHub Pages CDN', '185.199.108.153', 'Public Anycast IPv4', 'Delivers React static bundle via edge caching'],
              ['Render Backend API', 'Cloud Anycast Domain', 'Public Cloud Anycast IPv4', 'Receives REST payloads & executes DFA + Regex logic'],
              ['MongoDB Atlas', 'cluster0.ug1wfgq.mongodb.net', 'Cloud Distributed Domain', 'Hosts persistent urlanalyses audit collections']
            ],
            [2200, 2600, 2400, 3200]
          ),

          heading2('2.1 Network Address Translation (NAT) & Private-to-Public Mapping'),
          p('Under RFC 1918, private IP addresses (such as 192.168.1.15) cannot be routed across the Internet. When the analyst submits a URL, the local gateway router executes Network Address Port Translation (NAPT). The router replaces the private source IP (192.168.1.15:53210) with its own public IP (103.212.x.x:62105) and registers this translation in its stateful NAT table. When the cloud backend replies with HTTP 200 OK, the router references the NAT table to route the response back to the private client workstation.'),

          heading2('2.2 Domain Name System (DNS) Resolution Process'),
          p('Before sending analysis payloads, the client must resolve the backend and database domains into IP addresses:'),
          numbered('1. Client OS checks local DNS cache and hosts file.'),
          numbered('2. Recursive DNS query is dispatched over UDP Port 53 to Google DNS (8.8.8.8) or ISP DNS resolver.'),
          numbered('3. The resolver navigates the DNS hierarchy: Root Servers (.) ──> TLD Servers (.com / .net) ──> Authoritative Name Servers.'),
          numbered('4. The Authoritative Server returns an "A" Record pointing to the Anycast public IP.'),
          numbered('5. The client caches the IP and initiates the TCP 3-way handshake.'),

          // 3. PROTOCOLS USED
          heading1('3. PROTOCOLS USED & WORKING PRINCIPLES'),
          p('The URL safety checking system utilizes a comprehensive protocol stack conforming to both the OSI 7-Layer Reference Model and the TCP/IP 4-Layer Architecture:'),
          createTable(
            ['OSI Layer', 'Protocol(s) Used', 'Role in URL Safety Checker System'],
            [
              ['Layer 7: Application', 'HTTP/1.1, HTTPS, REST, DNS', 'Transmits serialized JSON analysis payloads; handles REST endpoints (/api/analyze, /api/history, /api/stats, /api/dfa-model).'],
              ['Layer 6: Presentation', 'TLS 1.3, SSL, JSON Encoding', 'Handles asymmetric/symmetric cryptographic encryption, data formatting, and JSON object serialization.'],
              ['Layer 4: Transport', 'TCP (Transmission Control Protocol)', 'Guarantees reliable, in-order, error-checked telemetry delivery via 3-way handshake, Seq/Ack numbers, and flow control.'],
              ['Layer 3: Network', 'IPv4, ICMP, ARP, BGP', 'Handles logical end-to-end routing of IP datagrams across Autonomous Systems and Internet backbones.'],
              ['Layers 1 & 2: Link / Physical', 'Ethernet 802.3, Wi-Fi 802.11, Cat6', 'Governs framing, MAC addressing, hardware collision avoidance, and bit-level transmission across physical media.']
            ],
            [2200, 2600, 5600]
          ),

          heading2('3.1 Application Layer: HTTP/1.1 & REST Architecture'),
          p('Communication between the React client and the backend server follows the RESTful architectural pattern:'),
          bullet('POST /api/analyze: Ingests target URL. Triggers lexical DFA evaluation (q0 -> q1 -> q2 -> q3 -> q4), RFC 3986 regex parsing, heuristic threat scoring, and MongoDB Atlas persistence.'),
          bullet('GET /api/history: Queries past analysis audit records, supporting pagination and risk severity filtering (LOW, MEDIUM, HIGH, CRITICAL).'),
          bullet('GET /api/stats: Queries aggregated telemetry (total analyzed, safe count, medium count, high/critical threat count).'),
          bullet('GET /api/dfa-model: Exposes the formal 5-tuple M = (Q, Σ, δ, q0, F) and complete transition table for visualization.'),
          bullet('GET /api/health: Provides live system diagnostic telemetry including database connection state.'),

          heading2('3.2 Transport Layer: Transmission Control Protocol (TCP)'),
          p('TCP is chosen over UDP for security verification because audit logs and automata state transitions require 100% reliable, zero-loss transmission:'),
          numbered('1. TCP 3-Way Handshake: Client sends SYN ──> Server replies with SYN-ACK ──> Client sends ACK. A reliable full-duplex session is established.'),
          numbered('2. Sequence & Acknowledgment Numbers: Every segment carries a unique Sequence Number; the receiver acknowledges received bytes, allowing the sender to detect missing segments.'),
          numbered('3. Flow & Congestion Control: Advertised window sizes prevent receiver buffer overflow, while Congestion Avoidance algorithms prevent router queue collapse.'),
          numbered('4. Connection Teardown: Uses a 4-way FIN/ACK handshake to cleanly release operating system socket buffers.'),

          heading2('3.3 Security Layer: TLS 1.3 Cryptographic Handshake'),
          p('All communications are encrypted using Transport Layer Security (TLS 1.3). During connection establishment, the client verifies the cloud edge X.509 digital certificate signed by a trusted Certificate Authority (Let\'s Encrypt). An Elliptic Curve Diffie-Hellman Ephemeral (ECDHE) exchange establishes symmetric AES-256-GCM session keys, ensuring confidentiality, integrity, and non-repudiation.'),

          // 4. PORT NUMBERS
          heading1('4. PORT NUMBERS & JUSTIFICATION'),
          p('Port numbers are 16-bit unsigned integers (0 to 65535) defined at the Transport Layer to identify specific application processes on a host. The table below details every port used in our system along with its technical justification:'),
          createTable(
            ['Port No.', 'Protocol', 'Associated Service', 'Technical Justification & Purpose'],
            [
              ['443', 'TCP', 'HTTPS (Secure Web)', 'Standard IANA port for encrypted web traffic between client and cloud. Prevents eavesdropping on public networks.'],
              ['80', 'TCP', 'HTTP (Standard Web)', 'Standard unencrypted web port. Automatically issues HTTP 301/308 redirects to Port 443 to enforce HTTPS.'],
              ['5000', 'TCP', 'Express Server (Internal)', 'Backend application listener port bound to 0.0.0.0 inside the cloud container environment.'],
              ['5173', 'TCP', 'Vite Dev Server', 'Development port for React frontend, providing fast Hot Module Replacement (HMR) during local engineering.'],
              ['27017', 'TCP', 'MongoDB Atlas Wire Protocol', 'Standard IANA port for MongoDB Wire Protocol socket connections over TLS to the cloud database cluster.'],
              ['49152–65535', 'TCP', 'Ephemeral Client Ports', 'Dynamically allocated by client operating system to uniquely separate concurrent TCP sessions on the client.']
            ],
            [1500, 1500, 2600, 4800]
          ),

          heading2('4.1 Socket Pair Analysis'),
          p('At the transport layer, every active communication channel is uniquely identified by a 4-tuple Socket Pair:'),
          p('Socket Pair = (Source IP, Source Port, Destination IP, Destination Port)'),
          p('Example URL Analysis Transmission: (192.168.1.15 : 53210, 216.24.57.1 : 443)'),
          bullet('Destination Port 443 directs the packet to the cloud HTTPS reverse proxy.'),
          bullet('Source Port 53210 ensures that when the HTTP 200 response returns, the client OS routes it directly to the exact browser tab that initiated the request.'),

          // 5. PACKET FLOW
          heading1('5. END-TO-END PACKET FLOW & LIFECYCLE'),
          p('The diagram and steps below trace the complete lifecycle of a URL inspection request from initial user entry to database persistence and return response:'),
          codeBox([
            '[Analyst Station]          [Gateway / NAT]           [Cloud Edge / TLS]        [Express Server]         [MongoDB Atlas]',
            '       │                          │                          │                         │                         │',
            '  1.   │ ── DNS Query (UDP 53) ─> │                          │                         │                         │',
            '       │ <─ DNS Reply (IP) ────── │                          │                         │                         │',
            '       │                          │                          │                         │                         │',
            '  2.   │ ── TCP SYN (Port 53210) >│ ── [NAT Port 62105] ───> │                         │                         │',
            '       │ <─ TCP SYN-ACK ───────── │ <─────────────────────── │                         │                         │',
            '       │ ── TCP ACK ─────────────>│ ───────────────────────> │                         │                         │',
            '       │                          │                          │                         │                         │',
            '  3.   │ ── TLS 1.3 Handshake ──> │ ───────────────────────> │ (TLS Termination)       │                         │',
            '       │ <─ TLS Key Exchange ───> │ <──────────────────────> │                         │                         │',
            '       │                          │                          │                         │                         │',
            '  4.   │ ── Encrypted HTTPS POST ─│ ───────────────────────> │                         │                         │',
            '       │    Payload: {"url":...}  │                          │ ── Internal Proxy ────> │                         │',
            '       │                          │                          │    (Forward Port 5000)  │ 5. Middleware Check     │',
            '       │                          │                          │                         │ 6. Run DFA State Engine │',
            '       │                          │                          │                         │ 7. Run Regex & Heuristic│',
            '       │                          │                          │                         │ 8. Calculate Score      │',
            '       │                          │                          │                         │ 9. Socket Write (27017) │',
            '       │                          │                          │                         │ ──────────────────────> │',
            '       │                          │                          │                         │ <─ Write ACK (Committed)│',
            '       │                          │                          │ <─ HTTP 200 Response ── │                         │',
            '  10.  │ <─ Encrypted HTTP 200 ── │ <─ NAT Demux ─────────── │                         │                         │',
            '       │    (JSON Result Body)    │                          │                         │                         │',
            '       │                          │                          │                         │                         │',
            '       │ ── UI Glows & Displays ─ │                          │                         │                         │',
            '       │    DFA Trajectory & Risk │                          │                         │                         │'
          ]),

          heading2('5.1 Detailed 10-Step Packet Traversal'),
          numbered('1. Application Serialization: Analyst enters a URL and clicks "Run Analysis". Browser packages JSON payload: {"url":"https://www.google.com"}.'),
          numbered('2. DNS Resolution: Browser queries local DNS over UDP Port 53 to resolve backend domain into the public Anycast IP address.'),
          numbered('3. TCP Handshake: Client operating system dispatches TCP SYN segment with ephemeral port (53210). Server responds with SYN-ACK, client replies with ACK.'),
          numbered('4. TLS 1.3 Negotiation: Digital certificate verification and ECDHE key exchange establish symmetric AES-256 session keys.'),
          numbered('5. Encapsulation: The payload is encapsulated through the stack: JSON Data ──> HTTP POST ──> TLS Record ──> TCP Segment ──> IP Datagram ──> Ethernet Frame.'),
          numbered('6. Local NAT & WAN Routing: Client NIC transmits frame to local router ──> Router performs NAT (translates private IP to public IP) ──> Packet traverses ISP BGP backbones to cloud edge.'),
          numbered('7. Reverse Proxy Decapsulation: Cloud edge load balancer terminates TLS and passes unencrypted HTTP request internally to Node.js on Port 5000.'),
          numbered('8. Express Middleware & Automata Processing: Express runs validateUrlInput middleware. Valid URL passes to DFA engine (q0 -> q1 -> q2 -> q3 -> q4), RFC 3986 regex validator, and heuristic threat detectors.'),
          numbered('9. MongoDB Cloud Socket Write: Server initiates a TLS TCP socket write on Port 27017 to MongoDB Atlas cluster. MongoDB commits the audit record and returns write acknowledgment.'),
          numbered('10. Return Response: Backend constructs HTTP 200 OK response with JSON analysis verdict. Packet traverses back through NAT to workstation, and React UI visualizes the DFA state path in real time.')
        ]
      },
      {
        properties: {
          page: {
            margin: {
              top: 1440,
              bottom: 1440,
              left: 1440,
              right: 1440
            }
          }
        },
        children: [
          // 6. SIMULATION SCENARIOS
          heading1('6. NETWORK SIMULATION SCENARIOS IN THE PROJECT'),
          p('The project includes comprehensive test scenarios to demonstrate network protocol behavior, DFA state transitions, and heuristic threat responses under various URL structures:'),
          createTable(
            ['Simulation Action', 'Network Condition Simulated', 'Protocol Layer Behavior', 'FSM / Automata & Database Response'],
            [
              [
                'Benign Standard URL (https://www.google.com)',
                'Healthy packet transmission; legitimate FQDN domain',
                'HTTP 200 OK over TLS stream; RFC 3986 regex passes',
                'DFA accepts: q0 -> q1 -> q2 -> q3 -> q4. Score: 0/100 (LOW / Safe-looking). Persisted in MongoDB Atlas.'
              ],
              [
                'Userinfo Spoofing Phish (http://paypal.com@evil.com/signin)',
                'High-risk credential harvesting / visual deception',
                'HTTP 200 OK with payload warning headers',
                'DFA accepts syntax. Deceptive @ symbol flagged. Score: 90/100 (CRITICAL). Phishing alert logged.'
              ],
              [
                'Raw IP Host Authority (http://192.168.1.1/login)',
                'Payload bypasses domain reputation filters',
                'HTTP 200 OK; IPv4 octet regex matches',
                'DFA accepts. Raw IP host authority detected + sensitive keyword. Score: 65/100 (HIGH). Threat alert logged.'
              ],
              [
                'URL Shortener Cloaking (https://bit.ly/3xY7zSecure)',
                'Masked destination endpoint',
                'HTTP 200 OK over TLS stream',
                'DFA accepts. Known shortening service identified. Score: 35/100 (MEDIUM). Evasion alert logged.'
              ],
              [
                'Punycode IDN Homograph (https://xn--pple-43d.com/signin)',
                'Cyrillic character spoofing attack',
                'HTTP 200 OK over TLS stream',
                'DFA recognizes xn-- prefix. Homograph evasion detected. Score: 70/100 (HIGH). Threat alert logged.'
              ],
              [
                'Malformed Protocol (ftp://invalidscheme.org)',
                'Protocol violation / unsupported application scheme',
                'HTTP 200 OK / 400 Bad Request with error summary',
                'DFA rejects at q0: transitions to qReject (Trap State). Score: 100/100 (MALFORMED). Syntax rejection logged.'
              ]
            ],
            [2600, 2400, 2400, 3000]
          ),

          // 7. GITHUB REPOSITORY
          heading1('7. GITHUB REPOSITORY'),
          p('The complete full-stack source code, automata engines, unit tests, and deployment files are publicly accessible at the repositories below:'),
          createTable(
            ['Resource', 'Platform', 'Public Access Link'],
            [
              ['GitHub Repository Link', 'GitHub', 'https://github.com/Hari-2302/url-safety-checker'],
              ['Live Web Application Link', 'GitHub Pages', 'https://hari-2302.github.io/url-safety-checker/'],
              ['Database Cluster', 'MongoDB Atlas', 'cluster0.ug1wfgq.mongodb.net (Database: url_safety_checker)']
            ],
            [3000, 2000, 5400]
          ),

          new Paragraph({
            spacing: { before: 400 },
            children: [
              new TextRun({
                text: 'End of Technical Report',
                italics: true,
                size: 20,
                color: '718096'
              })
            ],
            alignment: AlignmentType.CENTER
          })
        ]
      }
    ]
  });

  const buffer = await Packer.toBuffer(doc);
  const outPath = path.join(__dirname, '..', 'URL_Safety_Checker_Technical_Report.docx');
  fs.writeFileSync(outPath, buffer);
  console.log('✅ Word document created successfully at:', outPath);
}

// Helpers
function heading1(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 280, after: 140 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 28, // 14pt
        color: '1A365D'
      })
    ]
  });
}

function heading2(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 200, after: 100 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 24, // 12pt
        color: '2B6CB0'
      })
    ]
  });
}

function p(text) {
  return new Paragraph({
    spacing: { before: 80, after: 80 },
    children: [
      new TextRun({
        text,
        size: 22,
        color: '2D3748'
      })
    ]
  });
}

function bullet(text) {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { before: 40, after: 40 },
    children: [
      new TextRun({
        text,
        size: 21,
        color: '2D3748'
      })
    ]
  });
}

function numbered(text) {
  return new Paragraph({
    spacing: { before: 40, after: 40 },
    children: [
      new TextRun({
        text,
        size: 21,
        color: '2D3748'
      })
    ]
  });
}

function codeBox(lines) {
  return new Table({
    width: { size: 10400, type: WidthType.DXA },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 10400, type: WidthType.DXA },
            shading: { fill: '0F172A', type: ShadingType.CLEAR },
            margins: { top: 140, bottom: 140, left: 160, right: 160 },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 4, color: '334155' },
              bottom: { style: BorderStyle.SINGLE, size: 4, color: '334155' },
              left: { style: BorderStyle.SINGLE, size: 4, color: '334155' },
              right: { style: BorderStyle.SINGLE, size: 4, color: '334155' }
            },
            children: lines.map(line => new Paragraph({
              spacing: { before: 20, after: 20 },
              children: [
                new TextRun({
                  text: line,
                  font: 'Consolas',
                  size: 16, // 8pt
                  color: '38BDF8'
                })
              ]
            }))
          })
        ]
      })
    ]
  });
}

function createTable(headers, rows, colWidths) {
  const tableRows = [
    new TableRow({
      tableHeader: true,
      children: headers.map((h, i) => new TableCell({
        width: { size: colWidths[i] || 2500, type: WidthType.DXA },
        shading: { fill: '1E293B', type: ShadingType.CLEAR },
        margins: { top: 120, bottom: 120, left: 120, right: 120 },
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: h,
                bold: true,
                size: 20,
                color: 'F8FAFC'
              })
            ]
          })
        ]
      }))
    })
  ];

  rows.forEach((row, rowIdx) => {
    const bgColor = rowIdx % 2 === 0 ? 'FFFFFF' : 'F8FAFC';
    tableRows.push(
      new TableRow({
        children: row.map((cellText, cellIdx) => new TableCell({
          width: { size: colWidths[cellIdx] || 2500, type: WidthType.DXA },
          shading: { fill: bgColor, type: ShadingType.CLEAR },
          margins: { top: 100, bottom: 100, left: 120, right: 120 },
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: cellText,
                  size: 19,
                  color: '334155'
                })
              ]
            })
          ]
        }))
      })
    );
  });

  return new Table({
    width: { size: 10400, type: WidthType.DXA },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 2, color: 'CBD5E1' },
      bottom: { style: BorderStyle.SINGLE, size: 2, color: 'CBD5E1' },
      left: { style: BorderStyle.SINGLE, size: 2, color: 'CBD5E1' },
      right: { style: BorderStyle.SINGLE, size: 2, color: 'CBD5E1' },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' },
      insideVertical: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' }
    },
    rows: tableRows
  });
}

createDocument().catch(err => {
  console.error('Error generating document:', err);
  process.exit(1);
});
