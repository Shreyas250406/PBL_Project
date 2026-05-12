const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const itemRoutes = require('./routes/items');
const matchRoutes = require('./routes/matches');
const claimRoutes = require('./routes/claims');
const adminRoutes = require('./routes/admin');
const reverificationRoutes = require('./routes/reverifications');
const Item = require('./models/Item');

const app = express();

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Images are stored as Base64 data URIs in MongoDB — no static file serving needed

// MongoDB connection with caching for serverless
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(
      process.env.MONGODB_URI || 'mongodb+srv://ashassauti_db:pict123@cluster0.jogias5.mongodb.net/lostfound?retryWrites=true&w=majority',
      opts
    ).then((mongoose) => {
      console.log('Connected to MongoDB');
      return mongoose;
    });
  }
  
  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (err) {
    cached.promise = null;
    console.error('MongoDB connection error:', err.message);
    throw err;
  }
};

// Middleware to ensure DB is connected before handling any request
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('DB middleware error:', err.message);
    const uri = process.env.MONGODB_URI;
    console.error('MONGODB_URI set:', !!uri, uri ? `(starts with ${uri.substring(0, 20)}...)` : '(not set)');
    res.status(500).json({ success: false, message: 'Database connection failed', error: err.message });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/claims', claimRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reverifications', reverificationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auto-delete cleanup: expire claimed items past their autoDeleteAt date
const runCleanup = async () => {
  try {
    const now = new Date();
    const expired = await Item.find({
      status: 'claimed',
      autoDeleteAt: { $lte: now },
    });

    if (expired.length > 0) {
      for (const item of expired) {
        item.status = 'expired';
        await item.save();
      }
      console.log(`🧹 Auto-expired ${expired.length} unchallenged claimed item(s)`);
    }
  } catch (err) {
    console.error('Cleanup error:', err.message);
  }
};

// Run cleanup every hour
setInterval(runCleanup, 60 * 60 * 1000);
// Also run once at startup (after a short delay to let DB connect)
setTimeout(runCleanup, 10000);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// Start server only in non-production (local development)
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
  connectDB().then(() => {
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        const fallback = PORT + 1;
        console.log(`Port ${PORT} is in use, trying port ${fallback}...`);
        app.listen(fallback, () => {
          console.log(`Server running on port ${fallback}`);
        });
      } else {
        console.error('Server error:', err);
      }
    });
  });
}

module.exports = app;
