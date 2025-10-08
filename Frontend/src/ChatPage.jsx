// src/ChatPage.jsx
import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client'; // Убедитесь, что socket.io-client установлен
import JitsiVoiceChat from './components/JitsiVoiceChat';
import Header from './components/Header';

const ChatPage = () => {
  // Состояния для данных чата
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [socket, setSocket] = useState(null);
  const [showVoiceChat, setShowVoiceChat] = useState(false); // Состояние для отображения голосового чата
  const [user, setUser] = useState(null); // Для хранения данных текущего пользователя
  const [allUsers, setAllUsers] = useState([]); // Новое состояние для списка всех пользователей
  const messagesContainerRef = useRef(null);

  // Форматирование времени сообщения
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  // Прокрутка контейнера сообщений вниз
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  // Загрузка истории сообщений с сервера
  const loadMessages = async (authToken) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/chat/messages?limit=30', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const messagesData = await response.json();
      setMessages(messagesData);
    } catch (error) {
      console.error('Ошибка загрузки сообщений:', error);
      // Можно показать уведомление пользователю
    }
  };

  // Загрузка данных профиля пользователя
  const loadUserProfile = async (authToken) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const userData = await response.json();
      console.log('Данные пользователя загружены:', userData);
      setUser(userData);
    } catch (error) {
      console.error('Ошибка загрузки профиля пользователя:', error);
      // Можно показать уведомление пользователю или использовать дефолтные значения
    }
  };

  // Отправка сообщения через WebSocket
  const sendMessage = () => {
    if (messageInput.trim() && socket) {
      socket.emit('send_message', { content: messageInput.trim() });
      setMessageInput(''); // Очищаем поле ввода
    }
  };

  // Обработчик отправки формы
  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage();
  };

  // Функция-заглушка для создания текстового канала
  const handleCreateTextChannel = () => {
    alert('Функция создания канала будет реализована позже.');
    console.log('Запрошено создание нового текстового канала');
  };

  // Эффект для инициализации чата
  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('Токен:', token);

    if (!token) {
      window.location.href = 'login.html';
      return;
    }

    // Загружаем историю сообщений
    loadMessages(token);

    // Подключение к WebSocket серверу
    const newSocket = io('http://localhost:5000');

    // Обработка успешного подключения
    newSocket.on('connect', () => {
      console.log('Подключен к WebSocket серверу');
      newSocket.emit('authenticate', token);
    });

    // Обработка аутентификации
    newSocket.on('authenticated', () => {
      console.log('WebSocket: Аутентификация успешна');
      // Загружаем данные профиля пользователя после успешной аутентификации
      loadUserProfile(token);
      
      // Запрашиваем список всех пользователей (предполагаем, что сервер поддерживает это)
      // newSocket.emit('get_users_list'); 
    });

    // Обработка входящих сообщений
    newSocket.on('new_message', (message) => {
      console.log('Новое сообщение через WebSocket:', message);
      setMessages(prevMessages => [...prevMessages, message]);
    });

    // Обработка получения списка пользователей (пример)
    // Предположим, сервер отправляет событие 'users_list' с массивом пользователей
    // Каждый пользователь имеет поля: id, username, avatar, level, online (boolean)
    newSocket.on('users_list', (users) => {
      console.log('Получен список пользователей:', users);
      setAllUsers(users);
    });

    // Обработка обновления статуса пользователя (онлайн/оффлайн)
    // Предположим, сервер отправляет событие 'user_status_changed' при изменении статуса
    newSocket.on('user_status_changed', (updatedUser) => {
      console.log('Статус пользователя изменен:', updatedUser);
      setAllUsers(prevUsers => 
        prevUsers.map(u => u.id === updatedUser.id ? { ...u, online: updatedUser.online } : u)
      );
    });

    // Обработка ошибок аутентификации и других ошибок
    newSocket.on('error', (message) => {
      console.error('Ошибка WebSocket:', message);
      alert('Ошибка сервера WebSocket: ' + message);
    });

    // Обработка ошибок подключения
    newSocket.on('connect_error', (error) => {
      console.error('Ошибка подключения WebSocket:', error);
       alert('Ошибка подключения к серверу чата. Пожалуйста, проверьте соединение.');
    });

    // Сохраняем ссылку на socket
    setSocket(newSocket);

    // Функция очистки при размонтировании компонента
    return () => {
      newSocket.close();
    };
  }, []);

  // Эффект для прокрутки вниз при обновлении сообщений
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Определяем аватар и уровень для отображения в шапке и сайдбаре
  const userAvatarSrc = user?.avatar ? 
    (user.avatar.startsWith('http') ? user.avatar : `http://localhost:5000${user.avatar}`) : 
    'https://via.placeholder.com/32';

  const userLevel = user?.level || 1; 
  const userUsername = user?.username || "Игрок";
  const userTag = `#${user?.id?.toString().padStart(4, '0') || "0000"}`;
  
  const isAdmin = user?.role === 'admin' || user?.isAdmin === true;

  // Разделение пользователей на онлайн и офлайн
  // Пока используем фиктивные данные, так как серверная логика не реализована
  // В реальности эти данные должны приходить с сервера
  const onlineUsers = allUsers.filter(u => u.online);
  const offlineUsers = allUsers.filter(u => !u.online);

  // Функция для отображения одного участника
  const renderUserItem = (userItem) => {
    const avatarSrc = userItem.avatar ? 
      (userItem.avatar.startsWith('http') ? userItem.avatar : `http://localhost:5000${userItem.avatar}`) : 
      'https://via.placeholder.com/32';

    let roleBadge = null;
    if (userItem.role === 'admin') {
      roleBadge = <span className="text-xs bg-neon-purple/20 text-neon-purple px-2 py-0.5 rounded-full">MOD</span>;
    } else {
      roleBadge = <span className="text-xs bg-neon-blue/10 text-neon-blue px-2 py-0.5 rounded-full">{userItem.level || 1}</span>;
    }

    return (
      <li key={userItem.id} className="flex items-center px-2 py-1 rounded hover:bg-dark-700">
        <div className="relative mr-2">
          <img 
            src={avatarSrc} 
            alt={`Аватар ${userItem.username}`} 
            className={`w-8 h-8 rounded-full border-2 ${
              userItem.online ? 'border-neon-green' : 'border-gray-500'
            }`} 
          />
          {userItem.online && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-neon-green rounded-full border-2 border-dark-800"></div>
          )}
        </div>
        <span className="font-medium truncate">{userItem.username}</span>
        <div className="ml-auto flex items-center">
          {roleBadge}
          {user?.id === userItem.id && (
            <span className="ml-1 text-xs bg-neon-blue/10 text-neon-blue px-2 py-0.5 rounded-full">Вы</span>
          )}
        </div>
      </li>
    );
  };

  return (
    <div className="flex flex-col h-screen">

      {/* Шапка сайта */}
      <header className="bg-dark-800 border-b border-dark-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center">
              <img src="image/lotos.png" alt="Логотип" className="w-8 h-8 object-contain" />
            </div>
            <span className="text-xl font-extrabold bg-gradient-to-r from-neon-pink to-neon-purple bg-clip-text text-transparent">
              РЕИНКАРНАЦИЯ
            </span>
          </div>

          <nav className="hidden md:flex space-x-6">
            <a href="index.html" className="text-gray-300 hover:text-neon-pink transition font-medium hover:underline hover:underline-offset-4 hover:decoration-neon-blue">
              Главная
            </a>
            <a href="guide.html" className="text-gray-300 hover:text-neon-pink transition font-medium hover:underline hover:underline-offset-4 hover:decoration-neon-green">
              Обучение
            </a>
            <a href="community.html" className="text-gray-300 hover:text-neon-pink transition font-medium hover:underline hover:underline-offset-4 hover:decoration-neon-yellow">
              Сообщество
            </a>
            <a href="chat.html" className="text-neon-blue font-medium hover:underline hover:underline-offset-4 hover:decoration-neon-purple">
              Чат
            </a>
          </nav>

          <div>
            <a href="dashboard.html" className="flex items-center space-x-2 bg-dark-700 hover:bg-dark-600 px-4 py-2 rounded-lg transition">
              <img 
                src={userAvatarSrc} 
                alt="Аватар" 
                className="w-8 h-8 rounded-full border-2 border-neon-blue" 
              />
              <span className="font-medium">Уровень {userLevel}</span>
            </a>
          </div>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden">
        {/* Боковая панель каналов */}
        <div className="w-60 bg-dark-800 border-r border-dark-700 flex flex-col">
          <div className="p-4 border-b border-dark-700">
            <h2 className="font-bold text-lg flex items-center">
              <span className="bg-gradient-to-r from-neon-pink to-neon-purple bg-clip-text text-transparent">
                Реинкарнация
              </span>
              <i className="fas fa-chevron-down ml-2 text-gray-400 text-xs"></i>
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="px-4 pt-4">
              <div className="flex items-center justify-between text-xs font-semibold text-gray-500 mb-2">
                <span>ТЕКСТОВЫЕ КАНАЛЫ</span>
                {isAdmin && (
                  <i 
                    onClick={handleCreateTextChannel} 
                    className="fas fa-plus cursor-pointer hover:text-gray-300" 
                    title="Создать текстовый канал"
                  ></i>
                )}
              </div>

              <ul className="space-y-1">
                <li>
                  <a href="#" className="flex items-center px-2 py-1 rounded text-gray-300 hover:bg-dark-700 group">
                    <i className="fas fa-hashtag mr-1 text-gray-500 group-hover:text-neon-green"></i>
                    <span>общий-чат</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center px-2 py-1 rounded text-gray-300 hover:bg-dark-700 group">
                    <i className="fas fa-hashtag mr-1 text-gray-500 group-hover:text-neon-blue"></i>
                    <span>помощь</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center px-2 py-1 rounded bg-dark-700 text-white">
                    <i className="fas fa-hashtag mr-1 text-neon-pink"></i>
                    <span>игровые-квесты</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center px-2 py-1 rounded text-gray-300 hover:bg-dark-700 group">
                    <i className="fas fa-hashtag mr-1 text-gray-500 group-hover:text-neon-yellow"></i>
                    <span>достижения</span>
                  </a>
                </li>
              </ul>
            </div>

            <div className="px-4 pt-4">
              <div className="flex items-center justify-between text-xs font-semibold text-gray-500 mb-2">
                <span>ГОЛОСОВЫЕ КАНАЛЫ</span>
              </div>

              <ul className="space-y-1">
                <li>
                  <a href="#" className="flex items-center px-2 py-1 rounded bg-dark-700 text-white">
                    <i className="fas fa-microphone mr-1 text-neon-blue"></i>
                    <span>Общая комната</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="p-2 bg-dark-700 border-t border-dark-600">
            <div className="flex items-center">
              <div className="relative">
                <img 
                  src={userAvatarSrc}
                  alt="Аватар" 
                  className="w-8 h-8 rounded-full border-2 border-neon-blue" 
                />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-neon-green rounded-full border-2 border-dark-700"></div>
              </div>
              <div className="ml-2 flex-1">
                <div className="text-sm font-medium">{userUsername}</div>
                <div className="text-xs text-gray-400">{userTag}</div>
              </div>
              <div className="flex space-x-1 text-gray-400">
                <button className="w-8 h-8 flex items-center justify-center hover:bg-dark-600 rounded">
                  <i className="fas fa-microphone"></i>
                </button>
                <button className="w-8 h-8 flex items-center justify-center hover:bg-dark-600 rounded">
                  <i className="fas fa-headphones"></i>
                </button>
                <button className="w-8 h-8 flex items-center justify-center hover:bg-dark-600 rounded">
                  <i className="fas fa-cog"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Основное содержимое чата */}
        <div className="flex-1 flex flex-col bg-dark-900">
          <div className="h-14 border-b border-dark-700 flex items-center px-4">
            <div className="flex items-center">
              <i className="fas fa-hashtag mr-2 text-neon-pink"></i>
              <h2 className="font-bold">игровые-квесты</h2>
            </div>
            <div className="ml-4 text-sm text-gray-400">Обсуждение текущих квестов и заданий</div>

            <div className="ml-auto flex items-center space-x-4">
              <button className="text-gray-400 hover:text-white">
                <i className="fas fa-user-friends"></i>
              </button>
              <button className="text-gray-400 hover:text-white">
                <i className="fas fa-bell"></i>
              </button>
              <button className="text-gray-400 hover:text-white">
                <i className="fas fa-pin"></i>
              </button>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Поиск" 
                  className="bg-dark-700 text-sm px-3 py-1 rounded w-36 focus:outline-none focus:ring-1 focus:ring-neon-purple" 
                />
                <i className="fas fa-search absolute right-2 top-1.5 text-xs text-gray-500"></i>
              </div>
            </div>
          </div>

          <div 
            ref={messagesContainerRef}
            id="messages-container" 
            className="flex-1 overflow-y-auto p-4 space-y-4"
          >
            {messages.map((msg, index) => {
              let roleBadge = '';
              if (msg.role === 'admin') {
                roleBadge = (
                  <span className="ml-1 text-xs bg-neon-purple/20 text-neon-purple px-2 py-0.5 rounded-full">
                    Администратор
                  </span>
                );
              } else {
                const level = msg.level || 1;
                roleBadge = (
                  <span className="ml-1 text-xs bg-neon-blue/10 text-neon-blue px-2 py-0.5 rounded-full">
                    Уровень {level}
                  </span>
                );
              }

              const avatarSrc = msg.avatar ? 
                (msg.avatar.startsWith('http') ? msg.avatar : `http://localhost:5000${msg.avatar}`) : 
                'https://via.placeholder.com/44';

              return (
                <div key={index} className="flex items-start group hover:bg-dark-800/50 p-2 rounded">
                  <img 
                    src={avatarSrc} 
                    alt="Аватар" 
                    className="w-10 h-10 rounded-full mt-1 border-2 border-neon-blue"
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex items-baseline">
                      <span className="font-bold mr-2">{msg.username}</span>
                      <span className="text-xs text-gray-400">{formatTime(msg.created_at)}</span>
                      {roleBadge}
                    </div>
                    <div className="text-gray-300 mt-1 break-words">
                      {msg.content}
                    </div>
                    <div className="flex space-x-4 mt-2 text-sm text-gray-500 opacity-0 group-hover:opacity-100 transition">
                      <button className="hover:text-neon-pink">
                        <i className="far fa-heart mr-1"></i> 0
                      </button>
                      <button className="hover:text-neon-blue">
                        Ответить
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 border-t border-dark-700">
            <form onSubmit={handleSubmit} id="message-form" className="bg-dark-800 rounded-lg border border-dark-700 p-1">
              <div className="flex items-center px-2">
                <button type="button" className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-neon-pink">
                  <i className="fas fa-plus"></i>
                </button>
                <input 
                  id="message-input" 
                  type="text" 
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Написать сообщение в #игровые-квесты" 
                  className="bg-transparent flex-1 px-2 py-2 focus:outline-none text-gray-300" 
                />
                <div className="flex space-x-1">
                  <button type="button" className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-neon-blue">
                    <i className="fas fa-gift"></i>
                  </button>
                  <button type="button" className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-neon-green">
                    <i className="fas fa-image"></i>
                  </button>
                  <button type="button" className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-neon-purple">
                    <i className="fas fa-grin"></i>
                  </button>
                  <button 
                    type="submit" 
                    className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-dark-600 rounded"
                  >
                    <i className="fas fa-paper-plane"></i>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Правая панель (участники) */}
        <div className="w-60 bg-dark-800 border-l border-dark-700 hidden lg:block">
          <div className="p-4 border-b border-dark-700">
            <h3 className="font-bold">Участники</h3>
          </div>

          <div className="p-2 overflow-y-auto h-full">
            {/* Раздел: Онлайн */}
            <div className="mb-4">
              <div className="text-xs font-semibold text-gray-500 mb-2 px-2">
                ОНЛАЙН — {onlineUsers.length}
              </div>
              {onlineUsers.length > 0 ? (
                <ul className="space-y-1">
                  {onlineUsers.map(renderUserItem)}
                </ul>
              ) : (
                <div className="text-xs text-gray-500 px-2">Нет пользователей в сети</div>
              )}
            </div>

            {/* Раздел: Не в сети */}
            <div className="mb-4">
              <div className="text-xs font-semibold text-gray-500 mb-2 px-2">
                НЕ В СЕТИ — {offlineUsers.length}
              </div>
              {offlineUsers.length > 0 ? (
                <ul className="space-y-1">
                  {offlineUsers.map(renderUserItem)}
                </ul>
              ) : (
                <div className="text-xs text-gray-500 px-2">Все пользователи в сети</div>
              )}
            </div>

            {/* Старый раздел голосовых каналов удален или перемещен */}
            {/* <div className="mb-4">
              <div className="text-xs font-semibold text-gray-500 mb-2 px-2">В ГОЛОСОВОМ КАНАЛЕ — 3</div>
              <ul className="space-y-1">
                ...
              </ul>
            </div> */}
          </div>
        </div>
      </main>
      
      {/* Кнопка для открытия голосового чата */}
      <button
        onClick={() => setShowVoiceChat(!showVoiceChat)}
        className="fixed bottom-4 right-4 w-12 h-12 rounded-full bg-neon-blue flex items-center justify-center text-white hover:bg-neon-purple transition z-40"
        title="Голосовой чат"
      >
        <i className="fas fa-microphone"></i>
      </button>

      {/* Условный рендеринг голосового чата */}
      {showVoiceChat && user && (
        <JitsiVoiceChat 
          roomId="coding-session-123" 
          username={user.username || 'Игрок'} 
        />
      )}
    </div>
  );
};

export default ChatPage;