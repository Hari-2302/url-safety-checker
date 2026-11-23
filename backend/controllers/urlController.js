const UrlAnalysis = require('../models/UrlAnalysis');
const { getDbState, fallbackRepo } = require('../config/db');
const { processDfa, getFormalDefinition } = require('../utils/dfaEngine');
const { validateUrlWithRegex } = require('../utils/regexValidator');
const { detectSuspiciousPatterns } = require('../utils/suspiciousDetector');
const { computeRiskScore } = require('../utils/riskScorer');

/**
 * Controller: Analyze URL through DFA, Regex, and Suspicious Pattern Engines
 */
exports.analyzeUrl = async (req, res) => {
  try {
    const { url } = req.body;

    if (!url || typeof url !== 'string' || url.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid URL string to analyze.'
      });
    }

    const trimmedUrl = url.trim();

    // 1. Process Deterministic Finite Automaton (DFA)
    const dfaResult = processDfa(trimmedUrl);

    // 2. Process Regular Expression Validation & Parsing
    const regexResult = validateUrlWithRegex(trimmedUrl);

    // 3. Process Suspicious Pattern Detection
    const suspiciousResult = detectSuspiciousPatterns(trimmedUrl, regexResult.components);

    // 4. Compute Synthesized Academic Risk Score
    const riskAssessment = computeRiskScore({
      dfaResult,
      regexResult,
      suspiciousResult
    });

    // 5. Structure MongoDB Record
    const analysisDoc = {
      url: trimmedUrl,
      riskScore: riskAssessment.score,
      riskLevel: riskAssessment.level,
      statusLabel: riskAssessment.statusLabel,
      dfaAccepted: dfaResult.accepted,
      dfaStateSequence: dfaResult.stateSequence,
      dfaFinalState: dfaResult.finalState,
      regexValid: regexResult.isValid,
      protocol: regexResult.components.protocol || '',
      domain: regexResult.components.domain || '',
      subdomain: regexResult.components.subdomain || '',
      tld: regexResult.components.tld || '',
      isIp: Boolean(regexResult.components.isIp),
      indicatorsCount: suspiciousResult.indicators.length,
      indicators: suspiciousResult.indicators,
      reasons: riskAssessment.reasons,
      recommendation: riskAssessment.recommendation,
      stepTrace: dfaResult.stepTrace,
      componentTransitions: dfaResult.componentTransitions,
      clientIp: req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1'
    };

    // Save to MongoDB or Fallback Repository
    let savedRecord;
    const dbState = getDbState();
    if (dbState.isConnected) {
      savedRecord = await UrlAnalysis.create(analysisDoc);
    } else {
      savedRecord = await fallbackRepo.create(analysisDoc);
    }

    return res.status(200).json({
      success: true,
      data: {
        id: savedRecord._id,
        url: trimmedUrl,
        risk: riskAssessment,
        dfa: {
          accepted: dfaResult.accepted,
          finalState: dfaResult.finalState,
          stateSequence: dfaResult.stateSequence,
          stepTrace: dfaResult.stepTrace,
          componentTransitions: dfaResult.componentTransitions,
          transitionSummary: dfaResult.transitionSummary,
          error: dfaResult.error
        },
        regex: {
          isValid: regexResult.isValid,
          components: regexResult.components,
          validationChecks: regexResult.validationChecks,
          errors: regexResult.errors
        },
        suspicious: suspiciousResult,
        dbStatus: dbState.mode,
        createdAt: savedRecord.createdAt
      }
    });
  } catch (error) {
    console.error('Error during URL analysis:', error);
    return res.status(500).json({
      success: false,
      error: 'An internal server error occurred while analyzing the URL.',
      details: error.message
    });
  }
};

/**
 * Controller: Get Past Analysis History (Paginated & Filterable)
 */
exports.getHistory = async (req, res) => {
  try {
    const { riskLevel, search, limit = 50, page = 1 } = req.query;
    const dbState = getDbState();
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const pageNum = Math.max(1, parseInt(page, 10));
    const skip = (pageNum - 1) * limitNum;

    let items = [];
    let total = 0;

    if (dbState.isConnected) {
      const query = {};
      if (riskLevel && ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(riskLevel.toUpperCase())) {
        query.riskLevel = riskLevel.toUpperCase();
      }
      if (search) {
        query.$or = [
          { url: { $regex: search, $options: 'i' } },
          { domain: { $regex: search, $options: 'i' } }
        ];
      }
      total = await UrlAnalysis.countDocuments(query);
      items = await UrlAnalysis.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .select('-stepTrace');
    } else {
      const filter = {};
      if (riskLevel) filter.riskLevel = riskLevel.toUpperCase();
      if (search) filter.search = search;
      const all = await fallbackRepo.find(filter);
      total = all.length;
      items = all.slice(skip, skip + limitNum);
    }

    return res.status(200).json({
      success: true,
      data: items,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
        dbMode: dbState.mode
      }
    });
  } catch (error) {
    console.error('Error fetching analysis history:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve analysis history.'
    });
  }
};

/**
 * Controller: Get Single Analysis Details
 */
exports.getAnalysisById = async (req, res) => {
  try {
    const { id } = req.params;
    const dbState = getDbState();
    let record;

    if (dbState.isConnected) {
      record = await UrlAnalysis.findById(id);
    } else {
      record = await fallbackRepo.findById(id);
    }

    if (!record) {
      return res.status(404).json({
        success: false,
        error: 'Analysis record not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: record
    });
  } catch (error) {
    console.error('Error fetching analysis item:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve analysis details'
    });
  }
};

/**
 * Controller: Delete Single History Entry
 */
exports.deleteHistoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const dbState = getDbState();
    let deleted;

    if (dbState.isConnected) {
      deleted = await UrlAnalysis.findByIdAndDelete(id);
    } else {
      deleted = await fallbackRepo.findByIdAndDelete(id);
    }

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Record not found to delete'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Record deleted successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to delete record'
    });
  }
};

/**
 * Controller: Clear All History
 */
exports.clearHistory = async (req, res) => {
  try {
    const dbState = getDbState();
    if (dbState.isConnected) {
      await UrlAnalysis.deleteMany({});
    } else {
      await fallbackRepo.deleteMany({});
    }
    return res.status(200).json({
      success: true,
      message: 'Analysis history cleared successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to clear history'
    });
  }
};

/**
 * Controller: Get Dashboard Overview Metrics
 */
exports.getStats = async (req, res) => {
  try {
    const dbState = getDbState();
    let total = 0;
    let safeCount = 0;
    let mediumCount = 0;
    let highCount = 0;
    let recent = [];

    if (dbState.isConnected) {
      total = await UrlAnalysis.countDocuments();
      safeCount = await UrlAnalysis.countDocuments({ riskLevel: 'LOW' });
      mediumCount = await UrlAnalysis.countDocuments({ riskLevel: 'MEDIUM' });
      highCount = await UrlAnalysis.countDocuments({ riskLevel: { $in: ['HIGH', 'CRITICAL'] } });
      recent = await UrlAnalysis.find().sort({ createdAt: -1 }).limit(5).select('url riskLevel riskScore createdAt domain statusLabel');
    } else {
      const all = await fallbackRepo.find();
      total = all.length;
      safeCount = all.filter(i => i.riskLevel === 'LOW').length;
      mediumCount = all.filter(i => i.riskLevel === 'MEDIUM').length;
      highCount = all.filter(i => ['HIGH', 'CRITICAL'].includes(i.riskLevel)).length;
      recent = all.slice(0, 5);
    }

    return res.status(200).json({
      success: true,
      data: {
        total,
        safeCount,
        mediumCount,
        highCount,
        dbStatus: dbState.mode,
        recent
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve dashboard statistics'
    });
  }
};

/**
 * Controller: Get DFA Formal 5-tuple and Transition Table for Academic Visualization
 */
exports.getDfaModel = (req, res) => {
  try {
    const formalModel = getFormalDefinition();
    return res.status(200).json({
      success: true,
      data: formalModel
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to get DFA definition'
    });
  }
};
