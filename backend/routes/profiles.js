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


/**
 * GET /api/students/my
 * Возвращает список учеников, прикреплённых к текущему учителю
 */
router.get('/students/my', auth, catchAsync(async (req, res) => {
    const teacherId = req.user.profileId;
    
    const result = await pool.query(`
        SELECT 
            p.id,
            p.familia,
            p.name,
            p.otchestvo,
            p.birth_date,
            p.phone,
            p.email,
            p.city,
            p.organization,
            CASE WHEN u.id IS NOT NULL THEN true ELSE false END as has_account
        FROM teacher_student ts
        JOIN profiles p ON p.id = ts.student_id
        LEFT JOIN users u ON u.id = p.user_id
        WHERE ts.teacher_id = $1 AND p.is_deleted = false
        ORDER BY p.familia, p.name
    `, [teacherId]);
    
    const students = result.rows.map(row => ({
        id: row.id,
        fullName: `${row.familia} ${row.name} ${row.otchestvo || ''}`.trim(),
        birthDate: row.birth_date ? new Date(row.birth_date).toLocaleDateString('ru-RU') : '',
        phone: row.phone || '',
        email: row.email || '',
        city: row.city || '',
        organization: row.organization || '',
        hasAccount: row.has_account
    }));
    
    res.json(students);
}));

/**
 * POST /api/profiles/students
 * Создание или обновление ученика учителем
 */
router.post('/students', auth, catchAsync(async (req, res) => {
    const teacherId = req.user.profileId;
    const { familia, name, otchestvo, birthDate, phone, city, organization } = req.body;
    
    // Очищаем телефон от нецифровых символов для поиска
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Ищем существующего ученика по номеру телефона
    const existingStudent = await pool.query(`
        SELECT id FROM profiles 
        WHERE regexp_replace(phone, '[^0-9]', '', 'g') = $1 
        AND role_id = (SELECT id FROM roles WHERE name = 'Ученик')
        LIMIT 1
    `, [cleanPhone]);
    
    let studentId;
    
    if (existingStudent.rows.length > 0) {
        // Обновляем существующего ученика
        studentId = existingStudent.rows[0].id;
        await pool.query(`
            UPDATE profiles 
            SET familia = $1, name = $2, otchestvo = $3, 
                birth_date = $4, city = $5, organization = $6,
                phone = $7
            WHERE id = $8
        `, [familia, name, otchestvo, birthDate, city, organization, phone, studentId]);
    } else {
        // Создаём нового ученика
        const roleResult = await pool.query(`SELECT id FROM roles WHERE name = 'Ученик'`);
        const studentRoleId = roleResult.rows[0].id;
        
        const result = await pool.query(`
            INSERT INTO profiles (familia, name, otchestvo, role_id, birth_date, phone, city, organization, is_deleted)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, false)
            RETURNING id
        `, [familia, name, otchestvo, studentRoleId, birthDate, phone, city, organization]);
        studentId = result.rows[0].id;
    }
    
    // Привязываем ученика к учителю (если ещё не привязан)
    const existingLink = await pool.query(`
        SELECT 1 FROM teacher_student WHERE teacher_id = $1 AND student_id = $2
    `, [teacherId, studentId]);
    
    if (existingLink.rows.length === 0) {
        await pool.query(`
            INSERT INTO teacher_student (teacher_id, student_id)
            VALUES ($1, $2)
        `, [teacherId, studentId]);
    }
    
    res.json({ message: 'Ученик успешно добавлен', studentId });
}));

/**
 * GET /api/profiles/:id
 * Возвращает профиль пользователя по ID (для просмотра учителем)
 */
router.get('/:id', auth, catchAsync(async (req, res) => {
    const { id } = req.params;
    const currentUserId = req.user.profileId;
    
    // Проверяем, имеет ли текущий пользователь доступ к этому профилю
    // (учитель может смотреть только своих учеников)
    const accessCheck = await pool.query(`
        SELECT 1 FROM teacher_student 
        WHERE teacher_id = $1 AND student_id = $2
    `, [currentUserId, id]);
    
    if (accessCheck.rows.length === 0 && req.user.role !== 'Админ') {
        return res.status(403).json({ error: 'Доступ запрещён' });
    }
    
    const result = await pool.query(`
        SELECT 
            p.id,
            p.familia,
            p.name,
            p.otchestvo,
            p.birth_date,
            p.phone,
            p.email,
            p.city,
            p.organization,
            r.name as role
        FROM profiles p
        JOIN roles r ON r.id = p.role_id
        WHERE p.id = $1 AND p.is_deleted = false
    `, [id]);
    
    if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    const profile = result.rows[0];
    
    res.json({
        id: profile.id,
        fullName: `${profile.familia} ${profile.name} ${profile.otchestvo || ''}`.trim(),
        birthDate: profile.birth_date ? new Date(profile.birth_date).toLocaleDateString('ru-RU') : '',
        phone: profile.phone || '',
        email: profile.email || '',
        city: profile.city || '',
        organization: profile.organization || '',
        role: profile.role
    });
}));

module.exports = router;