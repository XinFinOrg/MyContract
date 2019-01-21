var winston = require('winston');
var appRoot = require('app-root-path');

// define the custom settings for each transport (file, console)
var options = {
    file: {
        level: 'info',
        filename: `${appRoot}/logs/appInfo.log`,
        handleExceptions: true,
        json: true,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        colorize: false,
    },
    console: {
        level: 'debug',
        handleExceptions: true,
        json: false,
        colorize: true,
    },
    errorFile: {
        level: 'error',
        filename: `${appRoot}/logs/appError.log`,
        handleExceptions: true,
        json: true,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        colorize: false,
    },
};

// instantiate a new Winston Logger with the settings defined above
let logger = winston.createLogger({
    transports: [
        // new (winston.transports.Console)(options.console),
        new (winston.transports.File)(options.errorFile),
        new (winston.transports.File)(options.file)
    ],
    exitOnError: false, // do not exit on handled exceptions
});

// create a stream object with a 'write' function that will be used by `morgan`
logger.stream = {
    write: function (message, encoding) {
        // use the 'info' log level so the output will be picked up by both transports (file and console)
        logger.info(message);
    },
};

module.exports = logger;