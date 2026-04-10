const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const catchAsync = require('../utils/catchAsync');
const auth = require('../middleware/auth');

/**
 * GET /api/profiles/me
 * Возвращает профиль текущего авторизованного пользователя
 * 
 * Ответ:
 * {
 *   "id": 1,
 *   "fullName": "Иванов Иван Иванович",
 *   "birthDate": "1985-01-01",
 *   "city": "Москва",
 *   "email": "ivan@mail.ru",
 *   "phone": "+7 (999) 123-45-67",
 *   "organization": "МБОУ СОШ №1"
 * }
 */
router.get('/me', auth, catchAsync(async (req, res) => {
    const profileId = req.user.profileId;
    
    const result = await pool.query(`
        SELECT 
            p.id,
            p.familia,
            p.name,
            p.otchestvo,
            p.birth_date,
            p.city,
            p.organization,
            p.phone,
            p.email,
            r.name as role
        FROM profiles p
        JOIN roles r ON r.id = p.role_id
        WHERE p.id = $1 AND p.is_deleted = false
    `, [profileId]);
    
    if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Профиль не найден' });
    }
    
    const profile = result.rows[0];
    
    // Формируем полное ФИО
    const fullName = `${profile.familia} ${profile.name} ${profile.otchestvo || ''}`.trim();
    
    // Форматируем дату рождения
    const birthDate = profile.birth_date 
        ? new Date(profile.birth_date).toLocaleDateString('ru-RU') 
        : '';
    
    res.json({
        id: profile.id,
        fullName: fullName,
        birthDate: birthDate,
        city: profile.city || '',
        email: profile.email || '',
        phone: profile.phone || '',
        organization: profile.organization || '',
        role: profile.role
    });
}));

module.exports = router;