const messages = require('./messages.js');

// APIError class for handling API errors
class APIError extends Error {
    constructor(message, status) {
        super(message);
        this.name = 'APIError';
        this.status = status || 500;

    }
}

module.exports = { APIError, messages };