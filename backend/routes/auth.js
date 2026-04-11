const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db/pool');
const catchAsync = require('../utils/catchAsync');
const { generateRandomPassword, sendEmail } = require('../utils/helpers');

/**
 * POST /api/auth/login
 * Тело запроса: { login, password }
 * 
 * Ответ при успехе:
 * {
 *   "token": "jwt_token",
 *   "user": {
 *     "id": 1,
 *     "profileId": 5,
 *     "fullName": "Иванов Иван Иванович",
 *     "role": "Ученик",
 *     "email": "ivan@mail.ru"
 *   }
 * }
 */
router.post('/login', catchAsync(async (req, res) => {
    const { login, password } = req.body;
    
    // 1. Проверяем, что логин и пароль переданы
    if (!login || !password) {
        return res.status(400).json({ error: 'Логин и пароль обязательны' });
    }
    
    // 2. Ищем пользователя в БД
    const userResult = await pool.query(`
        SELECT 
            u.id as user_id,
            u.password_hash,
            u.is_active,
            p.id as profile_id,
            p.familia,
            p.name,
            p.otchestvo,
            p.role_id,
            p.email,
            p.is_deleted,
            r.name as role_name
        FROM users u
        JOIN profiles p ON p.user_id = u.id
        JOIN roles r ON r.id = p.role_id
        WHERE u.login = $1
    `, [login]);
    
    // 3. Проверяем, существует ли пользователь
    if (userResult.rows.length === 0) {
        return res.status(401).json({ error: 'Неверный логин или пароль' });
    }
    
    const user = userResult.rows[0];
    
    // 4. Проверяем, не удалён ли профиль
    if (user.is_deleted) {
        return res.status(403).json({ error: 'Данный профиль удалён, обратитесь к администратору' });
    }
    
    // 5. Проверяем пароль
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
        return res.status(401).json({ error: 'Неверный логин или пароль' });
    }
    
    // 6. Формируем полное ФИО
    const fullName = `${user.familia} ${user.name} ${user.otchestvo || ''}`.trim();
    
    // 7. Генерируем JWT токен (живёт 7 дней)
    const token = jwt.sign(
        { 
            userId: user.user_id, 
            profileId: user.profile_id, 
            role: user.role_name,
            login: login
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
    
    // 8. Возвращаем ответ
    res.json({
        token: token,
        user: {
            id: user.user_id,
            profileId: user.profile_id,
            fullName: fullName,
            role: user.role_name,
            email: user.email || login
        }
    });
}));

/**
 * POST /api/auth/forgot-password
 * Восстановление пароля по email
 * Тело запроса: { email }
 */
router.post('/forgot-password', catchAsync(async (req, res) => {
    const { email } = req.body;
    
    if (!email) {
        return res.status(400).json({ error: 'Email обязателен' });
    }
    
    // 1. Ищем профиль по email
    const profileResult = await pool.query(`
        SELECT 
            p.id as profile_id,
            p.familia,
            p.name,
            p.otchestvo,
            p.email,
            u.id as user_id,
            u.login
        FROM profiles p
        JOIN users u ON u.id = p.user_id
        WHERE p.email = $1 AND p.is_deleted = false
    `, [email]);
    
    if (profileResult.rows.length === 0) {
        // Не говорим, что email не найден (безопасность)
        return res.json({ message: 'Если такой email существует, инструкции отправлены' });
    }
    
    const profile = profileResult.rows[0];
    
    // 2. Генерируем новый пароль
    const newPassword = generateRandomPassword();
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // 3. Обновляем пароль в БД
    await pool.query(`
        UPDATE users 
        SET password_hash = $1 
        WHERE id = $2
    `, [hashedPassword, profile.user_id]);
    
    // 4. Формируем полное ФИО
    const fullName = `${profile.familia} ${profile.name} ${profile.otchestvo || ''}`.trim();
    
    // 5. Отправляем письмо
    const emailText = `Здравствуйте, ${fullName}!

        Вы запросили восстановление доступа к аккаунту на платформе "Портфель".

        Логин: ${profile.login}
        Новый пароль: ${newPassword}`;
    
    await sendEmail(email, 'Восстановление пароля', emailText);
    
    res.json({ message: 'Если такой email существует, инструкции отправлены' });
}));

module.exports = router;