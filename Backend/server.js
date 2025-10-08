const express = require('express');
const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
});

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

app.use('/uploads', express.static('uploads'));

const http = require('http');
const socketIo = require('socket.io');

// Создаем HTTP сервер поверх Express приложения
const server = http.createServer(app);

// Подключаем Socket.IO
const io = socketIo(server, {
    cors: {
        origin: "*", // В продакшене укажи конкретный origin
        methods: ["GET", "POST"]
    }
});

// Храним подключенных пользователей (в реальном приложении используй Redis)
let connectedUsers = new Map();

io.on('connection', (socket) => {
    console.log('Новое WebSocket соединение:', socket.id);

    // Клиент должен отправить токен для аутентификации
    socket.on('authenticate', async (token) => {
        try {
            if (!token) {
                socket.emit('error', 'Требуется токен');
                socket.disconnect();
                return;
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const userResult = await pool.query(
                'SELECT id, nickname, avatar, role FROM users WHERE id = $1',
                [decoded.id]
            );
            const user = userResult.rows[0];

            if (!user) {
                socket.emit('error', 'Пользователь не найден');
                socket.disconnect();
                return;
            }

            // Сохраняем информацию о пользователе
            connectedUsers.set(socket.id, { ...user, socketId: socket.id });
            socket.userId = user.id; // Сохраняем userId в socket для удобства
            
            console.log(`Пользователь ${user.nickname} подключился через WebSocket`);
            
            // Отправляем подтверждение аутентификации
            socket.emit('authenticated', { message: 'Аутентификация успешна' });
            
        } catch (err) {
            console.error('Ошибка аутентификации WebSocket:', err);
            socket.emit('error', 'Ошибка аутентификации');
            socket.disconnect();
        }
    });

    // Получение нового сообщения от клиента
    socket.on('send_message', async (data) => {
        try {
            const userId = socket.userId;
            if (!userId) {
                socket.emit('error', 'Не аутентифицирован');
                return;
            }

            const { content } = data;
            if (!content || content.trim() === '') {
                socket.emit('error', 'Сообщение не может быть пустым');
                return;
            }

            // Получаем пользователя
            const userResult = await pool.query(
                'SELECT nickname, avatar FROM users WHERE id = $1',
                [userId]
            );
            const user = userResult.rows[0];

            // Сохраняем сообщение в БД
            const result = await pool.query(
                'INSERT INTO messages (user_id, username, avatar, content) VALUES ($1, $2, $3, $4) RETURNING id, user_id, username, avatar, content, created_at',
                [userId, user.nickname, user.avatar, content.trim()]
            );
            
            const newMessage = result.rows[0];
            
            // Отправляем новое сообщение всем подключенным клиентам
            io.emit('new_message', newMessage);
            
        } catch (err) {
            console.error('Ошибка обработки сообщения через WebSocket:', err);
            socket.emit('error', 'Ошибка сервера');
        }
    });

    // Отключение пользователя
    socket.on('disconnect', () => {
        const user = connectedUsers.get(socket.id);
        if (user) {
            console.log(`Пользователь ${user.nickname} отключился`);
            connectedUsers.delete(socket.id);
        }
    });
});

// Экспортируем io для использования в других частях приложения
module.exports = { app, io, server }; // Изменяем экспорт

server.listen(PORT, () => { // Используем server вместо app
    console.log(`Сервер запущен на порту ${PORT}`);
});

