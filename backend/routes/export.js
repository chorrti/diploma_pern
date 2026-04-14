const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const catchAsync = require('../utils/catchAsync');
const auth = require('../middleware/auth');
const ExcelJS = require('exceljs');
const getFileUrl = require('../utils/fileUrl');
const fs = require('fs');
const path = require('path');

// Функция для получения размеров изображения
function getImageSize(filePath) {
    try {
        const buffer = fs.readFileSync(filePath);
        if (buffer[0] === 0xFF && buffer[1] === 0xD8) {
            let i = 2;
            while (i < buffer.length) {
                if (buffer[i] === 0xFF && buffer[i+1] >= 0xC0 && buffer[i+1] <= 0xC3) {
                    const height = (buffer[i+5] << 8) + buffer[i+6];
                    const width = (buffer[i+7] << 8) + buffer[i+8];
                    return { width, height };
                }
                i++;
            }
        } else if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
            const width = (buffer[16] << 24) + (buffer[17] << 16) + (buffer[18] << 8) + buffer[19];
            const height = (buffer[20] << 24) + (buffer[21] << 16) + (buffer[22] << 8) + buffer[23];
            return { width, height };
        }
    } catch (e) {}
    return { width: 500, height: 500 };
}

router.get('/competition/:competitionId', auth, catchAsync(async (req, res) => {
    const { competitionId } = req.params;
    
    if (req.user.role !== 'Модератор') {
        return res.status(403).json({ error: 'Доступ запрещён' });
    }
    
    const competition = await pool.query('SELECT name FROM competitions WHERE id = $1', [competitionId]);
    if (competition.rows.length === 0) {
        return res.status(404).json({ error: 'Конкурс не найден' });
    }
    
    const result = await pool.query(`
        SELECT 
            p.familia,
            p.name,
            p.otchestvo,
            p.organization,
            p.city,
            teacher.familia as teacher_familia,
            teacher.name as teacher_name,
            teacher.otchestvo as teacher_otchestvo,
            teacher.phone as teacher_phone,
            teacher.email as teacher_email,
            ca.title as work_title,
            ca.description as work_description,
            file_att.content as file_url,
            link_att.content as link_url
        FROM competition_applications ca
        JOIN profiles p ON p.id = ca.student_id
        LEFT JOIN profiles teacher ON teacher.id = ca.teacher_id
        LEFT JOIN application_attachments file_att ON file_att.application_id = ca.id AND file_att.type = 'file'
        LEFT JOIN application_attachments link_att ON link_att.application_id = ca.id AND link_att.type = 'link'
        WHERE ca.competition_id = $1
        ORDER BY p.familia, p.name
    `, [competitionId]);
    
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Заявки');
    
    worksheet.columns = [
        { header: 'ФИО ученика', key: 'fullName', width: 35 },
        { header: 'Организация', key: 'organization', width: 45 },
        { header: 'Город', key: 'city', width: 25 },
        { header: 'ФИО руководителя', key: 'teacherName', width: 35 },
        { header: 'Номер руководителя', key: 'teacherPhone', width: 20 },
        { header: 'Email руководителя', key: 'teacherEmail', width: 35 },
        { header: 'Название работы', key: 'workTitle', width: 45 },
        { header: 'Описание работы', key: 'workDescription', width: 60 },
        { header: 'Ссылка на файл', key: 'linkUrl', width: 50 },
        { header: 'Изображение', key: 'image', width: 55 },
        { header: 'Оценка', key: 'grade', width: 15 }
    ];
    
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).alignment = { horizontal: 'center', vertical: 'middle' };
    
    let currentRow = 2;
    
    for (const row of result.rows) {
        const fullName = `${row.familia} ${row.name} ${row.otchestvo || ''}`.trim();
        const teacherFullName = row.teacher_familia 
            ? `${row.teacher_familia} ${row.teacher_name || ''} ${row.teacher_otchestvo || ''}`.trim()
            : '';
        
        worksheet.addRow({
            fullName: fullName,
            organization: row.organization || '',
            city: row.city || '',
            teacherName: teacherFullName,
            teacherPhone: row.teacher_phone || '',
            teacherEmail: row.teacher_email || '',
            workTitle: row.work_title,
            workDescription: row.work_description || '',
            linkUrl: row.link_url || '',
            image: '',
            grade: ''
        });
        
        worksheet.getRow(currentRow).height = 400;
        
        if (row.file_url) {
            const filePath = path.join(__dirname, '..', row.file_url);
            if (fs.existsSync(filePath)) {
                try {
                    const { width: imgWidth, height: imgHeight } = getImageSize(filePath);
                    
                    let finalWidth = 450;
                    let finalHeight = 450;
                    
                    if (imgWidth > imgHeight) {
                        finalHeight = Math.round(450 * (imgHeight / imgWidth));
                    } else {
                        finalWidth = Math.round(450 * (imgWidth / imgHeight));
                    }
                    
                    const ext = path.extname(filePath).toLowerCase();
                    let extension = 'jpeg';
                    if (ext === '.png') extension = 'png';
                    if (ext === '.jpg' || ext === '.jpeg') extension = 'jpeg';
                    
                    const imageId = workbook.addImage({
                        filename: filePath,
                        extension: extension
                    });
                    
                    worksheet.addImage(imageId, {
                        tl: { col: 9, row: currentRow - 1 },
                        ext: { width: finalWidth, height: finalHeight },
                        editAs: 'oneCell'
                    });
                } catch (err) {
                    console.error('Ошибка вставки изображения:', err);
                }
            }
        }
        
        currentRow++;
    }
    
    // Временный файл
    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
    const tempFilePath = path.join(tempDir, `${Date.now()}.xlsx`);
    await workbook.xlsx.writeFile(tempFilePath);
    
    // Отправляем с простым именем (фронт переименует)
    res.download(tempFilePath, 'export.xlsx', (err) => {
        if (err) console.error(err);
        fs.unlinkSync(tempFilePath);
    });
}));

module.exports = router;