const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const catchAsync = require('../utils/catchAsync');
const auth = require('../middleware/auth');
const getFileUrl = require('../utils/fileUrl');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Настройка multer для загрузки дипломов
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/diplomas/';
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

const upload = multer({ 
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Только PDF файлы'));
        }
    }
});

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
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    res.attachment(`diplomas_${Date.now()}.zip`);
    archive.pipe(res);
    
    for (const row of result.rows) {
        const filePath = path.join(__dirname, '..', row.diploma_path);
        if (fs.existsSync(filePath)) {
            const fileName = `${row.contest_name} - ${row.degree_name}.pdf`;
            archive.file(filePath, { name: fileName });
        }
    }
    
    await archive.finalize();
}));

/**
 * GET /api/results/student/:studentId
 * Возвращает список дипломов ученика (для учителя)
 */
router.get('/student/:studentId', auth, catchAsync(async (req, res) => {
    const { studentId } = req.params;
    const teacherId = req.user.profileId;
    
    const accessCheck = await pool.query(`
        SELECT 1 FROM teacher_student 
        WHERE teacher_id = $1 AND student_id = $2
    `, [teacherId, studentId]);
    
    if (accessCheck.rows.length === 0 && req.user.role !== 'Админ') {
        return res.status(403).json({ error: 'Доступ запрещён' });
    }
    
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
    `, [studentId]);
    
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
 * GET /api/results/student/:studentId/zip
 * Скачивает архив со всеми дипломами ученика (для учителя)
 */
router.get('/student/:studentId/zip', auth, catchAsync(async (req, res) => {
    const { studentId } = req.params;
    const teacherId = req.user.profileId;
    
    const accessCheck = await pool.query(`
        SELECT 1 FROM teacher_student 
        WHERE teacher_id = $1 AND student_id = $2
    `, [teacherId, studentId]);
    
    if (accessCheck.rows.length === 0 && req.user.role !== 'Админ') {
        return res.status(403).json({ error: 'Доступ запрещён' });
    }
    
    const result = await pool.query(`
        SELECT 
            r.diploma_path,
            d.name as degree_name,
            c.name as contest_name
        FROM results r
        JOIN competitions c ON c.id = r.competition_id
        JOIN degrees d ON d.id = r.degree_id
        WHERE r.student_id = $1
    `, [studentId]);
    
    if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Нет дипломов для скачивания' });
    }
    
    const archiver = require('archiver');
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    const studentResult = await pool.query(`
        SELECT familia, name FROM profiles WHERE id = $1
    `, [studentId]);
    const studentName = studentResult.rows[0] 
        ? `${studentResult.rows[0].familia}_${studentResult.rows[0].name}` 
        : 'student';
    
    res.attachment(`diplomas_${studentName}_${Date.now()}.zip`);
    archive.pipe(res);
    
    for (const row of result.rows) {
        const filePath = path.join(__dirname, '..', row.diploma_path);
        if (fs.existsSync(filePath)) {
            const fileName = `${row.contest_name} - ${row.degree_name}.pdf`;
            archive.file(filePath, { name: fileName });
        }
    }
    
    await archive.finalize();
}));

/**
 * POST /api/results/competition/:competitionId
 * Публикует результаты конкурса (дипломы)
 */
router.post('/competition/:competitionId', auth, upload.array('diplomas'), catchAsync(async (req, res) => {
    if (req.user.role !== 'Модератор' && req.user.role !== 'Админ') {
        return res.status(403).json({ error: 'Доступ запрещён' });
    }
    
    const { competitionId } = req.params;
    const { results } = req.body;
    const files = req.files || [];
    
    const parsedResults = JSON.parse(results);
    
    const competitionCheck = await pool.query('SELECT id FROM competitions WHERE id = $1', [competitionId]);
    if (competitionCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Конкурс не найден' });
    }
    
    for (let i = 0; i < parsedResults.length; i++) {
        const result = parsedResults[i];
        const file = files[i];
        
        if (!file) continue;
        
        const filePath = `/uploads/diplomas/${file.filename}`;
        
        // Получаем данные заявки по applicationId (это id из competition_applications)
        const application = await pool.query(`
            SELECT student_id, teacher_id 
            FROM competition_applications 
            WHERE id = $1 AND competition_id = $2
        `, [result.applicationId, competitionId]);
        
        if (application.rows.length === 0) continue;
        
        const { student_id, teacher_id } = application.rows[0];
        
        // Получаем thematic_id из конкурса
        const thematicResult = await pool.query(`
            SELECT thematic_id FROM competitions WHERE id = $1
        `, [competitionId]);
        const thematic_id = thematicResult.rows[0]?.thematic_id || null;
        
        // Проверяем, нет ли уже диплома у этого ученика на этот конкурс
        const existingResult = await pool.query(`
            SELECT id FROM results 
            WHERE competition_id = $1 AND student_id = $2
        `, [competitionId, student_id]);
        
        if (existingResult.rows.length > 0) {
            // Обновляем существующий диплом
            await pool.query(`
                UPDATE results 
                SET diploma_path = $1, degree_id = $2
                WHERE competition_id = $3 AND student_id = $4
            `, [filePath, result.degreeId, competitionId, student_id]);
        } else {
            // Создаём новый диплом
            await pool.query(`
                INSERT INTO results (
                    competition_id, student_id, teacher_id, thematic_id, 
                    diploma_path, degree_id
                ) VALUES ($1, $2, $3, $4, $5, $6)
            `, [competitionId, student_id, teacher_id, thematic_id, filePath, result.degreeId]);
        }
    }
    
    // Меняем статус конкурса на 'archived'
    await pool.query('UPDATE competitions SET status = $1 WHERE id = $2', ['archived', competitionId]);
    
    res.json({ message: 'Результаты успешно опубликованы' });
}));

module.exports = router;