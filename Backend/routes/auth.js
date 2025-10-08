// routes/auth.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const { hashPassword, verifyPassword } = require('../utils/auth');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Middleware для проверки JWT токена
const authMiddleware = (req, res, next) => {
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
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Неверный или истекший токен' });
    }
};

// Настройка загрузки файлов
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/avatars/';
        // Создаем папку, если её нет
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB максимум
    },
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Разрешены только изображения!'));
        }
    }
});


// Регистрация (заявка)
router.post('/register', async (req, res) => {
    try {
        const { nickname, name, email, password, confirmPassword } = req.body;

        console.log('Получены данные регистрации:', req.body);

        // Проверка обязательных полей
        if (!nickname || !name || !email || !password || !confirmPassword) {
            return res.status(400).json({ message: 'Все поля обязательны для заполнения' });
        }

        // Проверка совпадения паролей
        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Пароли не совпадают' });
        }

        // Проверяем, существует ли уже заявка с таким email
        const existingApp = await pool.query('SELECT * FROM applications WHERE email = $1', [email]);
        if (existingApp.rows.length > 0) {
            return res.status(400).json({ message: 'Заявка с таким email уже существует' });
        }

        // Проверяем, существует ли уже пользователь с таким email
        const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
        }

        // Хешируем пароль
        const hashed = await hashPassword(password);
        
        // Вставляем заявку в базу
        const result = await pool.query(
            'INSERT INTO applications (nickname, name, email, password) VALUES ($1, $2, $3, $4) RETURNING *',
            [nickname, name, email, hashed]
        );
        
        console.log('Заявка создана:', result.rows[0]);
        res.status(201).json({ message: 'Заявка отправлена' });
    } catch (err) {
        console.error('ОШИБКА РЕГИСТРАЦИИ:', err);
        res.status(500).json({ message: 'Ошибка сервера: ' + err.message });
    }
});

// Вход
router.post('/login', async (req, res) => {
    try {
        const { email, password, remember } = req.body;

        console.log('Попытка входа:', email);

        // Проверка обязательных полей
        if (!email || !password) {
            return res.status(400).json({ message: 'Email и пароль обязательны' });
        }

        // Ищем пользователя в базе
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user) {
            console.log('Пользователь не найден:', email);
            return res.status(401).json({ message: 'Неверный email или пароль' });
        }

        // Проверяем пароль
        const isValid = await verifyPassword(password, user.password);
        if (!isValid) {
            console.log('Неверный пароль для пользователя:', email);
            return res.status(401).json({ message: 'Неверный email или пароль' });
        }

        // Создаем JWT токен
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: remember ? '30d' : '1d' }
        );

        console.log('Успешный вход для пользователя:', user.email);
        res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
    } catch (err) {
        console.error('ОШИБКА ВХОДА:', err);
        res.status(500).json({ message: 'Ошибка сервера: ' + err.message });
    }
});

// Получение данных текущего пользователя
router.get('/me', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: 'Требуется авторизация' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const result = await pool.query('SELECT id, email, role FROM users WHERE id = $1', [decoded.id]);
        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ message: 'Пользователь не найден' });
        }

        res.json(user);
    } catch (err) {
        console.error('ОШИБКА ПОЛУЧЕНИЯ ПОЛЬЗОВАТЕЛЯ:', err);
        res.status(401).json({ message: 'Неверный токен' });
    }
});

// Обновление профиля пользователя
router.put('/profile', async (req, res) => {
  try {
      const token = req.headers.authorization?.split(' ')[1];
      
      if (!token) {
          return res.status(401).json({ message: 'Требуется авторизация' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const { 
          nickname, 
          name, 
          last_name, 
          email, 
          bio, 
          password, 
          newPassword,
          avatar 
      } = req.body;

      // Проверяем, существует ли пользователь
      const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.id]);
      const user = userResult.rows[0];

      if (!user) {
          return res.status(401).json({ message: 'Пользователь не найден' });
      }

      // Если меняется email, проверяем уникальность
      if (email && email !== user.email) {
          const emailCheck = await pool.query('SELECT * FROM users WHERE email = $1 AND id != $2', [email, decoded.id]);
          if (emailCheck.rows.length > 0) {
              return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
          }
      }

      // Если меняется пароль, проверяем текущий пароль
      if (newPassword) {
          if (!password) {
              return res.status(400).json({ message: 'Введите текущий пароль для изменения' });
          }
          
          const isValid = await verifyPassword(password, user.password);
          if (!isValid) {
              return res.status(400).json({ message: 'Неверный текущий пароль' });
          }

          // Хешируем новый пароль
          const hashedNewPassword = await hashPassword(newPassword);
          
          // Обновляем все данные включая пароль
          const updateResult = await pool.query(
              'UPDATE users SET nickname = $1, name = $2, last_name = $3, email = $4, bio = $5, avatar = $6, password = $7 WHERE id = $8 RETURNING id, email, nickname, name, last_name, bio, avatar',
              [nickname, name, last_name, email, bio, avatar, hashedNewPassword, decoded.id]
          );
          
          res.json({ 
              message: 'Профиль успешно обновлен', 
              user: updateResult.rows[0] 
          });
      } else {
          // Обновляем данные без изменения пароля
          const updateResult = await pool.query(
              'UPDATE users SET nickname = $1, name = $2, last_name = $3, email = $4, bio = $5, avatar = $6 WHERE id = $7 RETURNING id, email, nickname, name, last_name, bio, avatar',
              [nickname, name, last_name, email, bio, avatar, decoded.id]
          );
          
          res.json({ 
              message: 'Профиль успешно обновлен', 
              user: updateResult.rows[0] 
          });
      }

  } catch (err) {
      console.error('ОШИБКА ОБНОВЛЕНИЯ ПРОФИЛЯ:', err);
      if (err.name === 'JsonWebTokenError') {
          return res.status(401).json({ message: 'Неверный токен' });
      }
      res.status(500).json({ message: 'Ошибка сервера: ' + err.message });
  }
});

// Получение данных профиля пользователя (обновленная версия)
router.get('/profile', async (req, res) => {
  try {
      const token = req.headers.authorization?.split(' ')[1];
      
      if (!token) {
          return res.status(401).json({ message: 'Требуется авторизация' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const result = await pool.query(
          'SELECT id, email, nickname, name, last_name, bio, avatar FROM users WHERE id = $1', 
          [decoded.id]
      );
      const user = result.rows[0];

      if (!user) {
          return res.status(401).json({ message: 'Пользователь не найден' });
      }

      res.json(user);
  } catch (err) {
      console.error('ОШИБКА ПОЛУЧЕНИЯ ПРОФИЛЯ:', err);
      if (err.name === 'JsonWebTokenError') {
          return res.status(401).json({ message: 'Неверный токен' });
      }
      res.status(500).json({ message: 'Ошибка сервера: ' + err.message });
  }
});

// Endpoint для загрузки аватара
router.post('/upload-avatar', upload.single('avatar'), async (req, res) => {
  try {
      if (!req.file) {
          return res.status(400).json({ message: 'Файл не загружен' });
      }

      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
          // Удаляем загруженный файл, если нет токена
          fs.unlinkSync(req.file.path);
          return res.status(401).json({ message: 'Требуется авторизация' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Получаем текущего пользователя для удаления старого аватара
      const currentUser = await pool.query('SELECT avatar FROM users WHERE id = $1', [decoded.id]);
      const oldAvatar = currentUser.rows[0]?.avatar;
      
      // Удаляем старый аватар, если он есть и это не дефолтный
      if (oldAvatar && !oldAvatar.startsWith('http')) {
          const oldAvatarPath = path.join(__dirname, '..', oldAvatar);
          if (fs.existsSync(oldAvatarPath)) {
              fs.unlinkSync(oldAvatarPath);
          }
      }
      
      // Сохраняем путь к новому аватару в базе данных
      const avatarPath = `/uploads/avatars/${req.file.filename}`;
      await pool.query(
          'UPDATE users SET avatar = $1 WHERE id = $2',
          [avatarPath, decoded.id]
      );

      res.json({ 
          message: 'Аватар успешно загружен',
          avatarPath: avatarPath
      });

  } catch (err) {
      console.error('Ошибка загрузки аватара:', err);
      // Удаляем файл в случае ошибки
      if (req.file) {
          const filePath = path.join(__dirname, '..', 'uploads', 'avatars', req.file.filename);
          if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
          }
      }
      res.status(500).json({ message: 'Ошибка сервера: ' + err.message });
  }
});

// ==================== ЗАДАЧИ ====================

// Получить задачи пользователя
router.get('/tasks', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'Требуется авторизация' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const result = await pool.query(
            'SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC',
            [decoded.id]
        );
        
        res.json(result.rows);
    } catch (err) {
        console.error('Ошибка получения задач:', err);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// Добавить новую задачу
router.post('/tasks', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'Требуется авторизация' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { title, description, category, due_date, xp_reward } = req.body;

        if (!title) {
            return res.status(400).json({ message: 'Название задачи обязательно' });
        }

        const result = await pool.query(
            'INSERT INTO tasks (user_id, title, description, category, due_date, xp_reward) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [decoded.id, title, description, category || 'Другое', due_date, xp_reward || 10]
        );
        
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Ошибка добавления задачи:', err);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// Обновить статус задачи (выполнена/не выполнена)
router.put('/tasks/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { is_completed } = req.body;
        const userId = req.userId;

        let completedAt = null;
        if (is_completed) {
            completedAt = new Date(); 
        }

        const result = await pool.query(
            `UPDATE tasks 
             SET is_completed = $1, completed_at = $2 
             WHERE id = $3 AND user_id = $4 
             RETURNING *`,
            [is_completed, completedAt, id, userId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Задача не найдена или не принадлежит пользователю' });
        }

        const updatedTask = result.rows[0];

        // Дополнительная логика: если задача выполнена, обновить XP пользователя
        if (is_completed) {
            const task = updatedTask;
            await pool.query(
                'UPDATE users SET xp = xp + $1 WHERE id = $2',
                [task.xp_reward, userId]
            );
        }

        res.json(updatedTask);
    } catch (err) {
        console.error('Ошибка обновления задачи:', err);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// Удалить задачу
router.delete('/tasks/:id', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'Требуется авторизация' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const taskId = req.params.id;

        // Проверяем, что задача принадлежит пользователю
        const taskResult = await pool.query(
            'SELECT * FROM tasks WHERE id = $1 AND user_id = $2',
            [taskId, decoded.id]
        );
        
        if (taskResult.rows.length === 0) {
            return res.status(404).json({ message: 'Задача не найдена' });
        }

        const task = taskResult.rows[0];
        
        // Если задача была выполнена, отнимаем XP при удалении
        if (task.is_completed) {
            await pool.query(
                'UPDATE users SET total_xp = total_xp - $1 WHERE id = $2',
                [task.xp_reward, decoded.id]
            );
        }

        // Удаляем задачу
        await pool.query(
            'DELETE FROM tasks WHERE id = $1 AND user_id = $2',
            [taskId, decoded.id]
        );
        
        res.json({ message: 'Задача удалена' });
    } catch (err) {
        console.error('Ошибка удаления задачи:', err);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// ==================== ДОСТИЖЕНИЯ ====================

// Получить достижения пользователя
router.get('/achievements', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'Требуется авторизация' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const result = await pool.query(
            'SELECT * FROM achievements WHERE user_id = $1 ORDER BY awarded_at DESC',
            [decoded.id]
        );
        
        res.json(result.rows);
    } catch (err) {
        console.error('Ошибка получения достижений:', err);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// ==================== КВЕСТЫ ====================

// Получить квесты пользователя
router.get('/quests', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'Требуется авторизация' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const result = await pool.query(
            'SELECT * FROM quests WHERE user_id = $1 ORDER BY created_at DESC',
            [decoded.id]
        );
        
        res.json(result.rows);
    } catch (err) {
        console.error('Ошибка получения квестов:', err);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// ==================== ПРОГРЕСС ====================

// Получить прогресс пользователя
router.get('/progress', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'Требуется авторизация' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Получаем пользователя с XP
        const userResult = await pool.query(
            'SELECT total_xp FROM users WHERE id = $1',
            [decoded.id]
        );
        
        const user = userResult.rows[0];
        
        // Получаем статистику задач
        const statsResult = await pool.query(
            `SELECT 
                COUNT(*) as total_tasks,
                COUNT(CASE WHEN is_completed THEN 1 END) as completed_tasks,
                SUM(CASE WHEN is_completed THEN xp_reward ELSE 0 END) as earned_xp
            FROM tasks WHERE user_id = $1`,
            [decoded.id]
        );
        
        const stats = statsResult.rows[0];
        
        res.json({
            total_xp: user.total_xp || 0,
            total_tasks: parseInt(stats.total_tasks) || 0,
            completed_tasks: parseInt(stats.completed_tasks) || 0,
            earned_xp: parseInt(stats.earned_xp) || 0
        });
    } catch (err) {
        console.error('Ошибка получения прогресса:', err);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// ==================== ЧАТ ====================

// Получить последние N сообщений
router.get('/chat/messages', async (req, res) => {
    try {
        // Ограничиваем количество сообщений, например, последние 50
        const limit = parseInt(req.query.limit) || 50;
        const offset = parseInt(req.query.offset) || 0;

        const result = await pool.query(
            `SELECT m.id, m.user_id, m.username, m.avatar, m.content, m.created_at, u.role
             FROM messages m
             JOIN users u ON m.user_id = u.id
             ORDER BY m.created_at DESC
             LIMIT $1 OFFSET $2`,
            [limit, offset]
        );

        // Отправляем в обратном порядке, чтобы новые были внизу
        res.json(result.rows.reverse());
    } catch (err) {
        console.error('Ошибка получения сообщений:', err);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// Отправить новое сообщение
router.post('/chat/messages', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'Требуется авторизация' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const { content } = req.body;

        if (!content || content.trim() === '') {
            return res.status(400).json({ message: 'Сообщение не может быть пустым' });
        }

        // Получаем пользователя для имени и аватара
        const userResult = await pool.query(
            'SELECT nickname, avatar FROM users WHERE id = $1',
            [decoded.id]
        );
        const user = userResult.rows[0];
        
        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        const result = await pool.query(
            'INSERT INTO messages (user_id, username, avatar, content) VALUES ($1, $2, $3, $4) RETURNING id, user_id, username, avatar, content, created_at',
            [decoded.id, user.nickname, user.avatar, content.trim()]
        );
        
        const newMessage = result.rows[0];
        
        // TODO: Здесь можно отправить сообщение через WebSocket всем подключенным клиентам
        
        res.status(201).json(newMessage);
    } catch (err) {
        console.error('Ошибка отправки сообщения:', err);
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Неверный токен' });
        }
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

router.get('/profile', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Требуется авторизация' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const result = await pool.query('SELECT id, email, nickname, name, last_name, bio, avatar FROM users WHERE id = $1', [decoded.id]);
        const user = result.rows[0];
        if (!user) {
            return res.status(401).json({ message: 'Пользователь не найден' });
        }

        // Добавляем информацию о статусе (онлайн/оффлайн)
        // Это будет нереализовано, так как требует доступа к connectedUsers из server.js
        // В реальности нужно либо использовать Redis, либо создать отдельный эндпоинт для этого

        res.json(user);
    } catch (err) {
        console.error('ОШИБКА ПОЛУЧЕНИЯ ПРОФИЛЯ:', err);
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Неверный токен' });
        }
        res.status(500).json({ message: 'Ошибка сервера: ' + err.message });
    }
});

module.exports = router;