const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

const logFile = path.join(logsDir, 'app.log');

class Logger {
    static log(level, message, data = {}) {
        const timestamp = new Date().toISOString();
        const dataStr = Object.keys(data).length ? JSON.stringify(data) : '';
        const logEntry = `[${timestamp}] ${level}: ${message} ${dataStr}\n`;
        
        console.log(logEntry.trim());
        fs.appendFileSync(logFile, logEntry);
    }

    static info(message, data = {}) {
        this.log('INFO', message, data);
    }

    static warn(message, data = {}) {
        this.log('WARN', message, data);
    }

    static error(message, error = {}) {
        const errorData = error instanceof Error ? 
            { message: error.message, stack: error.stack } : error;
        this.log('ERROR', message, errorData);
    }

    static debug(message, data = {}) {
        this.log('DEBUG', message, data);
    }

    static startOperation(operation, params = {}) {
        this.log('INFO', `Debut: ${operation}`, params);
    }

    static endOperation(operation, result = {}) {
        this.log('INFO', `Fin: ${operation}`, result);
    }

    static failOperation(operation, error) {
        this.log('ERROR', `Echec: ${operation}`, {
            error: error.message,
            stack: error.stack
        });
    }
}

module.exports = Logger;