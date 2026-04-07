const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./db/pool');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ПРОСТЕЙШИЙ ТЕСТОВЫЙ МАРШРУТ
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Сервер работает!' });
});

// ТЕСТОВЫЙ МАРШРУТ ДЛЯ ПРОВЕРКИ БД
app.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW() as time');
        res.json({ success: true, time: result.rows[0].time });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`
    🚀 Сервер запущен!
    📡 Порт: ${PORT}
    🌐 Адрес: http://localhost:${PORT}
    `);
});