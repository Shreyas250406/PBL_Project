// Vercel Serverless Function entry point
// On Vercel, env vars are injected automatically via the dashboard.
// Only attempt to load .env for local development fallback.
const path = require('path');
const fs = require('fs');

const envPath = path.join(__dirname, '..', 'backend', '.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
}

const app = require('../backend/server');

module.exports = app;