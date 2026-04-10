const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const catchAsync = require('../utils/catchAsync');

/**
 * GET /api/thematics
 * Возвращает список всех тематик для фильтров
 * 
 * Ответ: [{ id: 1, name: "Живопись" }, { id: 2, name: "Графика" }, ...]
 */
router.get('/', catchAsync(async (req, res) => {
    const result = await pool.query(`
        SELECT id, name 
        FROM thematics 
        ORDER BY id
    `);
    
    res.json(result.rows);
}));

module.exports = router;