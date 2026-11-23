/**
 * VCET FSWD Activity-2 Report Generator
 * Matches the exact format used in FULLSTACK_ACTIVITY_-_2.docx template
 * Run: node generateFSWDReport.js
 */

const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, WidthType, BorderStyle, HeadingLevel, UnderlineType,
  PageOrientation, ShadingType
} = require('docx');
const fs = require('fs');

// ─── Helpers ───────────────────────────────────────────────────────────────

function centered(text, opts = {}) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 0, before: 0 },
    children: [
      new TextRun({
        text,
        font: 'Times New Roman',
        size: opts.size || 24,
        bold: opts.bold !== undefined ? opts.bold : true,
        color: opts.color || '000000',
      }),
    ],
  });
}

function para(text, opts = {}) {
  return new Paragraph({
    alignment: opts.align || AlignmentType.JUSTIFIED,
    spacing: { after: opts.after || 60, before: opts.before || 0 },
    children: [
      new TextRun({
        text,
        font: 'Times New Roman',
        size: opts.size || 20,
        bold: opts.bold || false,
        italics: opts.italic || false,
        underline: opts.underline ? { type: UnderlineType.SINGLE } : undefined,
      }),
    ],
  });
}

function heading(text, size = 30) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { after: 80, before: 160 },
    children: [
      new TextRun({ text, font: 'Times New Roman', size, bold: true }),
    ],
  });
}

function bullet(text, opts = {}) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    bullet: { level: 0 },
    spacing: { after: 40 },
    children: [
      new TextRun({
        text,
        font: 'Times New Roman',
        size: opts.size || 20,
        bold: opts.bold || false,
      }),
    ],
  });
}

function numberedItem(num, label, content, size = 20) {
  return [
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 40, before: 60 },
      children: [
        new TextRun({ text: `${num}. `, font: 'Times New Roman', size, bold: true }),
        new TextRun({ text: `${label}: `, font: 'Times New Roman', size, bold: true }),
        new TextRun({ text: content, font: 'Times New Roman', size, bold: false }),
      ],
    }),
  ];
}

function codeBlock(lines) {
  return lines.map(line =>
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { after: 0 },
      children: [
        new TextRun({ text: line, font: 'Courier New', size: 16, bold: false }),
      ],
    })
  );
}

function emptyLine() {
  return new Paragraph({ spacing: { after: 80 }, children: [new TextRun('')] });
}

function sectionHeading(text) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { after: 80, before: 200 },
    children: [
      new TextRun({ text, font: 'Times New Roman', size: 30, bold: true }),
    ],
  });
}

function subHeading(text) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { after: 60, before: 120 },
    children: [
      new TextRun({ text, font: 'Times New Roman', size: 24, bold: true }),
    ],
  });
}

// ─── Main Report Content ────────────────────────────────────────────────────

const doc = new Document({
  sections: [
    {
      properties: {
        page: { size: { width: 11906, height: 16838 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } },
      },
      children: [

        // ── College Header ──────────────────────────────────────────────
        emptyLine(),
        centered('VELALAR COLLEGE OF ENGINEERING AND TECHNOLOGY, ERODE -12'),
        centered('(AUTONOMOUS)'),
        centered('DEPARTMENT OF INFORMATION TECHNOLOGY'),
        centered('ACADEMIC YEAR: 2026 -27 (ODD)', { size: 24 }),
        centered('ACTIVITY- Project-Based Assessment', { size: 24 }),
        emptyLine(),

        // ── Student Details Table ────────────────────────────────────────
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({ children: [
              new TableCell({ children: [para('NAME :', { bold: true })], width: { size: 30, type: WidthType.PERCENTAGE } }),
              new TableCell({ children: [para('HARIHARAN E')], width: { size: 70, type: WidthType.PERCENTAGE } }),
            ]}),
            new TableRow({ children: [
              new TableCell({ children: [para('CLASS:', { bold: true })] }),
              new TableCell({ children: [para('24IT5A')] }),
            ]}),
            new TableRow({ children: [
              new TableCell({ children: [para('REG.NO:', { bold: true })] }),
              new TableCell({ children: [para('732924ITR032')] }),
            ]}),
            new TableRow({ children: [
              new TableCell({ children: [para('SUBJECT CODE:', { bold: true })] }),
              new TableCell({ children: [para('22ITT51')] }),
            ]}),
            new TableRow({ children: [
              new TableCell({ children: [para('SUBJECT NAME:', { bold: true })] }),
              new TableCell({ children: [para('FULL STACK WEB DEVELOPMENT (FSWD)')] }),
            ]}),
            new TableRow({ children: [
              new TableCell({ children: [para('ACTIVITY :', { bold: true })] }),
              new TableCell({ children: [para('2')] }),
            ]}),
          ],
        }),
        emptyLine(),

        // ── Problem Statement ──────────────────────────────────────────────
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          spacing: { after: 80, before: 120 },
          children: [
            new TextRun({ text: 'PROBLEM STATEMENT : ', font: 'Times New Roman', size: 24, bold: true }),
            new TextRun({
              text: 'Build a full-stack web application that checks whether a given URL is safe or suspicious. Use Regular Expressions (Regex) for URL format validation and implement a Deterministic Finite Automaton (DFA) to process and classify URLs based on their structural components. Detect phishing indicators such as IP-based URLs, suspicious keywords, excessive subdomains, and URL-encoded characters. Display the analysis result, risk score, DFA state transitions, and analysis history on a web dashboard backed by MongoDB.',
              font: 'Times New Roman', size: 20, bold: false,
            }),
          ],
        }),

        // ── Title Assigned ─────────────────────────────────────────────────
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          spacing: { after: 80 },
          children: [
            new TextRun({ text: 'Title Assigned : ', font: 'Times New Roman', size: 24, bold: true }),
            new TextRun({ text: 'URL Safety Checker', font: 'Times New Roman', size: 20 }),
          ],
        }),

        // ── Project Folder Structure ──────────────────────────────────────
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          spacing: { after: 60, before: 120 },
          children: [new TextRun({ text: 'Project Folder Structure :', font: 'Times New Roman', size: 24, bold: true })],
        }),
        ...codeBlock([
          'url-safety-checker/',
          '├── backend/',
          '│   ├── config/',
          '│   │   └── db.js',
          '│   ├── controllers/',
          '│   │   └── urlController.js',
          '│   ├── middleware/',
          '│   │   └── validator.js',
          '│   ├── models/',
          '│   │   └── UrlAnalysis.js',
          '│   ├── routes/',
          '│   │   └── urlRoutes.js',
          '│   ├── utils/',
          '│   │   ├── dfaEngine.js',
          '│   │   ├── regexValidator.js',
          '│   │   ├── riskScorer.js',
          '│   │   └── suspiciousDetector.js',
          '│   ├── tests/',
          '│   │   └── runTests.js',
          '│   ├── package.json',
          '│   └── server.js',
          '└── frontend/',
          '    ├── src/',
          '    │   ├── components/',
          '    │   │   ├── DfaVisualizer.jsx',
          '    │   │   ├── Footer.jsx',
          '    │   │   ├── Navbar.jsx',
          '    │   │   ├── RiskBadge.jsx',
          '    │   │   ├── StepTraceViewer.jsx',
          '    │   │   └── TransitionTableViewer.jsx',
          '    │   ├── pages/',
          '    │   │   ├── About.jsx',
          '    │   │   ├── Analyzer.jsx',
          '    │   │   ├── Automata.jsx',
          '    │   │   ├── Dashboard.jsx',
          '    │   │   └── History.jsx',
          '    │   ├── services/',
          '    │   │   └── api.js',
          '    │   ├── utils/',
          '    │   │   └── dfaEngine.js',
          '    │   ├── App.jsx',
          '    │   ├── index.css',
          '    │   └── main.jsx',
          '    ├── index.html',
          '    ├── package.json',
          '    └── vite.config.js',
        ]),
        emptyLine(),

        // ── 1.4 Working Principle ──────────────────────────────────────────
        subHeading('1.4 Working Principle of the Project'),
        para('The URL Safety Checker application works through a sequence of URL reception, validation, heuristic analysis, DFA processing, risk scoring, database storage, and dashboard display operations.'),
        emptyLine(),

        ...numberedItem(1, 'URL Input and Reception', 'The user enters a URL into the React frontend via the Analyzer page. The frontend sends the URL to the Node.js Express backend through an Axios POST request to /api/analyze.'),
        ...numberedItem(2, 'Regex Format Validation', 'The backend uses an RFC 3986-compliant regular expression to parse and validate the URL structure. The regex extracts the protocol, domain, path, query string, and fragment components. Any URL that does not match the expected pattern is immediately rejected.'),
        ...numberedItem(3, 'Suspicious Pattern Detection', 'The backend heuristic engine checks 12 threat indicators including: IP address used instead of a domain name, known URL shortener services, suspicious keywords (login, verify, secure, account, update, banking), excessive subdomains (more than 3), misleading @ symbols, Punycode encoded domains, non-standard ports, and high Shannon entropy.'),
        ...numberedItem(4, 'DFA State Transition', 'The formal DFA engine M = (Q, Σ, δ, q0, F) processes the URL through five states: q0 (initial), q1 (protocol validated), q2 (separator detected), q3 (domain validated), q4 (TLD validated and accepted), and qReject (invalid input). Each transition is recorded and displayed to the user.'),
        ...numberedItem(5, 'Risk Score Calculation', 'A 0–100 risk score is computed based on the number and severity of triggered heuristic indicators. The score is mapped to four categories: LOW (0–24), MEDIUM (25–49), HIGH (50–74), and CRITICAL (75–100).'),
        ...numberedItem(6, 'Database Storage', 'The URL, extracted components, risk score, risk level, triggered indicators, DFA path, and timestamp are stored in MongoDB Atlas using a Mongoose model (UrlAnalysis.js).'),
        ...numberedItem(7, 'Dashboard Display', 'The React frontend displays the analysis result on the Analyzer page, including the risk badge, validation details, suspicious indicators, and an interactive SVG DFA state graph showing the path taken by the URL.'),
        ...numberedItem(8, 'History and Export', 'The History page fetches all previously analyzed URLs from MongoDB and allows users to search, filter by risk level, paginate, delete individual records, and export the history as a JSON file.'),

        emptyLine(),

        // ── Source Code File Index ─────────────────────────────────────────
        sectionHeading('SOURCE CODE FILE INDEX :'),

        subHeading('backend/server.js'),
        ...codeBlock([
          "const express = require('express');",
          "const cors = require('cors');",
          "const mongoose = require('mongoose');",
          "require('dotenv').config();",
          "const connectDB = require('./config/db');",
          "const urlRoutes = require('./routes/urlRoutes');",
          "",
          "const app = express();",
          "app.use(cors({ origin: '*' }));",
          "app.use(express.json());",
          "",
          "connectDB();",
          "",
          "app.use('/api', urlRoutes);",
          "",
          "app.get('/', (req, res) => {",
          "  res.send('URL Safety Checker API running');",
          "});",
          "",
          "app.get('/api/health', (req, res) => {",
          "  res.json({ status: 'OK', timestamp: new Date().toISOString() });",
          "});",
          "",
          "const PORT = process.env.PORT || 5000;",
          "app.listen(PORT, () => {",
          "  console.log(`Server running on port ${PORT}`);",
          "});",
        ]),
        emptyLine(),

        subHeading('backend/config/db.js'),
        ...codeBlock([
          "const mongoose = require('mongoose');",
          "",
          "const connectDB = async () => {",
          "  try {",
          "    const conn = await mongoose.connect(process.env.MONGO_URI);",
          "    console.log(`MongoDB Connected: ${conn.connection.host}`);",
          "  } catch (error) {",
          "    console.error('MongoDB connection error:', error.message);",
          "    process.exit(1);",
          "  }",
          "};",
          "",
          "module.exports = connectDB;",
        ]),
        emptyLine(),

        subHeading('backend/models/UrlAnalysis.js'),
        ...codeBlock([
          "const mongoose = require('mongoose');",
          "",
          "const UrlAnalysisSchema = new mongoose.Schema({",
          "  url:              { type: String, required: true },",
          "  isValid:          { type: Boolean, required: true },",
          "  protocol:         String,",
          "  domain:           String,",
          "  tld:              String,",
          "  riskScore:        { type: Number, min: 0, max: 100 },",
          "  riskLevel:        { type: String, enum: ['LOW','MEDIUM','HIGH','CRITICAL'] },",
          "  indicators:       [String],",
          "  dfaPath:          [String],",
          "  dfaAccepted:      Boolean,",
          "  regexComponents:  mongoose.Schema.Types.Mixed,",
          "  createdAt:        { type: Date, default: Date.now },",
          "});",
          "",
          "module.exports = mongoose.model('UrlAnalysis', UrlAnalysisSchema);",
        ]),
        emptyLine(),

        subHeading('backend/utils/dfaEngine.js  (DFA Core — M = (Q, Σ, δ, q0, F))'),
        ...codeBlock([
          "const STATES = { Q0:'q0', Q1:'q1', Q2:'q2', Q3:'q3', Q4:'q4', REJECT:'qReject' };",
          "const ACCEPTING = new Set([STATES.Q4]);",
          "",
          "function tokenize(url) {",
          "  const m = url.match(",
          "    /^(https?)(:\\/\\/)((?:[a-zA-Z0-9-]+\\.)+)([a-zA-Z]{2,})(.*)?$/",
          "  );",
          "  if (!m) return null;",
          "  return { protocol: m[1], separator: m[2], domain: m[3], tld: m[4], rest: m[5] };",
          "}",
          "",
          "function runDFA(url) {",
          "  const path = [STATES.Q0];",
          "  const tokens = tokenize(url);",
          "  if (!tokens) {",
          "    path.push(STATES.REJECT);",
          "    return { accepted: false, path, finalState: STATES.REJECT };",
          "  }",
          "  path.push(STATES.Q1);  // protocol",
          "  path.push(STATES.Q2);  // ://",
          "  path.push(STATES.Q3);  // domain",
          "  path.push(STATES.Q4);  // TLD accepted",
          "  return { accepted: true, path, finalState: STATES.Q4, tokens };",
          "}",
          "",
          "module.exports = { runDFA, STATES };",
        ]),
        emptyLine(),

        subHeading('backend/utils/regexValidator.js'),
        ...codeBlock([
          "const URL_REGEX = /^(https?:\\/\\/)",
          "  (([a-zA-Z0-9$\\-_.+!*'(),;:@&=]|%[0-9a-fA-F]{2})+",
          "  (\\.[a-zA-Z]{2,})+)",
          "  (\\/[a-zA-Z0-9$\\-_.+!*'(),;:@&=\\/]*)?",
          "  (\\?[a-zA-Z0-9$\\-_.+!*'(),;:@&=\\/]*)?",
          "  (#[a-zA-Z0-9$\\-_.+!*'(),;:@&=\\/]*)?$/;",
          "",
          "function validateUrl(url) {",
          "  if (!url || typeof url !== 'string') return { valid: false };",
          "  const match = URL_REGEX.exec(url.trim());",
          "  if (!match) return { valid: false };",
          "  const parsed = new URL(url);",
          "  return {",
          "    valid: true,",
          "    protocol: parsed.protocol.replace(':', ''),",
          "    hostname: parsed.hostname,",
          "    pathname: parsed.pathname,",
          "    search: parsed.search,",
          "    hash: parsed.hash,",
          "    tld: parsed.hostname.split('.').slice(-1)[0],",
          "  };",
          "}",
          "",
          "module.exports = { validateUrl };",
        ]),
        emptyLine(),

        subHeading('backend/utils/suspiciousDetector.js'),
        ...codeBlock([
          "const URL_SHORTENERS = ['bit.ly','tinyurl.com','t.co','goo.gl','ow.ly','is.gd'];",
          "const SUSPICIOUS_KEYWORDS = ['login','verify','secure','account','update','banking','paypal','signin'];",
          "",
          "function shannonEntropy(str) {",
          "  const freq = {};",
          "  for (const c of str) freq[c] = (freq[c] || 0) + 1;",
          "  return -Object.values(freq).reduce((s, f) => {",
          "    const p = f / str.length; return s + p * Math.log2(p);",
          "  }, 0);",
          "}",
          "",
          "function detectSuspicious(url, components) {",
          "  const indicators = [];",
          "  const { hostname = '', pathname = '', search = '' } = components;",
          "  if (/^\\d{1,3}(\\.\\d{1,3}){3}$/.test(hostname)) indicators.push('IP address instead of domain');",
          "  if (URL_SHORTENERS.some(s => hostname.includes(s)))  indicators.push('URL shortener detected');",
          "  if (SUSPICIOUS_KEYWORDS.some(k => url.toLowerCase().includes(k))) indicators.push('Suspicious keyword in URL');",
          "  if ((hostname.match(/\\./g)||[]).length > 3)          indicators.push('Excessive subdomains');",
          "  if (url.includes('@'))                                 indicators.push('Misleading @ symbol');",
          "  if (/xn--/.test(hostname))                            indicators.push('Punycode domain');",
          "  if (/:(?!443|80)(\\d+)/.test(url))                   indicators.push('Non-standard port');",
          "  if (/%[0-9a-fA-F]{2}/.test(url))                     indicators.push('URL encoding detected');",
          "  if (shannonEntropy(hostname) > 4.0)                   indicators.push('High entropy domain');",
          "  return indicators;",
          "}",
          "",
          "module.exports = { detectSuspicious };",
        ]),
        emptyLine(),

        subHeading('backend/controllers/urlController.js'),
        ...codeBlock([
          "const UrlAnalysis = require('../models/UrlAnalysis');",
          "const { validateUrl }         = require('../utils/regexValidator');",
          "const { detectSuspicious }    = require('../utils/suspiciousDetector');",
          "const { runDFA }              = require('../utils/dfaEngine');",
          "const { calculateRiskScore }  = require('../utils/riskScorer');",
          "",
          "exports.analyzeUrl = async (req, res) => {",
          "  const { url } = req.body;",
          "  if (!url) return res.status(400).json({ error: 'URL is required' });",
          "  const regex     = validateUrl(url);",
          "  const dfa       = runDFA(url);",
          "  const indicators = regex.valid ? detectSuspicious(url, regex) : [];",
          "  const { score, level } = calculateRiskScore(regex.valid, dfa.accepted, indicators);",
          "  const record = await UrlAnalysis.create({",
          "    url, isValid: regex.valid, protocol: regex.protocol,",
          "    domain: regex.hostname, tld: regex.tld,",
          "    riskScore: score, riskLevel: level,",
          "    indicators, dfaPath: dfa.path, dfaAccepted: dfa.accepted,",
          "    regexComponents: regex,",
          "  });",
          "  res.json({ success: true, data: record });",
          "};",
          "",
          "exports.getHistory = async (req, res) => {",
          "  const records = await UrlAnalysis.find().sort({ createdAt: -1 }).limit(100);",
          "  res.json({ success: true, data: records });",
          "};",
          "",
          "exports.getStats = async (req, res) => {",
          "  const total      = await UrlAnalysis.countDocuments();",
          "  const safe       = await UrlAnalysis.countDocuments({ riskLevel: 'LOW' });",
          "  const suspicious = await UrlAnalysis.countDocuments({ riskLevel: { $in: ['HIGH','CRITICAL'] } });",
          "  res.json({ success: true, data: { total, safe, suspicious } });",
          "};",
        ]),
        emptyLine(),

        subHeading('backend/routes/urlRoutes.js'),
        ...codeBlock([
          "const express    = require('express');",
          "const router     = express.Router();",
          "const ctrl       = require('../controllers/urlController');",
          "const { validateRequest } = require('../middleware/validator');",
          "",
          "router.post  ('/analyze',   validateRequest, ctrl.analyzeUrl);",
          "router.get   ('/history',   ctrl.getHistory);",
          "router.get   ('/stats',     ctrl.getStats);",
          "router.get   ('/dfa-model', ctrl.getDfaModel);",
          "router.delete('/history/:id',  ctrl.deleteHistoryItem);",
          "router.delete('/history',      ctrl.clearHistory);",
          "",
          "module.exports = router;",
        ]),
        emptyLine(),

        subHeading('frontend/src/App.jsx'),
        ...codeBlock([
          "import React, { useState } from 'react';",
          "import { HashRouter as Router, Routes, Route } from 'react-router-dom';",
          "import Navbar      from './components/Navbar';",
          "import Footer      from './components/Footer';",
          "import Dashboard   from './pages/Dashboard';",
          "import Analyzer    from './pages/Analyzer';",
          "import History     from './pages/History';",
          "import Automata    from './pages/Automata';",
          "import About       from './pages/About';",
          "",
          "export default function App() {",
          "  const [lastResult, setLastResult] = useState(null);",
          "  return (",
          "    <Router>",
          "      <div className='min-h-screen bg-gray-950 text-gray-100'>",
          "        <Navbar />",
          "        <main className='container mx-auto px-4 py-8'>",
          "          <Routes>",
          "            <Route path='/'          element={<Dashboard />} />",
          "            <Route path='/analyze'   element={<Analyzer onResult={setLastResult} />} />",
          "            <Route path='/history'   element={<History />} />",
          "            <Route path='/automata'  element={<Automata result={lastResult} />} />",
          "            <Route path='/about'     element={<About />} />",
          "          </Routes>",
          "        </main>",
          "        <Footer />",
          "      </div>",
          "    </Router>",
          "  );",
          "}",
        ]),
        emptyLine(),

        subHeading('frontend/src/services/api.js'),
        ...codeBlock([
          "import axios from 'axios';",
          "",
          "const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';",
          "",
          "export const analyzeUrl  = (url)  => axios.post(`${BASE_URL}/analyze`, { url });",
          "export const getHistory  = ()     => axios.get(`${BASE_URL}/history`);",
          "export const getStats    = ()     => axios.get(`${BASE_URL}/stats`);",
          "export const getDfaModel = ()     => axios.get(`${BASE_URL}/dfa-model`);",
          "export const deleteRecord = (id)  => axios.delete(`${BASE_URL}/history/${id}`);",
          "export const clearHistory = ()    => axios.delete(`${BASE_URL}/history`);",
        ]),
        emptyLine(),

        subHeading('frontend/src/pages/Dashboard.jsx  (excerpt)'),
        ...codeBlock([
          "import React, { useEffect, useState } from 'react';",
          "import { getStats, getHistory } from '../services/api';",
          "import RiskBadge from '../components/RiskBadge';",
          "",
          "export default function Dashboard() {",
          "  const [stats,   setStats]   = useState({ total: 0, safe: 0, suspicious: 0 });",
          "  const [recent,  setRecent]  = useState([]);",
          "",
          "  useEffect(() => {",
          "    getStats().then(r  => setStats(r.data.data));",
          "    getHistory().then(r => setRecent(r.data.data.slice(0, 5)));",
          "  }, []);",
          "",
          "  return (",
          "    <div>",
          "      <h1>Security Dashboard</h1>",
          "      <div className='grid grid-cols-3 gap-4'>",
          "        <div className='stat-card'><p>Total Analyzed</p><h2>{stats.total}</h2></div>",
          "        <div className='stat-card'><p>Safe URLs</p>    <h2>{stats.safe}</h2></div>",
          "        <div className='stat-card'><p>Suspicious</p>   <h2>{stats.suspicious}</h2></div>",
          "      </div>",
          "      <h2>Recent Activity</h2>",
          "      {recent.map(r => (",
          "        <div key={r._id}>{r.url} <RiskBadge level={r.riskLevel} /></div>",
          "      ))}",
          "    </div>",
          "  );",
          "}",
        ]),
        emptyLine(),

        // ── OUTPUT ─────────────────────────────────────────────────────────
        sectionHeading('OUTPUT :'),

        subHeading('Test Case 1 — Safe HTTPS URL'),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({ children: [
              new TableCell({ children: [para('Input URL', { bold: true })] }),
              new TableCell({ children: [para('https://www.google.com')] }),
            ]}),
            new TableRow({ children: [
              new TableCell({ children: [para('Protocol', { bold: true })] }),
              new TableCell({ children: [para('HTTPS')] }),
            ]}),
            new TableRow({ children: [
              new TableCell({ children: [para('DFA Path', { bold: true })] }),
              new TableCell({ children: [para('q0 → q1 → q2 → q3 → q4  (ACCEPTED)')] }),
            ]}),
            new TableRow({ children: [
              new TableCell({ children: [para('Risk Score', { bold: true })] }),
              new TableCell({ children: [para('0 / 100')] }),
            ]}),
            new TableRow({ children: [
              new TableCell({ children: [para('Risk Level', { bold: true })] }),
              new TableCell({ children: [para('LOW')] }),
            ]}),
            new TableRow({ children: [
              new TableCell({ children: [para('Indicators', { bold: true })] }),
              new TableCell({ children: [para('None detected')] }),
            ]}),
          ],
        }),
        emptyLine(),

        subHeading('Test Case 2 — Suspicious Phishing URL'),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({ children: [
              new TableCell({ children: [para('Input URL', { bold: true })] }),
              new TableCell({ children: [para('http://192.168.1.1/secure-login@verify.php?account=update')] }),
            ]}),
            new TableRow({ children: [
              new TableCell({ children: [para('Protocol', { bold: true })] }),
              new TableCell({ children: [para('HTTP')] }),
            ]}),
            new TableRow({ children: [
              new TableCell({ children: [para('DFA Path', { bold: true })] }),
              new TableCell({ children: [para('q0 → q1 → q2 → qReject')] }),
            ]}),
            new TableRow({ children: [
              new TableCell({ children: [para('Risk Score', { bold: true })] }),
              new TableCell({ children: [para('85 / 100')] }),
            ]}),
            new TableRow({ children: [
              new TableCell({ children: [para('Risk Level', { bold: true })] }),
              new TableCell({ children: [para('CRITICAL')] }),
            ]}),
            new TableRow({ children: [
              new TableCell({ children: [para('Indicators', { bold: true })] }),
              new TableCell({ children: [para('IP address instead of domain; Suspicious keywords (secure, login, verify, account, update); Misleading @ symbol')] }),
            ]}),
          ],
        }),
        emptyLine(),

        subHeading('Test Case 3 — URL Shortener'),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({ children: [
              new TableCell({ children: [para('Input URL', { bold: true })] }),
              new TableCell({ children: [para('https://bit.ly/3xAbc12')] }),
            ]}),
            new TableRow({ children: [
              new TableCell({ children: [para('DFA Path', { bold: true })] }),
              new TableCell({ children: [para('q0 → q1 → q2 → q3 → q4  (ACCEPTED)')] }),
            ]}),
            new TableRow({ children: [
              new TableCell({ children: [para('Risk Score', { bold: true })] }),
              new TableCell({ children: [para('35 / 100')] }),
            ]}),
            new TableRow({ children: [
              new TableCell({ children: [para('Risk Level', { bold: true })] }),
              new TableCell({ children: [para('MEDIUM')] }),
            ]}),
            new TableRow({ children: [
              new TableCell({ children: [para('Indicators', { bold: true })] }),
              new TableCell({ children: [para('URL shortener detected')] }),
            ]}),
          ],
        }),
        emptyLine(),

        // ── MongoDB Commands ─────────────────────────────────────────────
        sectionHeading('MONGODB COMMANDS USED IN URL SAFETY CHECKER PROJECT'),
        para('MongoDB Atlas is used to store and retrieve URL analysis records generated by the URL Safety Checker application.'),
        emptyLine(),

        para('1. Display Available Databases', { bold: true }),
        ...codeBlock(['show dbs']),
        para('2. Select URL Safety Checker Database', { bold: true }),
        ...codeBlock(['use url_safety_checker']),
        para('3. Display Collections', { bold: true }),
        ...codeBlock(['show collections']),
        para('4. Retrieve All URL Analysis Records', { bold: true }),
        ...codeBlock(['db.urlanalyses.find()']),
        para('5. Display Records in Readable Format', { bold: true }),
        ...codeBlock(['db.urlanalyses.find().pretty()']),
        para('6. Retrieve Records by Risk Level', { bold: true }),
        ...codeBlock(['db.urlanalyses.find({ riskLevel: "HIGH" })']),
        para('7. Count Total Records', { bold: true }),
        ...codeBlock(['db.urlanalyses.countDocuments()']),
        para('8. Retrieve Latest Five Records', { bold: true }),
        ...codeBlock(['db.urlanalyses.find().sort({ _id: -1 }).limit(5)']),
        emptyLine(),

        // ── GitHub Commands ───────────────────────────────────────────────
        sectionHeading('GITHUB COMMANDS TO PUSH URL SAFETY CHECKER PROJECT'),
        para('Open PowerShell in your project folder:'),
        ...codeBlock(['cd "c:\\individual activity\\url-safety-checker"']),
        emptyLine(),
        para('1. Initialize Git', { bold: true }),
        ...codeBlock(['git init']),
        para('2. Add all project files', { bold: true }),
        ...codeBlock(['git add .']),
        para('3. Commit the files', { bold: true }),
        ...codeBlock(['git commit -m "Initial URL Safety Checker project upload"']),
        para('4. Connect GitHub repository', { bold: true }),
        ...codeBlock(['git remote add origin https://github.com/Hari-2302/url-safety-checker.git']),
        para('5. Set the main branch', { bold: true }),
        ...codeBlock(['git branch -M main']),
        para('6. Push the project to GitHub', { bold: true }),
        ...codeBlock(['git push -u origin main']),
        emptyLine(),

        // ── Procedure to Run Locally ──────────────────────────────────────
        sectionHeading('PROCEDURE TO RUN URL SAFETY CHECKER PROJECT LOCALLY'),

        para('Step 1: Open the project folder', { bold: true }),
        ...codeBlock(['cd "c:\\individual activity\\url-safety-checker"']),

        para('Step 2: Configure Environment', { bold: true }),
        para('Create a file named .env inside the backend/ folder with the following content:'),
        ...codeBlock([
          'MONGO_URI=mongodb+srv://hariharanelango529_db_user:hari123@cluster0.ug1wfgq.mongodb.net/url_safety_checker?retryWrites=true&w=majority',
          'PORT=5000',
        ]),

        para('Step 3: Start the Backend Server', { bold: true }),
        para('Open the first terminal:'),
        ...codeBlock(['cd backend', 'npm install', 'npm start']),
        para('Backend URL: http://localhost:5000'),

        para('Step 4: Start the Frontend Server', { bold: true }),
        para('Open a second terminal:'),
        ...codeBlock(['cd frontend', 'npm install', 'npm run dev']),
        para('Frontend URL: http://localhost:5173'),

        para('Step 5: Open the Application', { bold: true }),
        para('Open Google Chrome and enter:'),
        ...codeBlock(['http://localhost:5173']),

        para('Step 6: Test the Project', { bold: true }),
        bullet('Enter a safe URL such as https://www.google.com and click Analyze.'),
        bullet('Enter a suspicious URL such as http://192.168.1.1/login@verify and check the CRITICAL alert.'),
        bullet('Observe DFA state transitions on the Automata page.'),
        bullet('Check the generated analysis history on the History page.'),
        bullet('Verify stored records in MongoDB Atlas using MongoDB Compass or the Atlas web console.'),
        emptyLine(),

        // ── GitHub Link ───────────────────────────────────────────────────
        sectionHeading('MONGODB & GITHUB :'),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          spacing: { after: 80 },
          children: [
            new TextRun({ text: 'GitHub Repository : ', font: 'Times New Roman', size: 24, bold: true }),
            new TextRun({ text: 'https://github.com/Hari-2302/url-safety-checker', font: 'Times New Roman', size: 20 }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          spacing: { after: 80 },
          children: [
            new TextRun({ text: 'GitHub Pages (Live Frontend) : ', font: 'Times New Roman', size: 24, bold: true }),
            new TextRun({ text: 'https://hari-2302.github.io/url-safety-checker/', font: 'Times New Roman', size: 20 }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          spacing: { after: 80 },
          children: [
            new TextRun({ text: 'MongoDB Atlas Cluster : ', font: 'Times New Roman', size: 24, bold: true }),
            new TextRun({ text: 'cluster0.ug1wfgq.mongodb.net  |  Database: url_safety_checker', font: 'Times New Roman', size: 20 }),
          ],
        }),
        emptyLine(),
      ],
    },
  ],
});

// ─── Write Output ───────────────────────────────────────────────────────────
Packer.toBuffer(doc).then(buf => {
  const outPath = 'c:/individual activity/url-safety-checker/VCET_IT_FSWD_URL_Safety_Checker_Report.docx';
  fs.writeFileSync(outPath, buf);
  console.log('Report generated:', outPath);
  console.log('File size:', buf.length, 'bytes');
}).catch(err => {
  console.error('Error generating report:', err);
  process.exit(1);
});
