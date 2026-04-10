const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const catchAsync = require('../utils/catchAsync');

/**
 * GET /api/competitions
 * Возвращает список конкурсов с фильтрацией
 * 
 * Query параметры:
 *   status - open, archived (опционально)
 *   thematicId - ID тематики (опционально)
 * 
 * Ответ: массив конкурсов
 */
router.get('/', catchAsync(async (req, res) => {
    const { status, thematicId } = req.query;
    
    let query = `
        SELECT 
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
        WHERE c.status IS NOT NULL
    `;
    
    const params = [];
    let paramIndex = 1;
    
    // Фильтр по статусу
    if (status) {
        query += ` AND c.status = $${paramIndex}`;
        params.push(status);
        paramIndex++;
    }
    
    // Фильтр по тематике (если передан конкретный ID)
    if (thematicId && thematicId !== 'null') {
        query += ` AND c.thematic_id = $${paramIndex}`;
        params.push(thematicId);
        paramIndex++;
    }
    
    query += ` ORDER BY c.start_date ASC`;
    
    const result = await pool.query(query, params);
    res.json(result.rows);
}));

/**
 * GET /api/competitions/:id
 * Возвращает один конкурс по ID
 */
router.get('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    
    const result = await pool.query(`
        SELECT 
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
        WHERE c.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Конкурс не найден' });
    }
    
    res.json(result.rows[0]);
}));

module.exports = router;