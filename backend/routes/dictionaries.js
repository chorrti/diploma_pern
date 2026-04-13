const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const catchAsync = require('../utils/catchAsync');
const auth = require('../middleware/auth');

/**
 * GET /api/dictionaries/degrees
 * Возвращает список всех степеней дипломов
 */
router.get('/degrees', auth, catchAsync(async (req, res) => {
    // Только модератор или админ
    if (req.user.role !== 'Модератор' && req.user.role !== 'Админ') {
        return res.status(403).json({ error: 'Доступ запрещён' });
    }
    
    const result = await pool.query(`
        SELECT id, name FROM degrees ORDER BY id
    `);
    
    res.json(result.rows);
}));

/**
 * POST /api/dictionaries/degrees
 * Добавляет новую степень диплома
 */
router.post('/degrees', auth, catchAsync(async (req, res) => {
    if (req.user.role !== 'Модератор' && req.user.role !== 'Админ') {
        return res.status(403).json({ error: 'Доступ запрещён' });
    }
    
    const { name } = req.body;
    
    if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Название степени обязательно' });
    }
    
    // Проверяем, нет ли уже такой степени
    const existing = await pool.query('SELECT id FROM degrees WHERE name = $1', [name.trim()]);
    if (existing.rows.length > 0) {
        return res.status(400).json({ error: 'Степень с таким названием уже существует' });
    }
    
    const result = await pool.query(`
        INSERT INTO degrees (name) VALUES ($1) RETURNING id, name
    `, [name.trim()]);
    
    res.json(result.rows[0]);
}));

/**
 * DELETE /api/dictionaries/degrees/:id
 * Удаляет степень диплома (только если нет связанных результатов)
 */
router.delete('/degrees/:id', auth, catchAsync(async (req, res) => {
    if (req.user.role !== 'Модератор' && req.user.role !== 'Админ') {
        return res.status(403).json({ error: 'Доступ запрещён' });
    }
    
    const { id } = req.params;
    
    // Проверяем, есть ли связанные результаты
    const linkedResults = await pool.query(`
        SELECT id FROM results WHERE degree_id = $1 LIMIT 1
    `, [id]);
    
    if (linkedResults.rows.length > 0) {
        return res.status(400).json({ 
            error: 'Нельзя удалить степень, так как она используется в дипломах' 
        });
    }
    
    await pool.query('DELETE FROM degrees WHERE id = $1', [id]);
    
    res.json({ message: 'Степень удалена' });
}));

/**
 * GET /api/dictionaries/thematics
 * Возвращает список всех тематик конкурсов
 */
router.get('/thematics', auth, catchAsync(async (req, res) => {
    if (req.user.role !== 'Модератор' && req.user.role !== 'Админ') {
        return res.status(403).json({ error: 'Доступ запрещён' });
    }
    
    const result = await pool.query(`
        SELECT id, name FROM thematics ORDER BY id
    `);
    
    res.json(result.rows);
}));

/**
 * POST /api/dictionaries/thematics
 * Добавляет новую тематику конкурса
 */
router.post('/thematics', auth, catchAsync(async (req, res) => {
    if (req.user.role !== 'Модератор' && req.user.role !== 'Админ') {
        return res.status(403).json({ error: 'Доступ запрещён' });
    }
    
    const { name } = req.body;
    
    if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Название тематики обязательно' });
    }
    
    // Проверяем, нет ли уже такой тематики
    const existing = await pool.query('SELECT id FROM thematics WHERE name = $1', [name.trim()]);
    if (existing.rows.length > 0) {
        return res.status(400).json({ error: 'Тематика с таким названием уже существует' });
    }
    
    const result = await pool.query(`
        INSERT INTO thematics (name) VALUES ($1) RETURNING id, name
    `, [name.trim()]);
    
    res.json(result.rows[0]);
}));

/**
 * DELETE /api/dictionaries/thematics/:id
 * Удаляет тематику (только если нет связанных конкурсов)
 */
router.delete('/thematics/:id', auth, catchAsync(async (req, res) => {
    if (req.user.role !== 'Модератор' && req.user.role !== 'Админ') {
        return res.status(403).json({ error: 'Доступ запрещён' });
    }
    
    const { id } = req.params;
    
    // Проверяем, есть ли связанные конкурсы
    const linkedCompetitions = await pool.query(`
        SELECT id FROM competitions WHERE thematic_id = $1 LIMIT 1
    `, [id]);
    
    if (linkedCompetitions.rows.length > 0) {
        return res.status(400).json({ 
            error: 'Нельзя удалить тематику, так как она используется в конкурсах' 
        });
    }
    
    await pool.query('DELETE FROM thematics WHERE id = $1', [id]);
    
    res.json({ message: 'Тематика удалена' });
}));

module.exports = router;