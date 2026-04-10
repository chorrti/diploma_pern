const jwt = require('jsonwebtoken');

/**
 * Middleware для проверки JWT токена
 * 
 * Использование:
 *   app.get('/api/protected', auth, (req, res) => { ... })
 * 
 * После проверки в req.user будет:
 *   { userId, profileId, role, login }
 */
const auth = (req, res, next) => {
    // 1. Получаем токен из заголовка Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Требуется авторизация' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // 2. Проверяем токен
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // { userId, profileId, role, login }
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Сессия истекла, войдите снова' });
        }
        return res.status(401).json({ error: 'Неверный токен' });
    }
};

module.exports = auth;