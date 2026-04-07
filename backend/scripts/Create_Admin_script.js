// backend/scripts/createSuperAdmin.js
const bcrypt = require('bcrypt');
const pool = require('../db/pool');

async function createSuperAdmin() {
    const client = await pool.connect();
    
    try {
        // ID роли "Админ"
        const role = await client.query("SELECT id FROM roles WHERE name = 'Админ'");
        
        // Хеш пароля (Admin123!)
        const hash = await bcrypt.hash('Admin123!', 10);
        
        // Создаём пользователя
        const user = await client.query(
            `INSERT INTO users (login, password_hash, is_active) 
             VALUES ('admin@example.com', $1, true) RETURNING id`,
            [hash]
        );
        
        // Создаём профиль
        await client.query(
            `INSERT INTO profiles (user_id, name, familia, role_id, email, is_deleted)
             VALUES ($1, 'Администратор', 'Системный', $2, 'admin@example.com', false)`,
            [user.rows[0].id, role.rows[0].id]
        );
        
        console.log('\n✅ Админ создан!');
        console.log('Логин: admin@example.com');
        console.log('Пароль: Admin123!\n');
        
    } catch (err) {
        console.error('Ошибка:', err.message);
    } finally {
        client.release();
        await pool.end();
    }
}

createSuperAdmin();