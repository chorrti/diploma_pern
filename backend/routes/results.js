const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const catchAsync = require('../utils/catchAsync');
const auth = require('../middleware/auth');
const getFileUrl = require('../utils/fileUrl');

// GET /api/results/competition/:competitionId
router.get('/competition/:competitionId', catchAsync(async (req, res) => {
    const { competitionId } = req.params;
    
    const result = await pool.query(`
        SELECT 
            r.id,
            p.familia || ' ' || p.name || ' ' || p.otchestvo as "fullName",
            d.name as degree,
            r.diploma_path as "diplomaPath"
        FROM results r
        JOIN profiles p ON p.id = r.student_id
        JOIN degrees d ON d.id = r.degree_id
        WHERE r.competition_id = $1
        ORDER BY d.id ASC
    `, [competitionId]);
    
    const rows = result.rows.map(row => ({
        id: row.id,
        fullName: row.fullName,
        degree: row.degree,
        diplomaLink: getFileUrl(row.diplomaPath)
    }));
    
    res.json(rows);
}));

/**
 * GET /api/results/my
 * Возвращает список дипломов текущего авторизованного пользователя
 */
router.get('/my', auth, catchAsync(async (req, res) => {
    const profileId = req.user.profileId;
    
    const result = await pool.query(`
        SELECT 
            r.id as result_id,
            r.diploma_path,
            d.name as degree_name,
            c.id as contest_id,
            c.name as contest_name,
            c.description as contest_description,
            c.start_date,
            c.end_date,
            c.results_date,
            ca.title as work_title
        FROM results r
        JOIN competitions c ON c.id = r.competition_id
        JOIN degrees d ON d.id = r.degree_id
        JOIN competition_applications ca ON ca.student_id = r.student_id AND ca.competition_id = r.competition_id
        WHERE r.student_id = $1
        ORDER BY c.results_date DESC
    `, [profileId]);
    
    const diplomas = result.rows.map(row => ({
        id: row.result_id,
        diplomaUrl: getFileUrl(row.diploma_path),
        degree: row.degree_name,
        workTitle: row.work_title,
        contest: {
            id: row.contest_id,
            name: row.contest_name,
            description: row.contest_description,
            startDate: row.start_date ? new Date(row.start_date).toLocaleDateString('ru-RU') : '',
            endDate: row.end_date ? new Date(row.end_date).toLocaleDateString('ru-RU') : '',
            resultsDate: row.results_date ? new Date(row.results_date).toLocaleDateString('ru-RU') : ''
        }
    }));
    
    res.json(diplomas);
}));

/**
 * GET /api/results/my/zip
 * Скачивает архив со всеми дипломами текущего пользователя
 */
router.get('/my/zip', auth, catchAsync(async (req, res) => {
    const profileId = req.user.profileId;
    
    // Получаем все дипломы
    const result = await pool.query(`
        SELECT 
            r.diploma_path,
            d.name as degree_name,
            c.name as contest_name
        FROM results r
        JOIN competitions c ON c.id = r.competition_id
        JOIN degrees d ON d.id = r.degree_id
        WHERE r.student_id = $1
    `, [profileId]);
    
    if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Нет дипломов для скачивания' });
    }
    
    const archiver = require('archiver');
    const fs = require('fs');
    const path = require('path');
    
    // Создаём архив
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    // Устанавливаем заголовки для скачивания
    res.attachment(`diplomas_${Date.now()}.zip`);
    archive.pipe(res);
    
    // Добавляем каждый диплом в архив
    for (const row of result.rows) {
        const filePath = path.join(__dirname, '..', row.diploma_path);
        if (fs.existsSync(filePath)) {
            const fileName = `${row.contest_name} - ${row.degree_name}.pdf`;
            archive.file(filePath, { name: fileName });
        }
    }
    
    await archive.finalize();
}));

module.exports = router;