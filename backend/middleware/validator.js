/**
 * Request validation middleware for URL inputs
 */
function validateUrlInput(req, res, next) {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({
      success: false,
      error: 'URL is required in the request body.'
    });
  }

  if (typeof url !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'URL must be a string.'
    });
  }

  const trimmed = url.trim();

  if (trimmed.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'URL cannot be empty or whitespace.'
    });
  }

  if (trimmed.length > 2048) {
    return res.status(400).json({
      success: false,
      error: 'URL exceeds maximum allowable length of 2048 characters.'
    });
  }

  req.body.url = trimmed;
  next();
}

module.exports = {
  validateUrlInput
};
