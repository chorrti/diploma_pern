/**
 * СКРИПТ ДЛЯ РАЗОВОГО СОЗДАНИЯ АДМИНА И МОДЕРАТОРА
 * 
 * Запуск: node scripts/createAdminAndModerator.js / npm run create-admin
 * 
 * Что делает:
 * - Создаёт администратора (если его нет)
 * - Создаёт модератора (если его нет)
 * - При повторном запуске не создаёт дубликаты
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
    birth_date: '1985-03-15',
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
    birth_date: '1985-03-15',
    organization: 'Платформа'
};

/**
 * Создание пользователя и профиля
 */
async function createUserAndProfile(client, userData, roleName) {
    // 1. Получаем ID роли
    const roleResult = await client.query(
        'SELECT id FROM roles WHERE name = $1',
        [roleName]
    );
    
    if (roleResult.rows.length === 0) {
        throw new Error(`Роль "${roleName}" не найдена в БД`);
    }
    const roleId = roleResult.rows[0].id;
    
    // 2. Проверяем, существует ли уже пользователь с таким логином
    const existingUser = await client.query(
        'SELECT id FROM users WHERE login = $1',
        [userData.login]
    );
    
    if (existingUser.rows.length > 0) {
        console.log(`⚠️ Пользователь ${userData.login} уже существует. Пропускаем.`);
        return false;
    }
    
    // 3. Хешируем пароль
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    // 4. Создаём пользователя
    const userResult = await client.query(
        `INSERT INTO users (login, password_hash, is_active, created_at)
         VALUES ($1, $2, true, NOW())
         RETURNING id`,
        [userData.login, hashedPassword]
    );
    const userId = userResult.rows[0].id;
    
    // 5. Создаём профиль
    await client.query(
        `INSERT INTO profiles 
         (user_id, name, familia, otchestvo, role_id, email, phone, city, organization, is_deleted, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, false, NOW())`,
        [
            userId,
            userData.name,
            userData.familia,
            userData.otchestvo,
            roleId,
            userData.email,
            userData.phone,
            userData.city,
            userData.organization
        ]
    );
    
    return true;
}

async function createAdminAndModerator() {
    const client = await pool.connect();
    
    try {
        console.log('\n🔧 Создание администратора и модератора...\n');
        
        // Создаём админа
        const adminCreated = await createUserAndProfile(client, ADMIN_DATA, 'Админ');
        if (adminCreated) {
            console.log('✅ Админ создан!');
            console.log(`   Логин: ${ADMIN_DATA.login}`);
            console.log(`   Пароль: ${ADMIN_DATA.password}`);
        }
        
        // Создаём модератора
        const moderatorCreated = await createUserAndProfile(client, MODERATOR_DATA, 'Модератор');
        if (moderatorCreated) {
            console.log('✅ Модератор создан!');
            console.log(`   Логин: ${MODERATOR_DATA.login}`);
            console.log(`   Пароль: ${MODERATOR_DATA.password}`);
        }
        
        if (!adminCreated && !moderatorCreated) {
            console.log('\n📌 Пользователи уже существуют. Ничего не изменено.');
        } else {
            console.log('\n📋 СОХРАНИТЕ ЭТИ ДАННЫЕ:');
            if (adminCreated) {
                console.log(`   Админ: ${ADMIN_DATA.login} / ${ADMIN_DATA.password}`);
            }
            if (moderatorCreated) {
                console.log(`   Модератор: ${MODERATOR_DATA.login} / ${MODERATOR_DATA.password}`);
            }
        }
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