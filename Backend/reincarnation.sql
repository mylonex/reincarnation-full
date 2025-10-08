CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    nickname VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100),
    last_name VARCHAR(50),
    email VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    bio TEXT,
    avatar TEXT,
    total_xp INTEGER DEFAULT 0,
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE applications (
    id SERIAL PRIMARY KEY,
    nickname VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    last_name VARCHAR(50),
    email VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    bio TEXT,
    avatar TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- добавим вручную: pending, approved, rejected
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) DEFAULT 'Другое',
    due_date DATE,
    xp_reward INTEGER DEFAULT 10,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE quests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    xp_reward INTEGER DEFAULT 100,
    total_tasks INTEGER NOT NULL, -- сколько задач нужно выполнить
    progress INTEGER DEFAULT 0,   -- текущее количество выполненных задач
    is_completed BOOLEAN DEFAULT FALSE,
    category VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE achievements (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    xp_reward INTEGER DEFAULT 50,
    icon VARCHAR(50) DEFAULT 'fas fa-trophy',
    color VARCHAR(50), -- например, '#FFD700' или 'gold'
    awarded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    username VARCHAR(50) NOT NULL,
    avatar TEXT,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_quests (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quest_id INTEGER NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
    is_completed BOOLEAN DEFAULT FALSE,
    current_progress INTEGER DEFAULT 0,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, quest_id)
);

CREATE TABLE user_achievements (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_id INTEGER NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    is_unlocked BOOLEAN DEFAULT TRUE,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, achievement_id)
);

INSERT INTO users (
    nickname,
    name,
    email,
    password,
    role,
    total_xp,
    xp,
    level,
    created_at
) VALUES (
    'admin',
    'Администратор',
    'admin@example.com',
    '$2b$10$EpVq5Y9a.YuBcOeIjR.HXOZ.dCnLW5kQyK9t6YyZ6vGzJ0NlU6oIK', -- хеш от "admin123"
    'admin',
    0,
    0,
    1,
    NOW()
)
ON CONFLICT (email) DO NOTHING;