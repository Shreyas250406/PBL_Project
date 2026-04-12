// Vercel Serverless Function entry point
// Load .env from backend directory before anything else
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'backend', '.env') });

const app = require('../backend/server');

module.exports = app;