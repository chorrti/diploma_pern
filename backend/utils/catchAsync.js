/**
 * catchAsync - обёртка для асинхронных Express-маршрутов
 * 
 * Что делает:
 * - Принимает асинхронную функцию (async (req, res) => {...})
 * - Возвращает новую функцию, которая:
 *   1. Выполняет переданную функцию
 *   2. Если возникает ошибка — автоматически передаёт её в next()
 * 
 * Зачем: избавляет от необходимости писать try/catch в каждом маршруте
 * 
 * Пример использования:
 *   app.get('/api/users', catchAsync(async (req, res) => {
 *       const users = await User.find();
 *       res.json(users);
 *   }));
 */

const catchAsync = (fn) => {
    // Возвращаем функцию, которую Express сможет вызвать
    return (req, res, next) => {
        // Выполняем переданную функцию
        // .catch(next) — если ошибка, передаём её в Express (в errorHandler)
        fn(req, res, next).catch(next);
    };
};

module.exports = catchAsync;