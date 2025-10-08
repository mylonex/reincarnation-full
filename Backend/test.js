const bcrypt = require('bcryptjs');

const password = '123456';
const saltRounds = 12;

bcrypt.hash(password, saltRounds).then(hash => {
    console.log('Хеш пароля:', hash);
    console.log('INSERT INTO users (nickname, name, email, password, role) VALUES (\'admin\', \'Администратор\', \'admin@example.com\', \'' + hash + '\', \'admin\');');
});