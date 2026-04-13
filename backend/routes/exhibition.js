const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const catchAsync = require('../utils/catchAsync');
const getFileUrl = require('../utils/fileUrl');
const auth = require('../middleware/auth');

/**
 * GET /api/exhibition
 * Возвращает список работ для публичной выставки
 */
router.get('/', catchAsync(async (req, res) => {
    const { thematicId } = req.query;
    
    let query = `
        SELECT 
            e.id,
            e.city,
            e.file_path as "imageUrl",
            e.competition_id as "competitionId",
            p.familia || ' ' || p.name || ' ' || p.otchestvo as author,
            t.id as "thematicId",
            t.name as "thematicName"
        FROM exhibition e
        JOIN profiles p ON p.id = e.student_id
        JOIN competitions c ON c.id = e.competition_id
        JOIN thematics t ON t.id = c.thematic_id
        WHERE e.is_published = true
    `;
    
    const params = [];
    let paramIndex = 1;
    
    if (thematicId) {
        query += ` AND t.id = $${paramIndex}`;
        params.push(thematicId);
        paramIndex++;
    }
    
    query += ` ORDER BY e.id DESC`;
    
    const result = await pool.query(query, params);
    
    const rows = result.rows.map(row => ({
        ...row,
        imageUrl: getFileUrl(row.imageUrl)
    }));
    
    res.json(rows);
}));

// ============================================
// КОНКРЕТНЫЕ МАРШРУТЫ (ДО /:id)
// ============================================

/**
 * GET /api/exhibition/moderator
 * Возвращает список заявок на выставку, ожидающих модерации (is_published = false)
 * Только для модератора или админа
 */
router.get('/moderator', auth, catchAsync(async (req, res) => {
    if (req.user.role !== 'Модератор' && req.user.role !== 'Админ') {
        return res.status(403).json({ error: 'Доступ запрещён' });
    }
    
    const result = await pool.query(`
        SELECT 
            e.id,
            e.city,
            e.file_path as "imageUrl",
            e.competition_id as "competitionId",
            ca.id as "applicationId",   -- ← ДОБАВЬ ЭТУ СТРОКУ
            p.familia || ' ' || p.name || ' ' || p.otchestvo as author,
            c.name as "contestName",
            ca.title as "workTitle",
            ca.description as "workDescription"
        FROM exhibition e
        JOIN profiles p ON p.id = e.student_id
        JOIN competitions c ON c.id = e.competition_id
        JOIN competition_applications ca ON ca.competition_id = e.competition_id AND ca.student_id = e.student_id
        WHERE e.is_published = false
        ORDER BY e.id DESC
    `);
    
    const rows = result.rows.map(row => ({
        id: row.id,
        applicationId: row.applicationId,   // ← ДОБАВЬ
        workTitle: row.workTitle,
        workDescription: row.workDescription,
        author: row.author,
        contestTitle: row.contestName,
        city: row.city,
        imageUrl: getFileUrl(row.imageUrl)
    }));
    
    res.json(rows);
}));

/**
 * POST /api/exhibition/:id/publish
 * Публикует работу на выставке (is_published = true)
 */
router.post('/:id/publish', auth, catchAsync(async (req, res) => {
    if (req.user.role !== 'Модератор' && req.user.role !== 'Админ') {
        return res.status(403).json({ error: 'Доступ запрещён' });
    }
    
    const { id } = req.params;
    
    const existing = await pool.query('SELECT id FROM exhibition WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
        return res.status(404).json({ error: 'Заявка не найдена' });
    }
    
    await pool.query('UPDATE exhibition SET is_published = true WHERE id = $1', [id]);
    
    res.json({ message: 'Работа опубликована на выставке' });
}));

/**
 * DELETE /api/exhibition/:id/reject
 * Отклоняет заявку (удаляет из таблицы)
 */
router.delete('/:id/reject', auth, catchAsync(async (req, res) => {
    if (req.user.role !== 'Модератор' && req.user.role !== 'Админ') {
        return res.status(403).json({ error: 'Доступ запрещён' });
    }
    
    const { id } = req.params;
    
    const existing = await pool.query('SELECT id FROM exhibition WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
        return res.status(404).json({ error: 'Заявка не найдена' });
    }
    
    await pool.query('DELETE FROM exhibition WHERE id = $1', [id]);
    
    res.json({ message: 'Заявка отклонена' });
}));

// ============================================
// ДИНАМИЧЕСКИЕ МАРШРУТЫ (/:id)
// ============================================

/**
 * GET /api/exhibition/:id
 * Возвращает полную информацию о работе для модального окна
 */
router.get('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    
    const result = await pool.query(`
        SELECT 
            e.id,
            e.city,
            e.file_path as "imageUrl",
            p.familia,
            p.name,
            p.otchestvo,
            p.organization,
            p.phone,
            p.email,
            teacher.familia as "teacherFamilia",
            teacher.name as "teacherName",
            teacher.otchestvo as "teacherOtchestvo",
            ca.title as "workTitle",
            ca.description as "workDescription",
            att.content as "linkUrl"
        FROM exhibition e
        JOIN profiles p ON p.id = e.student_id
        JOIN competition_applications ca ON ca.competition_id = e.competition_id AND ca.student_id = e.student_id
        LEFT JOIN teacher_student ts ON ts.student_id = e.student_id
        LEFT JOIN profiles teacher ON teacher.id = ts.teacher_id
        LEFT JOIN application_attachments att ON att.application_id = ca.id AND att.type = 'link'
        WHERE e.id = $1
        LIMIT 1
    `, [id]);
    
    if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Работа не найдена' });
    }
    
    const row = result.rows[0];
    
    let teacherFullName = null;
    if (row.teacherFamilia) {
        teacherFullName = `${row.teacherFamilia} ${row.teacherName || ''} ${row.teacherOtchestvo || ''}`.trim();
    }
    
    res.json({
        id: row.id,
        author: {
            familia: row.familia,
            name: row.name,
            otchestvo: row.otchestvo,
            fullName: `${row.familia} ${row.name} ${row.otchestvo}`.trim(),
            organization: row.organization,
            city: row.city,
            phone: row.phone,
            email: row.email
        },
        teacher: teacherFullName ? {
            fullName: teacherFullName
        } : null,
        work: {
            title: row.workTitle,
            description: row.workDescription,
            imageUrl: getFileUrl(row.imageUrl),
            linkUrl: row.linkUrl
        }
    });
}));

/**
 * DELETE /api/exhibition/:id
 * Удаляет работу с выставки (только для модератора)
 */
router.delete('/:id', auth, catchAsync(async (req, res) => {
    if (req.user.role !== 'Модератор' && req.user.role !== 'Админ') {
        return res.status(403).json({ error: 'Доступ запрещён' });
    }
    
    const { id } = req.params;
    
    const existing = await pool.query('SELECT id FROM exhibition WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
        return res.status(404).json({ error: 'Работа не найдена' });
    }
    
    await pool.query('DELETE FROM exhibition WHERE id = $1', [id]);
    
    res.json({ message: 'Работа удалена с выставки' });
}));

module.exports = router;