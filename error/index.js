const messages = require('./messages.js');

// APIError class for handling API errors
class APIError extends Error {
    constructor(message, status, cause = null, parameters = null) {
        super(message);
        this.name = 'APIError';
        this.status = status || 500;
        this._timestamp = new Date();
        this._cause = cause;
        this.parameters = parameters;

    }

    get timestamp() {
        return this._timestamp;
    }

    get cause() {
        return this._cause;
    }

    set cause(cause) {
        this._cause = cause;
    }
}

module.exports = { APIError, messages };