// src/DashboardEditPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom'; // Если используете React Router

const DashboardEditPage = () => {
  const navigate = useNavigate(); // Для навигации в React Router
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    bio: '',
    avatar: 'https://via.placeholder.com/150'
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [avatarPreview, setAvatarPreview] = useState('https://via.placeholder.com/150');
  const [isLoading, setIsLoading] = useState(true);
  const avatarInputRef = useRef(null);

  // Проверка токена и загрузка данных пользователя при монтировании
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    // Если нет токена, перенаправляем на страницу входа
    if (!token) {
      // window.location.href = 'auth.html'; // Для обычной навигации
      navigate('/auth'); // Для React Router
      return;
    }
    
    loadUserProfile(token);
  }, [navigate]);

  // Функция для загрузки данных пользователя
  const loadUserProfile = async (token) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Не удалось загрузить профиль');
      }
      
      const userData = await response.json();
      
      // Обновляем состояние с данными пользователя
      const updatedUserData = {
        firstName: userData.name || '',
        lastName: userData.last_name || '',
        username: userData.nickname || '',
        email: userData.email || '',
        bio: userData.bio || '',
        avatar: userData.avatar || 'https://via.placeholder.com/150'
      };
      
      setUserData(updatedUserData);
      
      // Устанавливаем превью аватара
      if (userData.avatar) {
        if (userData.avatar.startsWith('http')) {
          setAvatarPreview(userData.avatar); // Внешний URL
        } else {
          setAvatarPreview(`http://localhost:5000${userData.avatar}`); // Локальный файл
        }
      } else {
        setAvatarPreview('https://via.placeholder.com/150');
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Ошибка загрузки профиля:', error);
      alert('Не удалось загрузить данные профиля');
      setIsLoading(false);
    }
  };

  // Обработчик изменения полей формы
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  // Обработчик изменения полей пароля
  const handlePasswordChange = (e) => {
    const { id, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  // Обработчик выбора файла аватара
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Проверяем тип файла
      if (!file.type.startsWith('image/')) {
        alert('Пожалуйста, выберите изображение');
        return;
      }
      
      // Проверяем размер файла (5MB максимум)
      if (file.size > 5 * 1024 * 1024) {
        alert('Размер файла не должен превышать 5MB');
        return;
      }
      
      // Показываем предпросмотр
      const reader = new FileReader();
      reader.onload = function(e) {
        setAvatarPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Обработчик отправки формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    // Сначала загружаем аватар, если он был выбран
    const avatarFile = avatarInputRef.current?.files[0];
    let avatarPath = null;
    
    if (avatarFile) {
      try {
        const formData = new FormData();
        formData.append('avatar', avatarFile);
        
        const uploadResponse = await fetch('http://localhost:5000/api/auth/upload-avatar', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
        
        const uploadData = await uploadResponse.json();
        
        if (!uploadResponse.ok) {
          throw new Error(uploadData.message || 'Ошибка загрузки аватара');
        }
        
        avatarPath = uploadData.avatarPath;
      } catch (error) {
        console.error('Ошибка загрузки аватара:', error);
        alert('Ошибка загрузки аватара: ' + error.message);
        return;
      }
    }
    
    // Затем обновляем остальные данные профиля
    const profileData = {
      name: userData.firstName,
      last_name: userData.lastName,
      nickname: userData.username,
      email: userData.email,
      bio: userData.bio
    };
    
    // Если аватар был загружен, добавляем его путь
    if (avatarPath) {
      profileData.avatar = avatarPath;
    }
    
    // Проверяем изменение пароля
    if (passwordData.newPassword) {
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        alert('Пароли не совпадают');
        return;
      }
      if (!passwordData.currentPassword) {
        alert('Введите текущий пароль для изменения');
        return;
      }
      profileData.newPassword = passwordData.newPassword;
      profileData.password = passwordData.currentPassword;
    }
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert('Профиль успешно обновлен!');
        // window.location.href = 'dashboard.html'; // Для обычной навигации
        navigate('/dashboard'); // Для React Router
      } else {
        alert(data.message || 'Ошибка при обновлении профиля');
      }
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Ошибка соединения с сервером');
    }
  };

  // Обработчик кнопки "Отменить"
  const handleCancel = () => {
    // window.location.href = 'dashboard.html'; // Для обычной навигации
    navigate('/dashboard'); // Для React Router
  };

  // Показ/скрытие пароля
  const togglePasswordVisibility = (fieldId) => {
    const input = document.getElementById(fieldId);
    if (input) {
      const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
      input.setAttribute('type', type);
      
      // Обновляем иконку (предполагаем, что иконка находится в соседнем элементе)
      const icon = input.nextElementSibling?.querySelector('i');
      if (icon) {
        icon.className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
      }
    }
  };

  if (isLoading) {
    return <div className="text-center py-10">Загрузка...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Шапка сайта */}
      <header className="bg-dark-800 border-b border-dark-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          {/* Логотип */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center">
              <img src="image/lotos.png" alt="Логотип" className="w-8 h-8 object-contain" />
            </div>
            <span className="text-xl font-extrabold bg-gradient-to-r from-neon-pink to-neon-purple bg-clip-text text-transparent">РЕИНКАРНАЦИЯ</span>
          </div>

          {/* Навигация */}
          <nav className="hidden md:flex space-x-6">
            <a href="index.html" className="text-gray-300 hover:text-neon-pink transition font-medium hover:underline hover:underline-offset-4 hover:decoration-neon-blue">Главная</a>
            <a href="learning.html" className="text-gray-300 hover:text-neon-pink transition font-medium hover:underline hover:underline-offset-4 hover:decoration-neon-green">Обучение</a>
            <a href="community.html" className="text-gray-300 hover:text-neon-pink transition font-medium hover:underline hover:underline-offset-4 hover:decoration-neon-yellow">Сообщество</a>
            <a href="profile.html" className="text-neon-green font-medium hover:underline hover:underline-offset-4 hover:decoration-neon-purple">Мой прогресс</a>
          </nav>

          {/* Кнопка профиля */}
          <div>
            <a href="profile.html" className="flex items-center space-x-2 bg-dark-700 hover:bg-dark-600 px-4 py-2 rounded-lg transition">
              <img src="https://via.placeholder.com/32" alt="Аватар" className="w-8 h-8 rounded-full border-2 border-neon-blue" />
              <span className="font-medium">Уровень 5</span>
            </a>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="max-w-4xl mx-auto">
          {/* Заголовок */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl md:text-3xl font-bold">
              <span className="bg-gradient-to-r from-neon-pink to-neon-purple bg-clip-text text-transparent">Редактирование</span> профиля
            </h1>
            <button 
              onClick={handleCancel}
              className="text-gray-400 hover:text-neon-blue transition flex items-center"
            >
              <i className="fas fa-arrow-left mr-2"></i> Назад
            </button>
          </div>
          
          {/* Основной контент */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Левая колонка - аватар */}
            <div className="md:col-span-1">
              <div className="bg-dark-800 rounded-xl border border-dark-700 p-6 shadow-lg">
                <div className="flex flex-col items-center">
                  <div className="relative mb-4 group">
                    <img 
                      src={avatarPreview} 
                      alt="Аватар" 
                      className="w-32 h-32 rounded-full border-4 border-neon-purple"
                    />
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                      <label 
                        htmlFor="avatarInput" 
                        className="bg-gradient-to-r from-neon-blue to-neon-purple text-white p-3 rounded-full cursor-pointer"
                      >
                        <i className="fas fa-camera"></i>
                      </label>
                    </div>
                  </div>
                  <label 
                    htmlFor="avatarInput" 
                    className="text-neon-blue hover:text-neon-pink transition text-sm cursor-pointer"
                  >
                    Изменить фото
                  </label>
                  <input 
                    type="file" 
                    id="avatarInput" 
                    accept="image/*" 
                    className="hidden"
                    onChange={handleAvatarChange}
                    ref={avatarInputRef}
                  />
                  
                  <div className="w-full mt-6">
                    <h3 className="font-bold mb-3 text-neon-yellow">Уровень профиля</h3>
                    <div className="flex items-center space-x-2 mb-1">
                      <div className="w-full bg-dark-700 rounded-full h-2.5">
                        <div 
                          className="bg-gradient-to-r from-neon-green to-neon-blue h-2.5 rounded-full" 
                          style={{ width: '65%' }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">5</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>1,240 XP</span>
                      <span>2,000 XP до след. уровня</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Правая колонка - форма */}
            <div className="md:col-span-2">
              <div className="bg-dark-800 rounded-xl border border-dark-700 p-6 shadow-lg">
                <form onSubmit={handleSubmit}>
                  {/* Основная информация */}
                  <h3 className="font-bold text-lg mb-4 text-neon-blue flex items-center">
                    <i className="fas fa-user-circle mr-2"></i>
                    Основная информация
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium mb-2">Имя</label>
                      <input 
                        type="text" 
                        id="firstName" 
                        className="w-full bg-dark-700 border border-dark-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-neon-purple focus:border-transparent" 
                        value={userData.firstName}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium mb-2">Фамилия</label>
                      <input 
                        type="text" 
                        id="lastName" 
                        className="w-full bg-dark-700 border border-dark-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-neon-purple focus:border-transparent" 
                        value={userData.lastName}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="username" className="block text-sm font-medium mb-2">Имя пользователя</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                        @
                      </div>
                      <input 
                        type="text" 
                        id="username" 
                        className="w-full bg-dark-700 border border-dark-600 text-white rounded-lg pl-8 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-neon-purple focus:border-transparent" 
                        value={userData.username}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="bio" className="block text-sm font-medium mb-2">О себе</label>
                    <textarea 
                      id="bio" 
                      rows="3" 
                      className="w-full bg-dark-700 border border-dark-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-neon-purple focus:border-transparent"
                      value={userData.bio}
                      onChange={handleInputChange}
                    ></textarea>
                  </div>
                  
                  {/* Настройки аккаунта */}
                  <h3 className="font-bold text-lg mb-4 text-neon-green flex items-center">
                    <i className="fas fa-cog mr-2"></i>
                    Настройки аккаунта
                  </h3>
                  <div className="mb-6">
                    <label htmlFor="email" className="block text-sm font-medium mb-2">Email</label>
                    <input 
                      type="email" 
                      id="email" 
                      className="w-full bg-dark-700 border border-dark-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-neon-purple focus:border-transparent" 
                      value={userData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label htmlFor="currentPassword" className="block text-sm font-medium mb-2">Старый пароль</label>
                      <div className="relative">
                        <input 
                          type="password" 
                          id="currentPassword" 
                          className="w-full bg-dark-700 border border-dark-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-neon-purple focus:border-transparent"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                          <button 
                            type="button" 
                            className="text-gray-500 hover:text-neon-blue"
                            onClick={() => togglePasswordVisibility('currentPassword')}
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium mb-2">Новый пароль</label>
                      <div className="relative">
                        <input 
                          type="password" 
                          id="newPassword" 
                          className="w-full bg-dark-700 border border-dark-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-neon-purple focus:border-transparent"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                          <button 
                            type="button" 
                            className="text-gray-500 hover:text-neon-blue"
                            onClick={() => togglePasswordVisibility('newPassword')}
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">Подтвердите новый пароль</label>
                    <div className="relative">
                      <input 
                        type="password" 
                        id="confirmPassword" 
                        className="w-full bg-dark-700 border border-dark-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-neon-purple focus:border-transparent"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <button 
                          type="button" 
                          className="text-gray-500 hover:text-neon-blue"
                          onClick={() => togglePasswordVisibility('confirmPassword')}
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Кнопки */}
                  <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
                    <button 
                      type="button" 
                      onClick={handleCancel}
                      className="border border-gray-600 text-gray-300 hover:bg-dark-700 px-6 py-2 rounded-lg transition"
                    >
                      Отменить
                    </button>
                    <button 
                      type="submit" 
                      className="bg-gradient-to-r from-neon-pink to-neon-purple hover:from-neon-purple hover:to-neon-blue text-white px-6 py-2 rounded-lg font-bold transition transform hover:scale-[1.02] shadow-lg hover:shadow-neon-pink/30"
                    >
                      Сохранить изменения
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Футер */}
      <footer className="bg-dark-800 border-t border-dark-700 py-8 mt-auto">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                  <img src="image/lotos.png" alt="Логотип" className="w-8 h-8 object-contain" />
                </div>
                <span className="text-xl font-extrabold bg-gradient-to-r from-neon-pink to-neon-purple bg-clip-text text-transparent">РЕИНКАРНАЦИЯ</span>
              </div>
              <p className="text-gray-500">Игровое образовательное сообщество для поколения Z. Прокачивай навыки, зарабатывай опыт и становись лучшей версией себя!</p>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4 text-gray-300">Быстрые ссылки</h4>
              <ul className="space-y-2">
                <li><a href="index.html" className="text-gray-500 hover:text-neon-blue transition">Главная</a></li>
                <li><a href="learning.html" className="text-gray-500 hover:text-neon-green transition">Обучение</a></li>
                <li><a href="community.html" className="text-gray-500 hover:text-neon-yellow transition">Сообщество</a></li>
                <li><a href="profile.html" className="text-gray-500 hover:text-neon-purple transition">Мой прогресс</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4 text-gray-300">Контакты</h4>
              <ul className="space-y-2 text-gray-500">
                <li className="flex items-start">
                  <i className="fas fa-envelope mt-1 mr-2"></i>
                  <span>game@reincarnation.ru</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-phone-alt mt-1 mr-2"></i>
                  <span>+7 (XXX) XXX-XX-XX</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-dark-700 mt-8 pt-6 text-center text-gray-600 text-sm">
            <p>© 2025 Реинкарнация — Игровое образовательное сообщество. Все права защищены.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DashboardEditPage;