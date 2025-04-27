const etag = require('etag');

const {validationResult, matchedData} = require('express-validator');

const {APIError} = require('./error');
const {logger} = require('./logger');


const checkErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.mapped()});
    }
    req.validatedBody = matchedData(req, {locations: ['body']});
    next();
};

/**
 * Adds common HTTP response headers like content-type, caching, and ETag.
 * Optionally handles 304 if client has up-to-date content.
 */
function setResponseHeaders(res, data, options = {}) {
  const {
    cacheControl = 'public, max-age=60',
    contentType = 'application/json',
    customHeaders = {},
    enableEtag = true,
    req // optional, for conditional ETag handling
  } = options;

  res.set('Content-Type', contentType);
  res.set('Cache-Control', cacheControl);

  // Add custom headers if provided
  for (const [key, value] of Object.entries(customHeaders)) {
    res.set(key, value);
  }

  // Optional: handle ETag and 304 Not Modified
  if (enableEtag) {
    const json = typeof data === 'string' ? data : JSON.stringify(data);
    const tag = etag(json);
    res.set('ETag', tag);

    if (req && req.headers['if-none-match'] === tag) {
      res.status(304).end(); // client already has the latest version
      return false;
    }
  }

  return true; // continue with response
}

function errorHandler(err, req, res, next) {
  logger.error(`[Error] ${err.message}`, err.stack);

  if (typeof err === 'number') {
        return res.sendStatus(err);
    }
  if (err instanceof APIError) {
      if (err.status < 400 || err.status > 499) {
          logger.error('Error', err, err.stack);
      }
      return res.status(err.status).json({
          error: err.message
      });
  }

    logger.error(err.message, {stack: err.stack});
 
  return res.status(err.statusCode || 500).json({
    error: err.message || 'Internal Server Error',
  });
}

// function logRequest(req, res, next) {
//   // Capture original send
//   // const originalSend = res.send;

//   logger.info(`HTTP ${req.method} ${req.originalUrl} {statusCode: ${res.statusCode}}`);
//   next();
// }
// // Log incoming requests
// const logRequest = (req, res, next) => {
//   logger.info(`${req.method} ${req.path}`, {
//     query: req.query,
//     body: req.body,
//     ip: req.ip
//   });
//   next();
// };

module.exports = {
    checkErrors,
  setResponseHeaders,
  errorHandler,
  // logRequest
};
