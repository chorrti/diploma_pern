const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const catchAsync = require('../utils/catchAsync');
const auth = require('../middleware/auth');

/**
 * GET /api/admin/users
 * Список всех активных пользователей (is_deleted = false)
 * С поддержкой поиска по всем полям, включая логин
 * Query: ?search=текст
 */
router.get('/users', auth, catchAsync(async (req, res) => {
    if (req.user.role !== 'Админ') {
        return res.status(403).json({ error: 'Доступ запрещён' });
    }
    
    const { search } = req.query;
    
    let query = `
        SELECT 
            p.id,
            p.familia,
            p.name,
            p.otchestvo,
            p.email,
            p.phone,
            p.birth_date,
            p.city,
            p.organization,
            r.name as role,
            u.login
        FROM profiles p
        JOIN roles r ON r.id = p.role_id
        LEFT JOIN users u ON u.id = p.user_id
        WHERE p.is_deleted = false
    `;
    
    const params = [];
    
    if (search) {
        query += ` AND (
            p.familia ILIKE $1 OR
            p.name ILIKE $1 OR
            p.otchestvo ILIKE $1 OR
            p.email ILIKE $1 OR
            p.phone ILIKE $1 OR
            p.city ILIKE $1 OR
            p.organization ILIKE $1 OR
            r.name ILIKE $1 OR
            u.login ILIKE $1
        )`;
        params.push(`%${search}%`);
    }
    
    query += ` ORDER BY p.created_at DESC`;
    
    const result = await pool.query(query, params);
    
    const users = result.rows.map(user => ({
        id: user.id,
        fio: {
            last: user.familia,
            first: user.name,
            middle: user.otchestvo || ''
        },
        email: user.email,
        phone: user.phone || '',
        birthDate: user.birth_date ? new Date(user.birth_date).toLocaleDateString('ru-RU') : '',
        city: user.city || '',
        organization: user.organization || '',
        role: user.role,
        login: user.login || null
    }));
    
    res.json(users);
}));

/**
 * DELETE /api/admin/users/:profileId
 * Мягкое удаление пользователя (нельзя удалить админа или модератора)
 */
router.delete('/users/:profileId', auth, catchAsync(async (req, res) => {
    if (req.user.role !== 'Админ') {
        return res.status(403).json({ error: 'Доступ запрещён' });
    }
    
    const { profileId } = req.params;
    
    // Проверяем роль удаляемого пользователя
    const roleCheck = await pool.query(`
        SELECT r.name as role_name 
        FROM profiles p
        JOIN roles r ON r.id = p.role_id
        WHERE p.id = $1 AND p.is_deleted = false
    `, [profileId]);
    
    if (roleCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    const userRole = roleCheck.rows[0].role_name;
    
    // Запрещаем удаление админа и модератора
    if (userRole === 'Админ' || userRole === 'Модератор') {
        return res.status(403).json({ error: 'Нельзя удалить администратора или модератора' });
    }
    
    // Получаем user_id из профиля
    const profile = await pool.query(`SELECT user_id FROM profiles WHERE id = $1`, [profileId]);
    
    // Мягкое удаление профиля
    await pool.query(`
        UPDATE profiles 
        SET is_deleted = true,
            email = CONCAT('deleted_', id, '@deleted.com')
        WHERE id = $1
    `, [profileId]);
    
    // Блокировка аккаунта (если есть)
    if (profile.rows[0]?.user_id) {
        await pool.query(`UPDATE users SET is_active = false WHERE id = $1`, [profile.rows[0].user_id]);
    }
    
    res.json({ message: 'Пользователь удалён' });
}));

module.exports = router;