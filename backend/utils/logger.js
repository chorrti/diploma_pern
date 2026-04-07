/**
 * ЛОГГЕР ДЛЯ ЗАПИСИ ОШИБОК В ФАЙЛ
 * 
 * Что делает:
 * - Записывает ошибки в файл logs/error.log
 * - Сохраняет также в консоль (для разработки)
 * - Каждая запись содержит: дату, время, сообщение, стек ошибки, URL, метод
 * 
 * Формат записи в файл: JSON-строка (легко парсить, если нужно анализировать)
 */

const fs = require('fs');
const path = require('path');

// Путь к папке с логами
const logsDir = path.join(__dirname, '../logs');

// Создаём папку logs, если её нет
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
    console.log('📁 Создана папка для логов:', logsDir);
}

/**
 * Запись ошибки в файл
 * @param {string} message - Текст ошибки
 * @param {object} meta - Дополнительные данные (стек, URL, метод и т.д.)
 */
const logError = (message, meta = {}) => {
    // Формируем запись
    const logEntry = {
        timestamp: new Date().toISOString(),
        level: 'ERROR',
        message: message,
        ...meta
    };
    
    // Записываем в консоль (для разработки)
    console.error(`[${logEntry.timestamp}] ERROR:`, message);
    if (meta.stack) {
        console.error(meta.stack);
    }
    
    // Записываем в файл
    const logLine = JSON.stringify(logEntry) + '\n';
    const logFilePath = path.join(logsDir, 'error.log');
    
    fs.appendFile(logFilePath, logLine, (err) => {
        if (err) {
            console.error('Не удалось записать лог в файл:', err.message);
        }
    });
};

/**
 * Запись информационного сообщения (для отладки)
 * @param {string} message - Текст сообщения
 * @param {object} meta - Дополнительные данные
 */
const logInfo = (message, meta = {}) => {
    const logEntry = {
        timestamp: new Date().toISOString(),
        level: 'INFO',
        message: message,
        ...meta
    };
    
    console.log(`[${logEntry.timestamp}] INFO:`, message);
    
    // Информационные логи тоже пишем в файл (но в отдельный)
    const logLine = JSON.stringify(logEntry) + '\n';
    const logFilePath = path.join(logsDir, 'app.log');
    
    fs.appendFile(logFilePath, logLine, (err) => {
        if (err) {
            console.error('Не удалось записать лог в файл:', err.message);
        }
    });
};

module.exports = {
    error: logError,
    info: logInfo
};