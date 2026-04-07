/**
 * Класс для создания ошибок с определённым статус-кодом
 * 
 * Пример:
 *   throw new AppError('Пользователь не найден', 404);
 */

class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true; // Отличить операционные ошибки от багов
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;