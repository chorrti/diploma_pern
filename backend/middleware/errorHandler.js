/**
 * ГЛОБАЛЬНЫЙ ОБРАБОТЧИК ОШИБОК
 * 
 * Что делает:
 * - Ловит все ошибки, переданные через next(error)
 * - Логирует ошибку в консоль и в файл
 * - Отправляет пользователю понятный JSON-ответ
 * - Никогда не даёт серверу упасть из-за необработанной ошибки
 * 
 * Использование:
 *   В конце server.js: app.use(errorHandler)
 */

/**
 * ГЛОБАЛЬНЫЙ ОБРАБОТЧИК ОШИБОК
 * 
 * Что делает:
 * - Ловит все ошибки, переданные через next(error)
 * - Логирует ошибку в консоль и в файл
 * - Отправляет пользователю понятный JSON-ответ
 */

const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
    // 1. Логируем ошибку
    logger.error(err.message, {
        stack: err.stack,
        url: req.url,
        method: req.method,
        body: req.body,
        query: req.query,
        params: req.params
    });
    
    // 2. Определяем статус-код
    const statusCode = err.statusCode || 500;
    
    // 3. Формируем ответ для пользователя
    const response = {
        error: err.message || 'Внутренняя ошибка сервера'
    };
    
    // В режиме разработки добавляем стек (полезно для отладки)
    if (process.env.NODE_ENV === 'development') {
        response.stack = err.stack;
    }
    
    // 4. Отправляем ответ
    res.status(statusCode).json(response);
};

module.exports = errorHandler;