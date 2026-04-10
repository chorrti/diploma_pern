const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const catchAsync = require('../utils/catchAsync');
const getFileUrl = require('../utils/fileUrl');

/**
 * POST /api/search/results
 * Поиск конкурсов с результатами по параметрам
 * 
 * Тело запроса:
 * {
 *   author: "Петрова Анна",   // ФИО ученика или руководителя (может содержать пробелы)
 *   thematicId: 1,            // ID тематики (опционально)
 *   competitionName: "живопись"  // Название конкурса (может содержать пробелы)
 * }
 * 
 * Ответ: массив конкурсов (как в GET /api/competitions?status=archived)
 */
router.post('/results', catchAsync(async (req, res) => {
    const { author, thematicId, competitionName } = req.body;
    
    let query = `
        SELECT DISTINCT
            c.id,
            c.name,
            c.description,
            c.start_date as "startDate",
            c.end_date as "endDate",
            c.results_date as "resultsDate",
            c.regulation_file_path as "regulationFilePath",
            c.thematic_id as "thematicId",
            t.name as "thematicName",
            c.status
        FROM competitions c
        LEFT JOIN thematics t ON t.id = c.thematic_id
        WHERE c.status = 'archived'
    `;
    
    const params = [];
    let paramIndex = 1;
    
    // Поиск по автору/руководителю (разбиваем на слова)
    if (author && author.trim()) {
        const authorParts = author.trim().split(/\s+/);
        const authorConditions = [];
        
        for (const part of authorParts) {
            authorConditions.push(`
                EXISTS (
                    SELECT 1 FROM results r
                    JOIN profiles p ON p.id = r.student_id
                    LEFT JOIN teacher_student ts ON ts.student_id = p.id
                    LEFT JOIN profiles teacher ON teacher.id = ts.teacher_id
                    WHERE r.competition_id = c.id
                    AND (
                        p.familia ILIKE $${paramIndex}
                        OR p.name ILIKE $${paramIndex}
                        OR p.otchestvo ILIKE $${paramIndex}
                        OR teacher.familia ILIKE $${paramIndex}
                        OR teacher.name ILIKE $${paramIndex}
                        OR teacher.otchestvo ILIKE $${paramIndex}
                        OR p.familia || ' ' || p.name || ' ' || p.otchestvo ILIKE $${paramIndex}
                        OR teacher.familia || ' ' || teacher.name || ' ' || teacher.otchestvo ILIKE $${paramIndex}
                    )
                )
            `);
            params.push(`%${part}%`);
            paramIndex++;
        }
        
        query += ` AND (${authorConditions.join(' AND ')})`;
    }
    
    // Фильтр по тематике
    if (thematicId) {
        query += ` AND c.thematic_id = $${paramIndex}`;
        params.push(thematicId);
        paramIndex++;
    }
    
    // Поиск по названию конкурса (разбиваем на слова)
    if (competitionName && competitionName.trim()) {
        const nameParts = competitionName.trim().split(/\s+/);
        const nameConditions = [];
        
        for (const part of nameParts) {
            nameConditions.push(`c.name ILIKE $${paramIndex}`);
            params.push(`%${part}%`);
            paramIndex++;
        }
        
        query += ` AND (${nameConditions.join(' AND ')})`;
    }
    
    query += ` ORDER BY c.end_date DESC`;
    
    const result = await pool.query(query, params);
    
    // Формируем полные URL для файлов положений
    const rows = result.rows.map(row => ({
        ...row,
        regulationFilePath: getFileUrl(row.regulationFilePath)
    }));
    
    res.json(rows);
}));

module.exports = router;