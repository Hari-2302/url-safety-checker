const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const { connectDB, getDbState } = require('./config/db');
const urlRoutes = require('./routes/urlRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logger for debugging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[HTTP] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Mount API routes
app.use('/api', urlRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbState = getDbState();
  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'URL Safety Checker API',
    version: '1.0.0',
    database: {
      connected: dbState.isConnected,
      mode: dbState.mode,
      uri: dbState.uri
    }
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start Server & Connect Database
async function startServer() {
  await connectDB();
  const server = app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🛡️  URL Safety Checker Backend Server Running on :${PORT}`);
    console.log(`🌐  API Endpoints: http://localhost:${PORT}/api/analyze`);
    console.log(`🩺  Health Check:  http://localhost:${PORT}/api/health`);
    console.log(`=======================================================`);
  });

  return server;
}

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = { app, startServer };
