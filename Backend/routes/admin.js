// routes/admin.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const jwt = require('jsonwebtoken');

const authMiddleware = require('../middleware/authMiddleware');

const adminMiddleware = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Доступ запрещен. Требуются права администратора.' });
    }
};

router.get('/applications', authMiddleware, async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM applications WHERE status = 'pending'");
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

router.post('/approve/:id', authMiddleware, adminMiddleware, async (req, res) => {
    const { id } = req.params;

    try {
        const app = await pool.query('SELECT * FROM applications WHERE id = $1', [id]);
        if (!app.rows[0]) return res.status(404).json({ message: 'Заявка не найдена' });

        const { nickname, name, email, password } = app.rows[0];

        await pool.query(
            'INSERT INTO users (nickname, name, email, password, role) VALUES ($1, $2, $3, $4, $5)',
            [nickname, name, email, password, 'user']
        );

        await pool.query("UPDATE applications SET status = 'approved' WHERE id = $1", [id]);

        res.json({ message: 'Заявка одобрена' });
    } catch (err) {
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

router.post('/quests', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { title, description, xp_reward, total_tasks, category } = req.body;
        const result = await pool.query(
            'INSERT INTO quests (title, description, xp_reward, total_tasks, category) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [title, description, xp_reward, total_tasks, category]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Ошибка добавления квеста:', err);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

router.post('/achievements', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { title, description, xp_reward, icon, color } = req.body;
        const result = await pool.query(
            'INSERT INTO achievements (title, description, xp_reward, icon, color) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [title, description, xp_reward, icon, color]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Ошибка добавления достижения:', err);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

router.post('/assign-quest', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { userId, questId } = req.body;
        const userExists = await pool.query('SELECT 1 FROM users WHERE id = $1', [userId]);
        const questExists = await pool.query('SELECT 1 FROM quests WHERE id = $1', [questId]);

        if (userExists.rowCount === 0 || questExists.rowCount === 0) {
            return res.status(404).json({ message: 'Пользователь или квест не найдены.' });
        }

        const result = await pool.query(
            'INSERT INTO user_quests (user_id, quest_id) VALUES ($1, $2) ON CONFLICT (user_id, quest_id) DO NOTHING RETURNING *',
            [userId, questId]
        );

        if (result.rowCount === 0) {
            return res.status(409).json({ message: 'Квест уже назначен этому пользователю.' });
        }

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Ошибка назначения квеста:', err);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

router.post('/assign-achievement', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { userId, achievementId } = req.body;
        const userExists = await pool.query('SELECT 1 FROM users WHERE id = $1', [userId]);
        const achievementExists = await pool.query('SELECT 1 FROM achievements WHERE id = $1', [achievementId]);

        if (userExists.rowCount === 0 || achievementExists.rowCount === 0) {
            return res.status(404).json({ message: 'Пользователь или достижение не найдено.' });
        }

        const result = await pool.query(
            'INSERT INTO user_achievements (user_id, achievement_id, is_unlocked, unlocked_at) VALUES ($1, $2, TRUE, NOW()) ON CONFLICT (user_id, achievement_id) DO NOTHING RETURNING *',
            [userId, achievementId]
        );

        if (result.rowCount === 0) {
            return res.status(409).json({ message: 'Достижение уже назначено этому пользователю.' });
        }

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Ошибка назначения достижения:', err);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const result = await pool.query('SELECT id, nickname FROM users ORDER BY nickname ASC');
        res.json(result.rows);
    } catch (err) {
        console.error('Ошибка получения списка пользователей:', err);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

router.get('/quests', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const result = await pool.query('SELECT id, title FROM quests ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error('Ошибка получения списка квестов:', err);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

router.get('/achievements', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const result = await pool.query('SELECT id, title FROM achievements ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error('Ошибка получения списка достижений:', err);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

module.exports = router;