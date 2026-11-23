const express = require('express');
const router = express.Router();
const urlController = require('../controllers/urlController');
const { validateUrlInput } = require('../middleware/validator');

// URL Analysis Endpoint
router.post('/analyze', validateUrlInput, urlController.analyzeUrl);

// History & Retrieval Endpoints
router.get('/history', urlController.getHistory);
router.get('/history/:id', urlController.getAnalysisById);
router.delete('/history/:id', urlController.deleteHistoryItem);
router.delete('/history', urlController.clearHistory);

// Analytics & Model Endpoints
router.get('/stats', urlController.getStats);
router.get('/dfa-model', urlController.getDfaModel);

module.exports = router;
