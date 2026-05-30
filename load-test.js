import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';

// Пользовательские метрики для красивого отчёта
const responseTime = new Trend('response_time');
const errorRate = new Rate('errors');
const requestsTotal = new Counter('requests_total');

// Конфигурация теста
export const options = {
    stages: [
        { duration: '30s', target: 10 },   // разогрев до 10 пользователей
        { duration: '1m', target: 30 },    // подъём до 30 пользователей
        { duration: '1m', target: 50 },    // подъём до 50 пользователей
        { duration: '1m', target: 100 },    // подъём до 80 пользователей
        { duration: '30s', target: 0 },    // спад до 0
    ],
    thresholds: {
        'response_time': ['p(95)<500'],    // 95% запросов быстрее 500 мс
        'errors': ['rate<0.01'],           // менее 1% ошибок
        'http_req_failed': ['rate<0.01'],
    },
    // Настройка вывода результатов в JSON
    summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(90)', 'p(95)', 'p(99)'],
};

const BASE_URL = 'http://localhost:5000/api';

// Данные для тестового пользователя
const TEST_USER = {
    login: '4jdJfsb9',
    password: 'k8BShTSU'
};

// Глобальная переменная для токена
let authToken = null;

export default function () {
    // 1. Получение списка конкурсов (GET)
    let contestsRes = http.get(`${BASE_URL}/competitions`);
    check(contestsRes, {
        'GET /competitions status is 200': (r) => r.status === 200,
    });
    responseTime.add(contestsRes.timings.duration);
    requestsTotal.add(1);
    if (contestsRes.status !== 200) errorRate.add(1);

    sleep(0.5);

    // 2. Получение тематик (GET)
    let thematicsRes = http.get(`${BASE_URL}/thematics`);
    check(thematicsRes, {
        'GET /thematics status is 200': (r) => r.status === 200,
    });
    responseTime.add(thematicsRes.timings.duration);
    requestsTotal.add(1);
    if (thematicsRes.status !== 200) errorRate.add(1);

    sleep(0.5);

    // 3. Логин (POST) — только если ещё нет токена в этой итерации
    if (!authToken) {
        let loginPayload = JSON.stringify({
            login: TEST_USER.login,
            password: TEST_USER.password
        });
        
        let loginRes = http.post(`${BASE_URL}/auth/login`, loginPayload, {
            headers: { 'Content-Type': 'application/json' },
        });
        
        check(loginRes, {
            'POST /auth/login status is 200': (r) => r.status === 200,
        });
        
        if (loginRes.status === 200) {
            const body = JSON.parse(loginRes.body);
            authToken = body.token;
        }
        responseTime.add(loginRes.timings.duration);
        requestsTotal.add(1);
        if (loginRes.status !== 200) errorRate.add(1);
        
        sleep(0.5);
    }

    // 4. Получение профиля (GET с токеном)
    if (authToken) {
        let profileRes = http.get(`${BASE_URL}/profiles/me`, {
            headers: { 'Authorization': `Bearer ${authToken}` },
        });
        check(profileRes, {
            'GET /profiles/me status is 200': (r) => r.status === 200,
        });
        responseTime.add(profileRes.timings.duration);
        requestsTotal.add(1);
        if (profileRes.status !== 200) errorRate.add(1);
        
        sleep(0.5);
    }

    // 5. Получение выставки (GET)
    let exhibitionRes = http.get(`${BASE_URL}/exhibition`);
    check(exhibitionRes, {
        'GET /exhibition status is 200': (r) => r.status === 200,
    });
    responseTime.add(exhibitionRes.timings.duration);
    requestsTotal.add(1);
    if (exhibitionRes.status !== 200) errorRate.add(1);

    sleep(1);
}

// Функция, которая выполняется после завершения теста
export function handleSummary(data) {
    console.log('=== РЕЗУЛЬТАТЫ НАГРУЗОЧНОГО ТЕСТИРОВАНИЯ ===');
    console.log(`Всего запросов: ${data.metrics.requests_total?.values?.count || 0}`);
    console.log(`Ошибок: ${data.metrics.errors?.values?.rate || 0 * 100}%`);
    console.log(`Среднее время ответа: ${data.metrics.response_time?.values?.avg?.toFixed(2) || 0} мс`);
    console.log(`95-й перцентиль: ${data.metrics.response_time?.values?.['p(95)']?.toFixed(2) || 0} мс`);
    
    return {
        'results.json': JSON.stringify(data, null, 2),
    };
}