const bcrypt = require('bcryptjs');

const hashPassword = async (password) => {
    try {
        return await bcrypt.hash(password, 12);
    } catch (err) {
        console.error('Ошибка хеширования пароля:', err);
        throw err;
    }
};

const verifyPassword = async (password, hashedPassword) => {
    try {
        return await bcrypt.compare(password, hashedPassword);
    } catch (err) {
        console.error('Ошибка проверки пароля:', err);
        throw err;
    }
};

module.exports = { hashPassword, verifyPassword };