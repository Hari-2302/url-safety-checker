const mongoose = require('mongoose');

const UrlAnalysisSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  riskScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  riskLevel: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    required: true,
    index: true
  },
  statusLabel: {
    type: String,
    required: true
  },
  dfaAccepted: {
    type: Boolean,
    required: true
  },
  dfaStateSequence: {
    type: [String],
    default: []
  },
  dfaFinalState: {
    type: String,
    default: 'qReject'
  },
  regexValid: {
    type: Boolean,
    required: true
  },
  protocol: {
    type: String,
    default: ''
  },
  domain: {
    type: String,
    default: ''
  },
  subdomain: {
    type: String,
    default: ''
  },
  tld: {
    type: String,
    default: ''
  },
  isIp: {
    type: Boolean,
    default: false
  },
  indicatorsCount: {
    type: Number,
    default: 0
  },
  indicators: [{
    id: String,
    name: String,
    severity: String,
    description: String,
    detectedValue: String
  }],
  reasons: [String],
  recommendation: String,
  stepTrace: [mongoose.Schema.Types.Mixed],
  componentTransitions: [mongoose.Schema.Types.Mixed],
  clientIp: {
    type: String,
    default: '127.0.0.1'
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('UrlAnalysis', UrlAnalysisSchema);
