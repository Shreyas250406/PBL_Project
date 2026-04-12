const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const itemRoutes = require('./routes/items');
const matchRoutes = require('./routes/matches');
const claimRoutes = require('./routes/claims');
const notificationRoutes = require('./routes/notifications');
const adminRoutes = require('./routes/admin');

const app = express();

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images (only works locally, not on Vercel serverless)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB connection with caching for serverless
let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  // Reuse existing connection if mongoose is already connected
  if (mongoose.connection.readyState === 1) {
    isConnected = true;
    return;
  }

  try {
    await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb+srv://ashassauti_db:pict123@cluster0.jogias5.mongodb.net/lostfound?retryWrites=true&w=majority'
    );
    isConnected = true;
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    isConnected = false;
    throw err;
  }
};

// Middleware to ensure DB is connected before handling any request
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database connection failed' });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/claims', claimRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

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
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  });
}

module.exports = app;
