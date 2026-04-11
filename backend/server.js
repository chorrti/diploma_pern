const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const pool = require('./db/pool');

const app = express();

const errorHandler = require('./middleware/errorHandler');

// Базовый URL для формирования ссылок на файлы
const BASE_URL = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
console.log(`📍 Базовый URL: ${BASE_URL}`);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Раздача статических файлов
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Делаем BASE_URL доступным в роутах через res.locals
app.use((req, res, next) => {
    res.locals.baseUrl = BASE_URL;
    next();
});

// Подключаем роуты
const thematicsRoutes = require('./routes/thematics');
const competitionsRoutes = require('./routes/competitions');
const exhibitionRoutes = require('./routes/exhibition');
const resultsRoutes = require('./routes/results');
const searchRoutes = require('./routes/search');
const authRoutes = require('./routes/auth');
const profilesRoutes = require('./routes/profiles');
const registrationRoutes = require('./routes/registration');
const adminRoutes = require('./routes/admin');
const applicationsRoutes = require('./routes/applications');

// РОУТЫ
app.use('/api/thematics', thematicsRoutes);
app.use('/api/competitions', competitionsRoutes);
app.use('/api/exhibition', exhibitionRoutes);
app.use('/api/results', resultsRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/profiles', profilesRoutes);
app.use('/api/register', registrationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/applications', applicationsRoutes);

// Глобальный обработчик ошибок — в конце!
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`
    🚀 Сервер запущен!
    📡 Порт: ${PORT}
    🌐 Адрес: http://localhost:${PORT}
    🔗 BASE_URL: ${BASE_URL}
    `);
});