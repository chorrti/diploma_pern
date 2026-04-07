const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./db/pool');

const app = express();

const errorHandler = require('./middleware/errorHandler');

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

const catchAsync = require('./utils/catchAsync');

// ТЕСТ: маршрут без ошибки
app.get('/api/test-success', catchAsync(async (req, res) => {
    res.json({ message: 'Всё работает!' });
}));

// ТЕСТ: маршрут с ошибкой (должна уйти в errorHandler)
app.get('/api/test-error', catchAsync(async (req, res) => {
    throw new Error('Тестовая ошибка!');
}));

// ТЕСТОВЫЙ МАРШРУТ ДЛЯ ПРОВЕРКИ ЛОГГЕРА
app.get('/api/test-logger', (req, res, next) => {
    next(new Error('Тестовая ошибка для проверки логгера!'));
});

// Глобальный обработчик ошибок — ОБЯЗАТЕЛЬНО В КОНЦЕ!
app.use(errorHandler);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`
    🚀 Сервер запущен!
    📡 Порт: ${PORT}
    🌐 Адрес: http://localhost:${PORT}
    `);
});