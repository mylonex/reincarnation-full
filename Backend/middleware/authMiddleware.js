// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const pool = require('../db'); // Убедитесь, что db.js существует и экспортирует pool

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'Требуется авторизация' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Неверный токен' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;

        // Получаем данные пользователя, включая роль
        const userResult = await pool.query('SELECT id, role FROM users WHERE id = $1', [req.userId]);
        const user = userResult.rows[0];

        if (!user) {
            return res.status(401).json({ message: 'Пользователь не найден' });
        }

        req.user = user; // Присваиваем объект пользователя к запросу
        next();
    } catch (err) {
        console.error('Ошибка аутентификации:', err);
        return res.status(401).json({ message: 'Неверный или истекший токен' });
    }
};

module.exports = authMiddleware;