const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const pool = require('./db/pool');

const app = express();

const errorHandler = require('./middleware/errorHandler');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// РАЗДАЧА СТАТИЧЕСКИХ ФАЙЛОВ (ДОБАВЬ ЭТО)
// Теперь файлы из папки uploads будут доступны по URL /uploads/...
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Подключаем роуты
const thematicsRoutes = require('./routes/thematics');
const competitionsRoutes = require('./routes/competitions');
const exhibitionRoutes = require('./routes/exhibition');
const catchAsync = require('./utils/catchAsync');


// РОУТЫ
app.use('/api/thematics', thematicsRoutes);
app.use('/api/competitions', competitionsRoutes);



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