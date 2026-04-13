const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const pool = require('../db/pool');
const catchAsync = require('../utils/catchAsync');
const auth = require('../middleware/auth');
const { generateRandomLogin, generateRandomPassword, sendEmail } = require('../utils/helpers');

/**
 * POST /api/register/apply
 * Создание заявки на регистрацию
 * Если заявка с таким телефоном уже есть — обновляем её
 */
router.post('/apply', catchAsync(async (req, res) => {
    const { familia, name, otchestvo, email, role_id, birth_date, phone, city, organization } = req.body;
    
    // Проверяем обязательные поля
    if (!familia || !name || !email || !role_id || !birth_date || !phone) {
        return res.status(400).json({ error: 'Заполните все обязательные поля' });
    }
    
    // Проверяем, есть ли уже заявка с таким телефоном
    const existingRequest = await pool.query(`
        SELECT id FROM registration_requests WHERE phone = $1
    `, [phone]);
    
    if (existingRequest.rows.length > 0) {
        // Обновляем существующую заявку
        await pool.query(`
            UPDATE registration_requests 
            SET familia = $1, name = $2, otchestvo = $3, email = $4, 
                role_id = $5, birth_date = $6, city = $7, organization = $8,
                created_at = NOW()
            WHERE phone = $9
        `, [familia, name, otchestvo, email, role_id, birth_date, city, organization, phone]);
        
        return res.json({ message: 'Заявка обновлена' });
    }
    
    // Создаём новую заявку
    await pool.query(`
        INSERT INTO registration_requests (
            familia, name, otchestvo, email, role_id, 
            birth_date, phone, city, organization
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [familia, name, otchestvo, email, role_id, birth_date, phone, city, organization]);
    
    res.json({ message: 'Заявка отправлена' });
}));

/**
 * GET /api/register/all
 * Возвращает список всех заявок на регистрацию
 */
router.get('/all', auth, catchAsync(async (req, res) => {
    if (req.user.role !== 'Админ') {
        return res.status(403).json({ error: 'Доступ запрещён' });
    }
    
    const result = await pool.query(`
        SELECT 
            rr.id,
            rr.name,
            rr.familia,
            rr.otchestvo,
            rr.email,
            rr.role_id,
            rr.birth_date,
            rr.phone,
            rr.city,
            rr.organization,
            EXISTS(
                SELECT 1 FROM profiles p 
                WHERE p.phone = rr.phone
            ) as has_profile
        FROM registration_requests rr
        ORDER BY rr.id DESC
    `);
    
    res.json(result.rows);
}));

/**
 * POST /api/register/approve/:id
 * Одобрение заявки (с поддержкой восстановления удалённого профиля)
 */
router.post('/approve/:id', auth, catchAsync(async (req, res) => {
    
    if (req.user.role !== 'Админ') {
        return res.status(403).json({ error: 'Доступ запрещён' });
    }
    
    const { id } = req.params;
    const { role, login, password, editedData } = req.body;
    
    // 1. Получаем данные заявки
    const requestResult = await pool.query(`SELECT * FROM registration_requests WHERE id = $1`, [id]);
    
    if (requestResult.rows.length === 0) {
        return res.status(404).json({ error: 'Заявка не найдена' });
    }
    
    const request = requestResult.rows[0];
    
    // Подготовка данных с учётом редактирования (если есть)
    const finalName = editedData?.firstName || request.name;
    const finalFamilia = editedData?.lastName || request.familia;
    const finalOtchestvo = editedData?.middleName || request.otchestvo;
    const finalCity = editedData?.city || request.city;
    const finalOrganization = editedData?.organization || request.organization;
    
    // ============================================
    // 2. ПРОВЕРЯЕМ, ЕСТЬ ЛИ ПРОФИЛЬ С ТАКИМ ТЕЛЕФОНОМ (ВКЛЮЧАЯ УДАЛЁННЫЕ)
    // ============================================
    const existingProfile = await pool.query(`
        SELECT id, user_id, email, is_deleted 
        FROM profiles 
        WHERE phone = $1
        LIMIT 1
    `, [request.phone]);
    
    if (existingProfile.rows.length > 0) {
        const profile = existingProfile.rows[0];
        
        // Если профиль помечен как удалённый — восстанавливаем его
        if (profile.is_deleted) {
            // Восстанавливаем профиль и обновляем данные
            await pool.query(`
                UPDATE profiles 
                SET is_deleted = false, 
                    name = $1, 
                    familia = $2, 
                    otchestvo = $3, 
                    birth_date = $4, 
                    city = $5, 
                    organization = $6,
                    email = $7
                WHERE id = $8
            `, [
                finalName,
                finalFamilia,
                finalOtchestvo,
                request.birth_date,
                finalCity,
                finalOrganization,
                request.email,
                profile.id
            ]);
            
            // Если у профиля был аккаунт — активируем его и обновляем пароль
            if (profile.user_id) {
                const hashedPassword = await bcrypt.hash(password, 10);
                await pool.query(`
                    UPDATE users 
                    SET password_hash = $1, is_active = true 
                    WHERE id = $2
                `, [hashedPassword, profile.user_id]);
            } else {
                // Если аккаунта не было (ученик без аккаунта) — создаём
                const hashedPassword = await bcrypt.hash(password, 10);
                const userResult = await pool.query(`
                    INSERT INTO users (login, password_hash, is_active)
                    VALUES ($1, $2, true)
                    RETURNING id
                `, [login, hashedPassword]);
                await pool.query(`UPDATE profiles SET user_id = $1 WHERE id = $2`, [userResult.rows[0].id, profile.id]);
            }
            
            // Удаляем заявку
            await pool.query(`DELETE FROM registration_requests WHERE id = $1`, [id]);
            
            // Отправляем письмо
            sendEmail(request.email, 'Аккаунт восстановлен', 
                `Ваш аккаунт был восстановлен!\n\nЛогин: ${login}\nПароль: ${password}\n\nРекомендуем сменить пароль после входа.`
            );
            
            return res.json({ message: 'Аккаунт восстановлен' });
        } else {
            // Профиль существует и не удалён — ошибка
            return res.status(400).json({ error: 'Пользователь с таким номером телефона уже существует' });
        }
    }
    
    // ============================================
    // 3. ЕСЛИ ПРОФИЛЯ НЕТ — СОЗДАЁМ НОВОГО ПОЛЬЗОВАТЕЛЯ
    // ============================================
    
    const roleResult = await pool.query(`SELECT id FROM roles WHERE name = $1`, [role]);
    if (roleResult.rows.length === 0) {
        return res.status(400).json({ error: 'Роль не найдена' });
    }
    const roleId = roleResult.rows[0].id;
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const userResult = await pool.query(`
        INSERT INTO users (login, password_hash, is_active)
        VALUES ($1, $2, true)
        RETURNING id
    `, [login, hashedPassword]);
    const userId = userResult.rows[0].id;
    
    await pool.query(`
        INSERT INTO profiles (
            user_id, name, familia, otchestvo, role_id, 
            birth_date, phone, city, organization, email, is_deleted
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, false)
    `, [
        userId,
        finalName,
        finalFamilia,
        finalOtchestvo,
        roleId,
        request.birth_date,
        request.phone,
        finalCity,
        finalOrganization,
        request.email
    ]);
    
    await pool.query(`DELETE FROM registration_requests WHERE id = $1`, [id]);
    
    sendEmail(request.email, 'Регистрация подтверждена', 
        `Ваша заявка на платформе Портфель одобрена!\n\nЛогин: ${login}\nПароль: ${password}\n\nРекомендуем сменить пароль после входа.`
    );
    
    res.json({ message: 'Заявка одобрена' });
}));

/**
 * DELETE /api/register/reject/:id
 * Отклонение заявки
 */
router.delete('/reject/:id', auth, catchAsync(async (req, res) => {
    if (req.user.role !== 'Админ') {
        return res.status(403).json({ error: 'Доступ запрещён' });
    }
    
    const { id } = req.params;
    
    const requestResult = await pool.query(`SELECT email FROM registration_requests WHERE id = $1`, [id]);
    
    if (requestResult.rows.length > 0) {
        const email = requestResult.rows[0].email;
        sendEmail(email, 'Регистрация отклонена', 
            `К сожалению, ваша заявка на регистрацию на платформе Портфель была отклонена.\nЗа подробностями обратитесь к администратору или своему учителю.`
        );
    }
    
    await pool.query(`DELETE FROM registration_requests WHERE id = $1`, [id]);
    
    res.json({ message: 'Заявка отклонена' });
}));

/**
 * POST /api/register/generate-credentials
 * Генерация логина и пароля
 */
router.post('/generate-credentials', auth, catchAsync(async (req, res) => {
    if (req.user.role !== 'Админ') {
        return res.status(403).json({ error: 'Доступ запрещён' });
    }
    
    const login = generateRandomLogin();
    const password = generateRandomPassword();
    
    res.json({ login, password });
}));

module.exports = router;