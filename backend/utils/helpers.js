const nodemailer = require('nodemailer');

// Генерация случайного логина (8 символов)
const generateRandomLogin = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let login = '';
    for (let i = 0; i < 8; i++) {
        login += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return login;
};

// Генерация случайного пароля (8 символов)
const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
};

// Настройка транспортера для писем
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Отправка письма (асинхронная — не ждём ответа)
const sendEmail = async (to, subject, text) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        return;
    }
    
    transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        text
    }).catch(error => {
        // Ошибка без вывода в консоль
    });
};

module.exports = { generateRandomLogin, generateRandomPassword, sendEmail };