const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const catchAsync = require('../utils/catchAsync');
const getFileUrl = require('../utils/fileUrl');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Настройка multer для загрузки положений конкурсов
const regulationStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/regulations/';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const filename = `${uuidv4()}${ext}`;
        cb(null, filename);
    }
});

const uploadRegulation = multer({
    storage: regulationStorage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Только PDF файлы'));
        }
    }
});

// Функция для проверки валидности даты в формате ГГГГ-ММ-ДД
const isValidDate = (dateStr) => {
    if (!dateStr) return true;
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateStr)) return false;
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
};

/**
 * GET /api/competitions
 * Возвращает список конкурсов с фильтрацией
 */
router.get('/', catchAsync(async (req, res) => {
    const { status, thematicId } = req.query;
    
    let query = `
        SELECT 
            c.id,
            c.name,
            c.description,
            TO_CHAR(c.start_date, 'YYYY-MM-DD') as "startDate",
            TO_CHAR(c.end_date, 'YYYY-MM-DD') as "endDate",
            TO_CHAR(c.results_date, 'YYYY-MM-DD') as "resultsDate",
            c.regulation_file_path as "regulationFilePath",
            c.thematic_id as "thematicId",
            t.name as "thematicName",
            c.status
        FROM competitions c
        LEFT JOIN thematics t ON t.id = c.thematic_id
        WHERE c.status IS NOT NULL AND c.is_deleted = false
    `;
    
    const params = [];
    let paramIndex = 1;
    
    if (status) {
        query += ` AND c.status = $${paramIndex}`;
        params.push(status);
        paramIndex++;
    }
    
    if (thematicId && thematicId !== 'null') {
        query += ` AND c.thematic_id = $${paramIndex}`;
        params.push(thematicId);
        paramIndex++;
    }
    
    query += ` ORDER BY c.start_date ASC`;
    
    const result = await pool.query(query, params);
    
    const rows = result.rows.map(row => ({
        ...row,
        regulationFilePath: getFileUrl(row.regulationFilePath)
    }));
    
    res.json(rows);
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
            TO_CHAR(c.start_date, 'YYYY-MM-DD') as "startDate",
            TO_CHAR(c.end_date, 'YYYY-MM-DD') as "endDate",
            TO_CHAR(c.results_date, 'YYYY-MM-DD') as "resultsDate",
            c.regulation_file_path as "regulationFilePath",
            c.thematic_id as "thematicId",
            t.name as "thematicName",
            c.status
        FROM competitions c
        LEFT JOIN thematics t ON t.id = c.thematic_id
        WHERE c.id = $1 AND c.is_deleted = false
    `, [id]);
    
    if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Конкурс не найден' });
    }
    
    const row = result.rows[0];
    row.regulationFilePath = getFileUrl(row.regulationFilePath);
    
    res.json(row);
}));

/**
 * POST /api/competitions
 * Создание нового конкурса (только для модератора/админа)
 */
router.post('/', auth, uploadRegulation.single('regulation'), catchAsync(async (req, res) => {
    if (req.user.role !== 'Модератор' && req.user.role !== 'Админ') {
        return res.status(403).json({ error: 'Доступ запрещён' });
    }
    
    const { name, description, startDate, endDate, resultsDate, thematicId } = req.body;
    
    if (!name || !startDate || !endDate) {
        return res.status(400).json({ error: 'Название, дата начала и окончания обязательны' });
    }
    
    // Валидация дат (формат ГГГГ-ММ-ДД)
    if (!isValidDate(startDate)) {
        return res.status(400).json({ error: 'Неверный формат даты начала' });
    }
    if (!isValidDate(endDate)) {
        return res.status(400).json({ error: 'Неверный формат даты окончания' });
    }
    if (resultsDate && !isValidDate(resultsDate)) {
        return res.status(400).json({ error: 'Неверный формат даты результатов' });
    }
    
    // Проверка логики дат
    if (startDate > endDate) {
        return res.status(400).json({ error: 'Дата начала не может быть позже даты окончания' });
    }
    if (resultsDate && endDate > resultsDate) {
        return res.status(400).json({ error: 'Дата окончания не может быть позже даты результатов' });
    }
    
    let regulationFilePath = null;
    if (req.file) {
        regulationFilePath = `/uploads/regulations/${req.file.filename}`;
    }
    
    const result = await pool.query(`
        INSERT INTO competitions (
            name, description, start_date, end_date, results_date, 
            thematic_id, regulation_file_path, status, created_by, is_deleted
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'open', $8, false)
        RETURNING id
    `, [name, description, startDate, endDate, resultsDate || null, thematicId || null, regulationFilePath, req.user.profileId]);
    
    res.json({ message: 'Конкурс создан', id: result.rows[0].id });
}));

/**
 * PUT /api/competitions/:id
 * Редактирование конкурса (только для модератора/админа)
 */
router.put('/:id', auth, uploadRegulation.single('regulation'), catchAsync(async (req, res) => {
    if (req.user.role !== 'Модератор' && req.user.role !== 'Админ') {
        return res.status(403).json({ error: 'Доступ запрещён' });
    }
    
    const { id } = req.params;
    const { name, description, startDate, endDate, resultsDate, thematicId } = req.body;
    
    const existing = await pool.query('SELECT id FROM competitions WHERE id = $1 AND is_deleted = false', [id]);
    if (existing.rows.length === 0) {
        return res.status(404).json({ error: 'Конкурс не найден' });
    }
    
    // Валидация дат (формат ГГГГ-ММ-ДД)
    if (!isValidDate(startDate)) {
        return res.status(400).json({ error: 'Неверный формат даты начала' });
    }
    if (!isValidDate(endDate)) {
        return res.status(400).json({ error: 'Неверный формат даты окончания' });
    }
    if (resultsDate && !isValidDate(resultsDate)) {
        return res.status(400).json({ error: 'Неверный формат даты результатов' });
    }
    
    // Проверка логики дат
    if (startDate > endDate) {
        return res.status(400).json({ error: 'Дата начала не может быть позже даты окончания' });
    }
    if (resultsDate && endDate > resultsDate) {
        return res.status(400).json({ error: 'Дата окончания не может быть позже даты результатов' });
    }
    
    let regulationFilePath = null;
    if (req.file) {
        regulationFilePath = `/uploads/regulations/${req.file.filename}`;
    }
    
    let query = `
        UPDATE competitions SET 
            name = $1, 
            description = $2, 
            start_date = $3, 
            end_date = $4, 
            results_date = $5, 
            thematic_id = $6
    `;
    const params = [name, description, startDate, endDate, resultsDate || null, thematicId || null];
    let paramIndex = 7;
    
    if (req.file) {
        query += `, regulation_file_path = $${paramIndex}`;
        params.push(regulationFilePath);
        paramIndex++;
    }
    
    query += ` WHERE id = $${paramIndex}`;
    params.push(id);
    
    await pool.query(query, params);
    
    res.json({ message: 'Конкурс обновлён' });
}));

/**
 * DELETE /api/competitions/:id
 * Мягкое удаление конкурса (только для модератора/админа)
 */
router.delete('/:id', auth, catchAsync(async (req, res) => {
    if (req.user.role !== 'Модератор' && req.user.role !== 'Админ') {
        return res.status(403).json({ error: 'Доступ запрещён' });
    }
    
    const { id } = req.params;
    
    const existing = await pool.query('SELECT id FROM competitions WHERE id = $1 AND is_deleted = false', [id]);
    if (existing.rows.length === 0) {
        return res.status(404).json({ error: 'Конкурс не найден' });
    }
    
    await pool.query('UPDATE competitions SET is_deleted = true WHERE id = $1', [id]);
    
    res.json({ message: 'Конкурс удалён' });
}));

/**
 * PATCH /api/competitions/:id/status
 * Изменяет статус конкурса (только для модератора/админа)
 */
router.patch('/:id/status', auth, catchAsync(async (req, res) => {
    if (req.user.role !== 'Модератор' && req.user.role !== 'Админ') {
        return res.status(403).json({ error: 'Доступ запрещён' });
    }
    
    const { id } = req.params;
    const { status } = req.body;
    
    const existing = await pool.query('SELECT id FROM competitions WHERE id = $1 AND is_deleted = false', [id]);
    if (existing.rows.length === 0) {
        return res.status(404).json({ error: 'Конкурс не найден' });
    }
    
    const allowedStatuses = ['open', 'closed', 'archived'];
    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ error: 'Недопустимый статус' });
    }
    
    await pool.query('UPDATE competitions SET status = $1 WHERE id = $2', [status, id]);
    
    res.json({ message: 'Статус конкурса обновлён', status });
}));

module.exports = router;