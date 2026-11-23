const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

let dbState = {
  isConnected: false,
  mode: 'DISCONNECTED',
  uri: '',
  error: null
};

// Fallback in-memory / JSON store in case local MongoDB service is offline
const fallbackStorePath = path.join(__dirname, '..', 'data', 'history_fallback.json');
let fallbackData = [];

function initFallbackStore() {
  try {
    const dir = path.dirname(fallbackStorePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (fs.existsSync(fallbackStorePath)) {
      const raw = fs.readFileSync(fallbackStorePath, 'utf8');
      fallbackData = JSON.parse(raw);
    } else {
      fallbackData = [];
      fs.writeFileSync(fallbackStorePath, JSON.stringify(fallbackData, null, 2));
    }
  } catch (err) {
    console.warn('[DB Fallback] Failed to initialize file store, using memory:', err.message);
    fallbackData = [];
  }
}

function saveFallbackStore() {
  try {
    fs.writeFileSync(fallbackStorePath, JSON.stringify(fallbackData, null, 2));
  } catch (err) {
    console.warn('[DB Fallback] Failed to save file store:', err.message);
  }
}

async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/url_safety_checker';
  dbState.uri = uri;

  try {
    console.log(`[DB] Attempting MongoDB connection to: ${uri}`);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500
    });

    dbState.isConnected = true;
    dbState.mode = 'MONGODB_CONNECTED';
    console.log('✅ [DB] Successfully connected to MongoDB server');
  } catch (error) {
    dbState.isConnected = false;
    dbState.mode = 'FALLBACK_LOCAL_STORE';
    dbState.error = error.message;
    console.warn(`⚠️ [DB] MongoDB not reachable on ${uri} (${error.message}).`);
    console.log('⚡ [DB] Activating resilient local fallback database mode (no data loss for evaluation).');
    initFallbackStore();
  }

  return dbState;
}

function getDbState() {
  return dbState;
}

// Fallback repository helper methods mirroring Mongoose operations
const fallbackRepo = {
  async create(doc) {
    const record = {
      ...doc,
      _id: 'fb_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    fallbackData.unshift(record);
    saveFallbackStore();
    return record;
  },

  async find(filter = {}) {
    let result = [...fallbackData];
    if (filter.riskLevel) {
      result = result.filter(item => item.riskLevel === filter.riskLevel);
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(item => item.url.toLowerCase().includes(q) || item.domain.toLowerCase().includes(q));
    }
    return result;
  },

  async findById(id) {
    return fallbackData.find(item => item._id === id) || null;
  },

  async findByIdAndDelete(id) {
    const idx = fallbackData.findIndex(item => item._id === id);
    if (idx !== -1) {
      const removed = fallbackData.splice(idx, 1)[0];
      saveFallbackStore();
      return removed;
    }
    return null;
  },

  async deleteMany(filter = {}) {
    const count = fallbackData.length;
    fallbackData = [];
    saveFallbackStore();
    return { deletedCount: count };
  },

  async countDocuments(filter = {}) {
    if (!filter || Object.keys(filter).length === 0) return fallbackData.length;
    return (await this.find(filter)).length;
  }
};

module.exports = {
  connectDB,
  getDbState,
  fallbackRepo
};
