import axios from 'axios';

// Создаём экземпляр axios с базовыми настройками
const api = axios.create({
    baseURL: 'http://localhost:5000/api', // URL твоего бэкенда
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 секунд таймаут
});

// Перехватчик ошибок (опционально, но полезно)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export default api;