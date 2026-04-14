/**
 * СКРИПТ ДЛЯ СОЗДАНИЯ/ОБНОВЛЕНИЯ АДМИНА И МОДЕРАТОРА
 * 
 * Запуск: node scripts/createAdminAndModerator.js / npm run create-admin
 * 
 * Что делает:
 * - Создаёт администратора (если нет) или обновляет данные (если есть)
 * - Создаёт модератора (если нет) или обновляет данные (если есть)
 * - При повторном запуске обновляет пароль и данные профиля
 */

const bcrypt = require('bcrypt');
const pool = require('../db/pool');

// Данные для админа
const ADMIN_DATA = {
    login: 'admin@example.com',
    password: 'Admin123!',
    name: 'Администратор',
    familia: 'Системный',
    otchestvo: '',
    email: 'admin@example.com',
    phone: '+7 (000) 000-00-00',
    city: 'Москва',
    birth_date: '2000-05-10',
    organization: 'Платформа'
};

// Данные для модератора
const MODERATOR_DATA = {
    login: 'moderator@example.com',
    password: 'Moder123!',
    name: 'Модератор',
    familia: 'Системный',
    otchestvo: '',
    email: 'moderator@example.com',
    phone: '+7 (000) 000-00-01',
    city: 'Москва',
    birth_date: '2000-05-10',
    organization: 'Платформа'
};

/**
 * Создание или обновление пользователя и профиля
 */
async function createOrUpdateUserAndProfile(client, userData, roleName) {
    // 1. Получаем ID роли
    const roleResult = await client.query(
        'SELECT id FROM roles WHERE name = $1',
        [roleName]
    );
    
    if (roleResult.rows.length === 0) {
        throw new Error(`Роль "${roleName}" не найдена в БД`);
    }
    const roleId = roleResult.rows[0].id;
    
    // 2. Хешируем пароль
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    // 3. Проверяем, существует ли уже пользователь с таким логином
    const existingUser = await client.query(
        'SELECT id FROM users WHERE login = $1',
        [userData.login]
    );
    
    if (existingUser.rows.length > 0) {
        // Пользователь существует — обновляем
        const userId = existingUser.rows[0].id;
        
        // Обновляем пароль
        await client.query(
            `UPDATE users SET password_hash = $1, is_active = true WHERE id = $2`,
            [hashedPassword, userId]
        );
        
        // Проверяем, существует ли профиль
        const existingProfile = await client.query(
            'SELECT id FROM profiles WHERE user_id = $1',
            [userId]
        );
        
        if (existingProfile.rows.length > 0) {
            // Обновляем профиль
            await client.query(
                `UPDATE profiles 
                 SET name = $1, familia = $2, otchestvo = $3, role_id = $4, 
                     email = $5, phone = $6, city = $7, birth_date = $8, 
                     organization = $9, is_deleted = false
                 WHERE user_id = $10`,
                [
                    userData.name,
                    userData.familia,
                    userData.otchestvo,
                    roleId,
                    userData.email,
                    userData.phone,
                    userData.city,
                    userData.birth_date,
                    userData.organization,
                    userId
                ]
            );
        } else {
            // Создаём профиль, если его нет
            await client.query(
                `INSERT INTO profiles 
                 (user_id, name, familia, otchestvo, role_id, email, phone, city, birth_date, organization, is_deleted, created_at)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, false, NOW())`,
                [
                    userId,
                    userData.name,
                    userData.familia,
                    userData.otchestvo,
                    roleId,
                    userData.email,
                    userData.phone,
                    userData.city,
                    userData.birth_date,
                    userData.organization
                ]
            );
        }
        
        console.log(`🔄 Обновлён пользователь: ${userData.login} (${roleName})`);
        return true;
    } else {
        // Пользователь не существует — создаём нового
        const userResult = await client.query(
            `INSERT INTO users (login, password_hash, is_active, created_at)
             VALUES ($1, $2, true, NOW())
             RETURNING id`,
            [userData.login, hashedPassword]
        );
        const userId = userResult.rows[0].id;
        
        // Создаём профиль
        await client.query(
            `INSERT INTO profiles 
             (user_id, name, familia, otchestvo, role_id, email, phone, city, birth_date, organization, is_deleted, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, false, NOW())`,
            [
                userId,
                userData.name,
                userData.familia,
                userData.otchestvo,
                roleId,
                userData.email,
                userData.phone,
                userData.city,
                userData.birth_date,
                userData.organization
            ]
        );
        
        console.log(`✅ Создан новый пользователь: ${userData.login} (${roleName})`);
        return true;
    }
}

async function createAdminAndModerator() {
    const client = await pool.connect();
    
    try {
        console.log('\n🔧 Создание/обновление администратора и модератора...\n');
        
        // Создаём или обновляем админа
        await createOrUpdateUserAndProfile(client, ADMIN_DATA, 'Админ');
        
        // Создаём или обновляем модератора
        await createOrUpdateUserAndProfile(client, MODERATOR_DATA, 'Модератор');
        
        console.log('\n📋 ТЕКУЩИЕ ДАННЫЕ:');
        console.log(`   Админ: ${ADMIN_DATA.login} / ${ADMIN_DATA.password}`);
        console.log(`   Модератор: ${MODERATOR_DATA.login} / ${MODERATOR_DATA.password}`);
        console.log();
        
    } catch (error) {
        console.error('\n❌ ОШИБКА:', error.message);
        console.error(error.stack);
    } finally {
        client.release();
        await pool.end();
    }
}

// Запуск скрипта
createAdminAndModerator();