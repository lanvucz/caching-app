const { createLogger, format, transports } = require('winston');
const expressWinston = require('express-winston');
const {logLevel, logPretty} = require('./config.js');

const myFormat = format.printf(info => {
    const stringifiedRest = JSON.stringify(Object.assign({}, info, {
        level: undefined,
        message: undefined,
        splat: undefined,
        label: undefined,
        timestamp: undefined
    }));

    if (stringifiedRest !== '{}') {
        info = `${info.timestamp} [${info.level}] - (${info.label}) ${info.message} ${stringifiedRest}`;
    } else {
        info = `${info.timestamp} [${info.level}] - (${info.label}) ${info.message}`;
    }

    return info;
});

const createConsoleTransport = (program = 'default') =>
    new transports.Console({
        colorize: true,
        prettyPrint: true,
        meta: true,
        format: format.combine(
            format.colorize(),
            format.label({label: program}),
            format.timestamp(),
            myFormat
        )
    });

const createConsolePlainTransport = (program = 'default') =>
    new transports.Console({label: program});

expressWinston.requestWhitelist.push('body');
// expressWinston.responseWhitelist.push('body');

const logger = createLogger({
  level: logLevel || 'info', // Set the default log level
  // format: format.combine(
  //   format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  //   format.printf(({ timestamp, level, message }) => `${timestamp} [${level.toUpperCase()}]: ${message}`)
  // ),
  transports: [
    // new transports.Console(), // Log to the console
    ...(logPretty === 'true' ? [createConsoleTransport()] : [createConsolePlainTransport()]),
    new transports.File({ filename: 'logs/app.log' }) // Log to a file
  ],
});

const getRequestLogger = () =>
    expressWinston.logger({
        winstonInstance: logger
    });

// module.exports = logger;
// module.exports.getRequestLogger = getRequestLogger;
module.exports = {logger, getRequestLogger};