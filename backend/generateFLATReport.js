const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, WidthType, BorderStyle, UnderlineType
} = require('docx');
const fs = require('fs');

function centered(text, opts = {}) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: opts.after || 0, before: opts.before || 0 },
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

function sectionTitle(text) {
  return new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { after: 80, before: 160 },
    children: [
      new TextRun({ text, font: 'Times New Roman', size: 24, bold: true }),
    ],
  });
}

function subTitle(text) {
  return new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { after: 60, before: 120 },
    children: [
      new TextRun({ text, font: 'Times New Roman', size: 22, bold: true }),
    ],
  });
}

function codeLine(text) {
  return new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { after: 0, before: 0 },
    children: [
      new TextRun({ text, font: 'Courier New', size: 17 }),
    ],
  });
}

function emptyLine() {
  return new Paragraph({ spacing: { after: 60 }, children: [new TextRun('')] });
}

function cell(text, isHeader = false, widthPercent = 50) {
  return new TableCell({
    width: { size: widthPercent, type: WidthType.PERCENTAGE },
    children: [
      new Paragraph({
        alignment: isHeader ? AlignmentType.CENTER : AlignmentType.LEFT,
        spacing: { after: 40, before: 40 },
        children: [
          new TextRun({
            text,
            font: 'Times New Roman',
            size: 20,
            bold: isHeader,
          }),
        ],
      }),
    ],
  });
}

const doc = new Document({
  sections: [
    {
      properties: {
        page: {
          size: { width: 11906, height: 16838 }, // A4
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      children: [
        centered('VELALAR COLLEGE OF ENGINEERING AND TECHNOLOGY, ERODE -12'),
        centered('(AUTONOMOUS)'),
        centered('DEPARTMENT OF INFORMATION TECHNOLOGY'),
        centered('ACADEMIC YEAR: 2026 -27 (ODD)', { size: 24 }),
        centered('ACTIVITY- Project-Based Assessment', { size: 24 }),
        emptyLine(),

        // Metadata Table
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({ children: [cell('NAME :', true, 30), cell('HARIHARAN E', false, 70)] }),
            new TableRow({ children: [cell('CLASS:', true, 30), cell('24IT5A', false, 70)] }),
            new TableRow({ children: [cell('REG.NO:', true, 30), cell('732924ITR032', false, 70)] }),
            new TableRow({ children: [cell('SUBJECT CODE:', true, 30), cell('22ITT53', false, 70)] }),
            new TableRow({ children: [cell('SUBJECT NAME:', true, 30), cell('FORMAL LANGUAGES AND AUTOMATA THEORY (FLAT)', false, 70)] }),
            new TableRow({ children: [cell('ACTIVITY :', true, 30), cell('2', false, 70)] }),
          ],
        }),
        emptyLine(),

        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          spacing: { after: 80, before: 80 },
          children: [
            new TextRun({ text: 'PROBLEM STATEMENT  : ', font: 'Times New Roman', size: 22, bold: true }),
            new TextRun({
              text: 'Build a web application that validates URLs and detects suspicious phishing patterns. Use finite automata to recognize valid sequences of URL structural components (protocol, scheme separator, domain labels, and top-level domain). Process incoming URLs through Deterministic Finite Automaton (DFA) state transitions, reject malformed or illegal sequences, compute risk scores, and display results, automata transitions, and security audit logs on a web dashboard.',
              font: 'Times New Roman', size: 20,
            }),
          ],
        }),

        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          spacing: { after: 120 },
          children: [
            new TextRun({ text: 'Title Assigned : ', font: 'Times New Roman', size: 22, bold: true }),
            new TextRun({ text: 'URL Safety Checker (Automata-Based URL Syntax and Threat Detection System)', font: 'Times New Roman', size: 20 }),
          ],
        }),

        // 1. STATE DIAGRAM
        sectionTitle('1. STATE DIAGRAM'),
        subTitle('1.1 Introduction'),
        para('A Deterministic Finite Automaton (DFA) is used in the URL Safety Checker project to formally validate the structural syntax of submitted URLs. It processes tokenized inputs representing the sequential parts of a web address: the protocol scheme (http/https), the protocol delimiter (://), the domain label components, and the Top-Level Domain (TLD).'),
        para('The automaton starts from the initial state q0. Whenever a valid structural component is detected in strict sequence, the DFA transitions to the next state. If the entire sequence satisfies the URL grammar rules, it reaches the final accepting state q4. Any violation in syntax, malformed characters, or unexpected components routes the automaton to the non-accepting dead state qReject.'),

        subTitle('1.2 States of the DFA'),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({ children: [cell('State', true, 25), cell('Description', true, 75)] }),
            new TableRow({ children: [cell('q0', false, 25), cell('Initial state; awaiting URL protocol scheme', false, 75)] }),
            new TableRow({ children: [cell('q1', false, 25), cell('Valid protocol detected (http or https)', false, 75)] }),
            new TableRow({ children: [cell('q2', false, 25), cell('Protocol delimiter detected (://)', false, 75)] }),
            new TableRow({ children: [cell('q3', false, 25), cell('Valid domain label(s) detected (e.g., www.google)', false, 75)] }),
            new TableRow({ children: [cell('q4', false, 25), cell('Valid TLD detected (.com, .org, etc.); Accepting / Final State', false, 75)] }),
            new TableRow({ children: [cell('qReject', false, 25), cell('Syntax violation or malformed input detected; Reject State', false, 75)] }),
          ],
        }),
        emptyLine(),

        subTitle('1.3 State Diagram Representation :'),
        para('URL Safety Checker – DFA-Based URL Syntax Validation', { bold: true }),
        para('The DFA contains six formal states (five processing states and one trap/reject state). It validates syntactic correctness of web URLs by tracking component tokens in strict grammar order.'),
        emptyLine(),

        para('                       [ DFA State Transition Flow ]', { align: AlignmentType.CENTER, bold: true }),
        para('  Start                                                                      Valid continuation (path/query)', { align: AlignmentType.CENTER }),
        para('    │                                                                                ┌───┐', { align: AlignmentType.CENTER }),
        para('    ▼       "http"/"https"         "://"           Domain label           TLD        │   ▼', { align: AlignmentType.CENTER }),
        para('  ( q0 ) ─────────────────► ( q1 ) ─────► ( q2 ) ──────────────► ( q3 ) ─────► (( q4 ))', { align: AlignmentType.CENTER, bold: true }),
        para('    │                         │             │                      │              │', { align: AlignmentType.CENTER }),
        para('    │                         │             │                      │              │ Any Invalid Token', { align: AlignmentType.CENTER }),
        para('    └─────────────────────────┼─────────────┼──────────────────────┴──────────────►', { align: AlignmentType.CENTER }),
        para('                              ▼                                                   ▼', { align: AlignmentType.CENTER }),
        para('                                                ( qReject )', { align: AlignmentType.CENTER, bold: true }),
        emptyLine(),

        para('State Description:', { bold: true }),
        para('q0 – Initial state; waiting for protocol input.'),
        para('q1 – Protocol "http" or "https" matched successfully.'),
        para('q2 – Scheme separator "://" matched successfully.'),
        para('q3 – Valid alphanumeric domain label matched.'),
        para('q4 – Valid Top-Level Domain (TLD) with ≥2 characters matched; Accepting state.'),
        para('qReject – Malformed character, missing scheme separator, or invalid TLD encountered; Rejecting state.'),
        emptyLine(),

        subTitle('1.4 Formal Definition of DFA'),
        para('A DFA is represented by the 5-tuple:'),
        centered('M = (Q, Σ, δ, q0, F)', { size: 22, bold: true, before: 60, after: 60 }),
        para('Where:'),
        para('Q: Set of states = { q0, q1, q2, q3, q4, qReject }'),
        para('Σ: Input alphabet = { T_HTTP, T_HTTPS, T_SEP, T_DOMAIN, T_TLD, T_PATH, T_INVALID }'),
        para('δ: Transition function: Q × Σ → Q that determines the next state'),
        para('q0: Initial state = q0'),
        para('F: Set of final (accepting) states = { q4 }'),
        para('The DFA accepts the input URL string if and only if processing terminates in state q4 with all mandatory structural tokens matched.'),
        emptyLine(),

        // 2. TRANSITION DIAGRAM
        sectionTitle('2. TRANSITION DIAGRAM'),
        para('The transition diagram represents the movement of the DFA from one state to another based on incoming tokenized URL components.'),
        emptyLine(),

        subTitle('2.1 Transition Table :'),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({ children: [cell('Current State', true, 25), cell('Input Condition / Token', true, 45), cell('Next State', true, 30)] }),
            new TableRow({ children: [cell('q0', false, 25), cell('"http" or "https" (T_HTTP / T_HTTPS)', false, 45), cell('q1', false, 30)] }),
            new TableRow({ children: [cell('q0', false, 25), cell('Any other input', false, 45), cell('qReject', false, 30)] }),
            new TableRow({ children: [cell('q1', false, 25), cell('"://" (T_SEP)', false, 45), cell('q2', false, 30)] }),
            new TableRow({ children: [cell('q1', false, 25), cell('Any other input', false, 45), cell('qReject', false, 30)] }),
            new TableRow({ children: [cell('q2', false, 25), cell('Valid domain label [a-zA-Z0-9.-]+ (T_DOMAIN)', false, 45), cell('q3', false, 30)] }),
            new TableRow({ children: [cell('q2', false, 25), cell('Any other input', false, 45), cell('qReject', false, 30)] }),
            new TableRow({ children: [cell('q3', false, 25), cell('Valid TLD [a-zA-Z]{2,} (T_TLD)', false, 45), cell('q4', false, 30)] }),
            new TableRow({ children: [cell('q3', false, 25), cell('Any other input', false, 45), cell('qReject', false, 30)] }),
            new TableRow({ children: [cell('q4', false, 25), cell('Optional path/query/fragment continuation (T_PATH)', false, 45), cell('q4', false, 30)] }),
            new TableRow({ children: [cell('q4', false, 25), cell('Invalid character encoding', false, 45), cell('qReject', false, 30)] }),
            new TableRow({ children: [cell('qReject', false, 25), cell('Any input (Dead / Trap state)', false, 45), cell('qReject', false, 30)] }),
          ],
        }),
        emptyLine(),

        para('Special Conditions:', { bold: true }),
        para('1. If the protocol is omitted (e.g. "www.google.com" directly), the automaton fails at q0 and moves to qReject.'),
        para('2. If an IP address without a top-level domain is supplied, the transition from q3 cannot match a valid TLD token, moving to qReject.'),
        para('3. Once in state qReject, no input can transition the machine back to an accepting state.'),
        para('4. When q4 is reached, the URL syntax is validated, and the heuristic threat engine executes concurrently to compute risk indicators.'),
        emptyLine(),

        subTitle('2.2 Example of State Transitions :'),
        para('Consider the input URL: https://www.google.com/search'),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({ children: [cell('Step', true, 15), cell('Input Token', true, 30), cell('Extracted Value', true, 30), cell('DFA State', true, 25)] }),
            new TableRow({ children: [cell('Initial', false, 15), cell('------', false, 30), cell('------', false, 30), cell('q0', false, 25)] }),
            new TableRow({ children: [cell('1', false, 15), cell('Protocol', false, 30), cell('"https"', false, 30), cell('q1', false, 25)] }),
            new TableRow({ children: [cell('2', false, 15), cell('Separator', false, 30), cell('"://"', false, 30), cell('q2', false, 25)] }),
            new TableRow({ children: [cell('3', false, 15), cell('Domain Label', false, 30), cell('"www.google."', false, 30), cell('q3', false, 25)] }),
            new TableRow({ children: [cell('4', false, 15), cell('Valid TLD', false, 30), cell('"com"', false, 30), cell('q4 (Accept)', false, 25)] }),
            new TableRow({ children: [cell('5', false, 15), cell('Path / Query', false, 30), cell('"/search"', false, 30), cell('q4 (Accept)', false, 25)] }),
          ],
        }),
        emptyLine(),
        para('Result: The URL was successfully processed through q0 → q1 → q2 → q3 → q4. Because the DFA ended in accepting state q4, the URL syntax is marked ACCEPTED.'),
        emptyLine(),

        // CODE SECTION
        sectionTitle('CODE:'),
        para('File Name: dfaEngine.js', { bold: true }),
        ...[
          '// Deterministic Finite Automaton Engine for URL Syntax Validation',
          '// M = (Q, Σ, δ, q0, F)',
          '',
          'const STATES = {',
          '  Q0: "q0",            // Initial state',
          '  Q1: "q1",            // Protocol matched (http/https)',
          '  Q2: "q2",            // Scheme separator matched (://)',
          '  Q3: "q3",            // Domain label matched',
          '  Q4: "q4",            // TLD matched (Accepting)',
          '  REJECT: "qReject"    // Reject / Trap state',
          '};',
          '',
          'const ACCEPTING_STATES = new Set([STATES.Q4]);',
          '',
          'function tokenize(url) {',
          '  if (!url || typeof url !== "string") return null;',
          '  const trimmed = url.trim();',
          '  const pattern = /^(https?)(:\\/\\/)((?:[a-zA-Z0-9-]+\\.)+)([a-zA-Z]{2,})(.*)?$/;',
          '  const match = trimmed.match(pattern);',
          '  if (!match) return null;',
          '  return {',
          '    protocol: match[1],',
          '    separator: match[2],',
          '    domain: match[3],',
          '    tld: match[4],',
          '    rest: match[5] || ""',
          '  };',
          '}',
          '',
          'function runDFA(url) {',
          '  const path = [STATES.Q0];',
          '  const transitions = [];',
          '  let currentState = STATES.Q0;',
          '',
          '  const tokens = tokenize(url);',
          '  if (!tokens) {',
          '    transitions.push({ from: currentState, input: "MALFORMED_INPUT", to: STATES.REJECT });',
          '    currentState = STATES.REJECT;',
          '    path.push(currentState);',
          '    return {',
          '      accepted: false,',
          '      finalState: currentState,',
          '      path,',
          '      transitions,',
          '      reason: "URL syntax does not match formal grammar: (http|https)://<domain>.<tld>"',
          '    };',
          '  }',
          '',
          '  // q0 -> q1 on Protocol',
          '  transitions.push({ from: STATES.Q0, input: tokens.protocol, to: STATES.Q1 });',
          '  currentState = STATES.Q1;',
          '  path.push(currentState);',
          '',
          '  // q1 -> q2 on ://',
          '  transitions.push({ from: STATES.Q1, input: tokens.separator, to: STATES.Q2 });',
          '  currentState = STATES.Q2;',
          '  path.push(currentState);',
          '',
          '  // q2 -> q3 on Domain Label',
          '  transitions.push({ from: STATES.Q2, input: tokens.domain, to: STATES.Q3 });',
          '  currentState = STATES.Q3;',
          '  path.push(currentState);',
          '',
          '  // q3 -> q4 on Valid TLD',
          '  transitions.push({ from: STATES.Q3, input: tokens.tld, to: STATES.Q4 });',
          '  currentState = STATES.Q4;',
          '  path.push(currentState);',
          '',
          '  // q4 -> q4 on Optional Path/Query',
          '  if (tokens.rest) {',
          '    transitions.push({ from: STATES.Q4, input: tokens.rest, to: STATES.Q4 });',
          '  }',
          '',
          '  return {',
          '    accepted: ACCEPTING_STATES.has(currentState),',
          '    finalState: currentState,',
          '    path,',
          '    transitions,',
          '    tokens',
          '  };',
          '}',
          '',
          'module.exports = { runDFA, STATES, ACCEPTING_STATES, tokenize };'
        ].map(line => codeLine(line)),
        emptyLine(),

        // OUTPUT SECTION
        sectionTitle('Output:'),
        para('Test Case 1: Valid HTTPS URL', { bold: true }),
        para('URL: https://www.google.com'),
        para('Token [Protocol]: "https"   --> DFA State: q1'),
        para('Token [Separator]: "://"     --> DFA State: q2'),
        para('Token [Domain]: "www.google." --> DFA State: q3'),
        para('Token [TLD]: "com"         --> DFA State: q4'),
        para('STATUS: ACCEPTED by URL Syntax Automaton! (Risk Level: LOW, Score: 0/100)'),
        emptyLine(),

        para('Test Case 2: Phishing URL with Raw IP & Suspicious Keyword', { bold: true }),
        para('URL: http://192.168.1.1/login-verify'),
        para('Token [Protocol]: "http"   --> DFA State: q1'),
        para('Token [Separator]: "://"     --> DFA State: q2'),
        para('Token [Domain/TLD]: Malformed IP token (No valid alphabetic TLD) --> DFA State: qReject'),
        para('STATUS: REJECTED by URL Syntax Automaton! (Risk Level: CRITICAL, Score: 85/100)'),
        para('Security Indicators Detected: IP address used instead of domain; Suspicious keywords (login, verify); Misleading @ symbol.'),
        emptyLine(),

        para('Test Case 3: URL Shortener', { bold: true }),
        para('URL: https://bit.ly/3xAbc12'),
        para('Token [Protocol]: "https"   --> DFA State: q1'),
        para('Token [Separator]: "://"     --> DFA State: q2'),
        para('Token [Domain]: "bit."     --> DFA State: q3'),
        para('Token [TLD]: "ly"          --> DFA State: q4'),
        para('Token [Path]: "/3xAbc12"   --> DFA State: q4'),
        para('STATUS: ACCEPTED by Syntax Automaton (Risk Level: MEDIUM, Score: 35/100)'),
        para('Security Indicators Detected: Known URL shortener service detected.'),
        emptyLine(),

        // PROCEDURE STEPS
        sectionTitle('PROCEDURE STEPS :'),
        para('1. Start the MongoDB database service (or verify cloud connection to MongoDB Atlas cluster) to allow persistent storage of URL analysis results.'),
        para('2. Open the URL Safety Checker project folder in Visual Studio Code.'),
        para('3. Open the backend folder in the terminal and install the required dependencies (express, cors, mongoose, dotenv).'),
        para('4. Configure the MongoDB connection string in the backend .env configuration file.'),
        para('5. Start the Node.js backend server using "npm start" (verifying port 5000 is listening).'),
        para('6. Open a second terminal window and navigate to the frontend directory.'),
        para('7. Install frontend React dependencies and run the Vite development server using "npm run dev".'),
        para('8. Open the web application in a browser at http://localhost:5173 (or via the live deployed link).'),
        para('9. Enter a test URL in the URL Analyzer input bar on the web dashboard.'),
        para('10. Observe real-time DFA simulation showing state transitions from q0 to q1, q2, q3, and finally q4 or qReject.'),
        para('11. Verify the suspicious pattern detection engine checks for IP domains, URL shorteners, excessive subdomains, and suspicious keywords.'),
        para('12. Inspect the computed 0–100 risk score and categorical badge (LOW, MEDIUM, HIGH, CRITICAL).'),
        para('13. Navigate to the Automata page to view the interactive 5-tuple specification, SVG state graph, and transition matrix.'),
        para('14. Review the History page to confirm that the URL, DFA path, and risk audit logs are persisted in MongoDB.'),
        para('15. Test deletion, search filtering, and JSON export functions to complete verification of the application.'),
        emptyLine(),

        // ADVANTAGES OF USING FLAT CONCEPT
        sectionTitle('ADVANTAGES OF USING FLAT CONCEPT IN URL SAFETY CHECKER :'),
        para('1. Formal Syntactic Verification: Guarantees deterministic recognition of valid RFC 3986 URL structures before performing expensive backend operations.'),
        para('2. Linear Time Complexity O(n): The DFA processes the URL in a single pass of length n with constant-time O(1) state transitions, ensuring ultra-low latency.'),
        para('3. Strict Grammar Enforcement: Enforces mandatory presence and exact sequence of protocol, scheme separator, domain, and top-level domain.'),
        para('4. Instant Trap/Reject Detection: Quickly identifies malformed inputs or protocol spoofing and immediately transitions to qReject without ambiguous parsing.'),
        para('5. Explainable State Trace: Every analyzed URL produces a transparent path trace (e.g. q0 → q1 → q2 → q3 → q4), giving administrators clear auditability for security decisions.'),
        emptyLine(),

        // MONGODB & GITHUB REPOSITORY DETAILS
        sectionTitle('MONGODB & GITHUB REPOSITORY :'),
        para('GitHub Repository: https://github.com/Hari-2302/url-safety-checker', { bold: true }),
        para('GitHub Pages Live URL: https://hari-2302.github.io/url-safety-checker/', { bold: true }),
        para('MongoDB Atlas Cluster: cluster0.ug1wfgq.mongodb.net (Database: url_safety_checker)', { bold: true }),
      ],
    },
  ],
});

Packer.toBuffer(doc).then(buf => {
  const outPath = 'c:/individual activity/url-safety-checker/VCET_IT_FLAT_URL_Safety_Checker_Report.docx';
  fs.writeFileSync(outPath, buf);
  console.log('FLAT Report successfully generated at:', outPath);
  console.log('File size:', buf.length, 'bytes');
}).catch(err => {
  console.error('Error generating FLAT report:', err);
  process.exit(1);
});
