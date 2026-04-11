// Конфигурация API в зависимости от окружения
const isDevelopment = import.meta.env.DEV; // Vite определяет dev-режим

// Для Vite (create-react-app использует REACT_APP_)
// Если у тебя Create React App, используй process.env.NODE_ENV
export const API_BASE_URL = isDevelopment 
    ? 'http://localhost:5000/api'
    : 'https://твой-сайт.onrender.com/api'; // Заменишь потом на реальный адрес

export const API_URL = API_BASE_URL;