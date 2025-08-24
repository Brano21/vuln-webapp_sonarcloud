
/**
 * Intentionally vulnerable Express app for demo purposes.
 * DO NOT USE IN PRODUCTION.
 */
const express = require('express');
const path = require('path');
const fs = require('fs');
const _ = require('lodash'); // vulnerable version on purpose
const marked = require('marked'); // old XSS-prone version on purpose

// Hard-coded secret (bad)
const HARDCODED_ADMIN_PASSWORD = "admin123";

// Load env (and leak secrets into image - on purpose)
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 9000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/static', express.static(path.join(__dirname, 'public')));

// Home
app.get('/', (req, res) => {
  const md = `# Vulnerable Demo
- Try \`/search?term=<script>alert(1)</script>\`
- Try \`/calc?expr=process.version\`
- Try \`/file?path=../../etc/hostname\`
- Admin login at \`/admin?password=...\` (hardcoded)
`;
  // marked < 0.3.x has known XSS issues; no sanitization on purpose
  res.send(marked(md));
});

// Reflected XSS (no output encoding)
app.get('/search', (req, res) => {
  const term = req.query.term || '';
  res.send(`<h1>Results for: ${term}</h1>`); // unsafe interpolation
});

// Command injection via eval
app.get('/calc', (req, res) => {
  const expr = req.query.expr || '1+1';
  try {
    // VERY BAD: directly evaluating user-controlled input
    const result = eval(expr);
    res.send(`<pre>${String(result)}</pre>`);
  } catch (e) {
    res.status(400).send(`<pre>Error: ${String(e)}</pre>`);
  }
});

// Path traversal (no path normalization/checks)
app.get('/file', (req, res) => {
  const userPath = req.query.path || 'app/server.js';
  fs.readFile(userPath, 'utf8', (err, data) => {
    if (err) return res.status(404).send('Not found');
    res.type('text/plain').send(data);
  });
});

// Hard-coded admin password check
app.get('/admin', (req, res) => {
  const pw = req.query.password || '';
  if (pw === HARDCODED_ADMIN_PASSWORD || pw === process.env.ADMIN_PASSWORD) {
    res.send('Welcome, admin!');
  } else {
    res.status(403).send('Forbidden');
  }
});

app.listen(PORT, () => {
  console.log(`Vulnerable app running on http://0.0.0.0:${PORT}`);
});
