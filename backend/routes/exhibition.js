const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const catchAsync = require('../utils/catchAsync');

/**
 * GET /api/exhibition
 * Возвращает список работ для публичной выставки
 * 
 * Query параметры:
 *   thematicId - ID тематики (опционально)
 * 
 * Ответ: массив работ с полями:
 *   id, author (ФИО), city, imageUrl, thematicId, thematicName, competitionId
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
        WHERE c.status = 'archived'
    `;
    
    const params = [];
    let paramIndex = 1;
    
    // Фильтр по тематике
    if (thematicId) {
        query += ` AND t.id = $${paramIndex}`;
        params.push(thematicId);
        paramIndex++;
    }
    
    query += ` ORDER BY e.id DESC`;
    
    const result = await pool.query(query, params);
    
    // Преобразуем imageUrl в полный URL
    const rows = result.rows.map(row => ({
        ...row,
        imageUrl: row.imageUrl ? `http://localhost:5000${row.imageUrl}` : null
    }));
    
    res.json(rows);
}));

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
            -- Данные руководителя (если есть)
            teacher.familia as "teacherFamilia",
            teacher.name as "teacherName",
            teacher.otchestvo as "teacherOtchestvo",
            -- Данные заявки
            ca.title as "workTitle",
            ca.description as "workDescription",
            -- Ссылка (из application_attachments)
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
    
    // Формируем ФИО руководителя
    let teacherFullName = null;
    if (row.teacherFamilia) {
        teacherFullName = `${row.teacherFamilia} ${row.teacherName || ''} ${row.teacherOtchestvo || ''}`.trim();
    }
    
    // Формируем полный URL для изображения
    const imageUrl = row.imageUrl ? `http://localhost:5000${row.imageUrl}` : null;
    
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
            imageUrl: imageUrl,
            linkUrl: row.linkUrl
        }
    });
}));

module.exports = router;