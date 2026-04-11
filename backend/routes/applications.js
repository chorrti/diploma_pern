const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const catchAsync = require('../utils/catchAsync');
const auth = require('../middleware/auth');
const getFileUrl = require('../utils/fileUrl');

/**
 * GET /api/applications/my
 * Возвращает список заявок текущего ученика
 */
router.get('/my', auth, catchAsync(async (req, res) => {
    const profileId = req.user.profileId;
    
    const result = await pool.query(`
        SELECT 
            ca.id as application_id,
            ca.title,
            ca.description,
            ca.submitted_at,
            c.id as contest_id,
            c.name as contest_name,
            c.description as contest_description,
            c.start_date,
            c.end_date,
            c.results_date,
            c.status as contest_status,
            EXISTS(
                SELECT 1 FROM results r 
                WHERE r.student_id = ca.student_id 
                AND r.competition_id = ca.competition_id
            ) as has_diploma
        FROM competition_applications ca
        JOIN competitions c ON c.id = ca.competition_id
        WHERE ca.student_id = $1
        ORDER BY ca.submitted_at DESC
    `, [profileId]);
    
    const applications = result.rows.map(app => ({
        id: app.application_id,
        title: app.title,
        description: app.description,
        submittedAt: app.submitted_at,
        contest: {
            id: app.contest_id,
            name: app.contest_name,
            description: app.contest_description,
            startDate: app.start_date ? new Date(app.start_date).toLocaleDateString('ru-RU') : '',
            endDate: app.end_date ? new Date(app.end_date).toLocaleDateString('ru-RU') : '',
            resultsDate: app.results_date ? new Date(app.results_date).toLocaleDateString('ru-RU') : '',
            status: app.contest_status
        },
        hasDiploma: app.has_diploma
    }));
    
    res.json(applications);
}));

/**
 * GET /api/results/my
 * Возвращает список дипломов текущего ученика
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
 * GET /api/applications/:id
 * Возвращает детали заявки для модального окна
 */
router.get('/:id', auth, catchAsync(async (req, res) => {
    const { id } = req.params;
    const profileId = req.user.profileId;
    
    const result = await pool.query(`
        SELECT 
            ca.id,
            ca.title as work_title,
            ca.description as work_description,
            ca.agreed_for_exhib,
            ca.submitted_at,
            p.familia,
            p.name,
            p.otchestvo,
            p.organization,
            p.city,
            p.phone,
            p.email,
            teacher.familia as teacher_familia,
            teacher.name as teacher_name,
            teacher.otchestvo as teacher_otchestvo,
            file_att.content as file_url,
            link_att.content as link_url
        FROM competition_applications ca
        JOIN profiles p ON p.id = ca.student_id
        LEFT JOIN teacher_student ts ON ts.student_id = ca.student_id
        LEFT JOIN profiles teacher ON teacher.id = ts.teacher_id
        LEFT JOIN application_attachments file_att ON file_att.application_id = ca.id AND file_att.type = 'file'
        LEFT JOIN application_attachments link_att ON link_att.application_id = ca.id AND link_att.type = 'link'
        WHERE ca.id = $1 AND ca.student_id = $2
    `, [id, profileId]);
    
    if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Заявка не найдена' });
    }
    
    const row = result.rows[0];
    
    let teacherFullName = null;
    if (row.teacher_familia) {
        teacherFullName = `${row.teacher_familia} ${row.teacher_name || ''} ${row.teacher_otchestvo || ''}`.trim();
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
            title: row.work_title,
            description: row.work_description,
            imageUrl: getFileUrl(row.file_url),
            linkUrl: row.link_url,
            agreedForExhibition: row.agreed_for_exhib
        },
        submittedAt: row.submitted_at
    });
}));

module.exports = router;