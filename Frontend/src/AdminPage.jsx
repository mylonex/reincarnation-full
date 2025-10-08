// src/AdminPage.jsx

import React, { useState, useEffect } from 'react';

const AdminPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Состояния для форм
  const [questData, setQuestData] = useState({
    title: '',
    description: '',
    xp_reward: 0,
    total_tasks: 0,
    category: ''
  });
  const [achievementData, setAchievementData] = useState({
    title: '',
    description: '',
    xp_reward: 0,
    icon: '',
    color: ''
  });

const [users, setUsers] = useState([]); // Для списка пользователей
const [questsList, setQuestsList] = useState([]); // Для списка квестов
const [achievementsList, setAchievementsList] = useState([]); // Для списка достижений
const [assignQuestData, setAssignQuestData] = useState({ userId: '', questId: '' });
const [assignAchievementData, setAssignAchievementData] = useState({ userId: '', achievementId: '' });


  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = 'login.html';
      return;
    }
    loadApplications(token);
  }, []);

  const loadApplications = async (token) => {
    // ... (без изменений, ваш существующий код) ...
  };
  
  const approveApplication = async (id) => {
    // ... (без изменений) ...
  };

  const rejectApplication = async (id) => {
    // ... (без изменений) ...
  };

  const handleQuestSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/quests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(questData)
      });
      
      if (response.ok) {
        alert('Квест успешно добавлен!');
        setQuestData({ title: '', description: '', xp_reward: 0, total_tasks: 0, category: '' });
      } else {
        const errorData = await response.json();
        alert(`Ошибка: ${errorData.message}`);
      }
    } catch (err) {
      alert('Ошибка сети при добавлении квеста.');
    }
  };

  const handleAchievementSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/achievements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(achievementData)
      });
      
      if (response.ok) {
        alert('Достижение успешно добавлено!');
        setAchievementData({ title: '', description: '', xp_reward: 0, icon: '', color: '' });
      } else {
        const errorData = await response.json();
        alert(`Ошибка: ${errorData.message}`);
      }
    } catch (err) {
      alert('Ошибка сети при добавлении достижения.');
    }
  };
  
  const handleQuestChange = (e) => {
    const { name, value } = e.target;
    setQuestData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };
  
  const handleAchievementChange = (e) => {
    const { name, value } = e.target;
    setAchievementData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };
  
const loadUsersAndContent = async (token) => {
  try {
      // Загрузка пользователей
      const usersResponse = await fetch('http://localhost:5000/api/admin/users', { headers: { 'Authorization': `Bearer ${token}` } });
      const usersData = await usersResponse.json();
      setUsers(usersData);
      
      // Загрузка квестов
      const questsResponse = await fetch('http://localhost:5000/api/admin/quests', { headers: { 'Authorization': `Bearer ${token}` } });
      const questsData = await questsResponse.json();
      setQuestsList(questsData);

      // Загрузка достижений
      const achievementsResponse = await fetch('http://localhost:5000/api/admin/achievements', { headers: { 'Authorization': `Bearer ${token}` } });
      const achievementsData = await achievementsResponse.json();
      setAchievementsList(achievementsData);

  } catch (err) {
      console.error('Ошибка загрузки данных:', err);
  }
};

const handleAssignQuest = async (e) => {
  e.preventDefault();
  const token = localStorage.getItem('token');
  try {
      const response = await fetch('http://localhost:5000/api/admin/assign-quest', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(assignQuestData)
      });
      if (response.ok) {
          alert('Квест успешно назначен!');
          setAssignQuestData({ userId: '', questId: '' });
      } else {
          const errorData = await response.json();
          alert(`Ошибка: ${errorData.message}`);
      }
  } catch (err) {
      alert('Ошибка сети при назначении квеста.');
  }
};

const handleAssignAchievement = async (e) => {
  e.preventDefault();
  const token = localStorage.getItem('token');
  try {
      const response = await fetch('http://localhost:5000/api/admin/assign-achievement', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(assignAchievementData)
      });
      if (response.ok) {
          alert('Достижение успешно назначено!');
          setAssignAchievementData({ userId: '', achievementId: '' });
      } else {
          const errorData = await response.json();
          alert(`Ошибка: ${errorData.message}`);
      }
  } catch (err) {
      alert('Ошибка сети при назначении достижения.');
  }
};

// Обновите useEffect для загрузки всех данных
useEffect(() => {
  const token = localStorage.getItem('token');
  if (!token) {
      window.location.href = 'login.html';
      return;
  }
  loadApplications(token);
  loadUsersAndContent(token); // Вызываем новую функцию
}, []);

// ... (обработчики изменений input) ...
const handleAssignQuestChange = (e) => {
  const { name, value } = e.target;
  setAssignQuestData(prevState => ({ ...prevState, [name]: value }));
};
const handleAssignAchievementChange = (e) => {
  const { name, value } = e.target;
  setAssignAchievementData(prevState => ({ ...prevState, [name]: value }));
};

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold">Админ панель</h1>
        </div>
      </nav>
      
      <div className="max-w-7xl mx-auto mt-8 p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Секция заявок */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Заявки на регистрацию</h2>
          {loading ? (
            <p className="text-gray-500">Загрузка...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : applications.length === 0 ? (
            <p className="text-gray-500">Нет заявок</p>
          ) : (
            <div className="space-y-4">
              {applications.map(app => (
                <div key={app.id} className="bg-white p-4 rounded shadow flex justify-between items-center">
                  <div>
                    <h3 className="font-bold">{app.nickname}</h3>
                    <p>Имя: {app.name}</p>
                    <p>Email: {app.email}</p>
                  </div>
                  <div className="space-x-2">
                    <button 
                      onClick={() => approveApplication(app.id)}
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
                    >
                      Одобрить
                    </button>
                    <button 
                      onClick={() => rejectApplication(app.id)}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                    >
                      Отклонить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Секция добавления контента */}
        <div className="space-y-8">
          {/* Форма добавления квеста */}
          <div className="bg-white p-6 rounded shadow">
            <h3 className="text-xl font-bold mb-4">Добавить новый квест</h3>
            <form onSubmit={handleQuestSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Название</label>
                <input type="text" name="title" value={questData.title} onChange={handleQuestChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Описание</label>
                <textarea name="description" value={questData.description} onChange={handleQuestChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Награда XP</label>
                <input type="number" name="xp_reward" value={questData.xp_reward} onChange={handleQuestChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Количество задач</label>
                <input type="number" name="total_tasks" value={questData.total_tasks} onChange={handleQuestChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Категория</label>
                <input type="text" name="category" value={questData.category} onChange={handleQuestChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition">Добавить квест</button>
            </form>
          </div>

          {/* Форма добавления достижения */}
          <div className="bg-white p-6 rounded shadow">
            <h3 className="text-xl font-bold mb-4">Добавить новое достижение</h3>
            <form onSubmit={handleAchievementSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Название</label>
                <input type="text" name="title" value={achievementData.title} onChange={handleAchievementChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Описание</label>
                <textarea name="description" value={achievementData.description} onChange={handleAchievementChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Награда XP</label>
                <input type="number" name="xp_reward" value={achievementData.xp_reward} onChange={handleAchievementChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Иконка (напр., fa-trophy)</label>
                <input type="text" name="icon" value={achievementData.icon} onChange={handleAchievementChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Цвет (напр., green)</label>
                <input type="text" name="color" value={achievementData.color} onChange={handleAchievementChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition">Добавить достижение</button>
            </form>
          </div>
              {/* Форма назначения квеста пользователю */}
    <div className="bg-white p-6 rounded shadow">
        <h3 className="text-xl font-bold mb-4">Назначить квест пользователю</h3>
        <form onSubmit={handleAssignQuest} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Пользователь</label>
                <select name="userId" value={assignQuestData.userId} onChange={handleAssignQuestChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                    <option value="">Выберите пользователя</option>
                    {users.map(user => (
                        <option key={user.id} value={user.id}>{user.nickname}</option>
                    ))}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Квест</label>
                <select name="questId" value={assignQuestData.questId} onChange={handleAssignQuestChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                    <option value="">Выберите квест</option>
                    {questsList.map(quest => (
                        <option key={quest.id} value={quest.id}>{quest.title}</option>
                    ))}
                </select>
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition">Назначить квест</button>
        </form>
    </div>

    {/* Форма назначения достижения пользователю */}
    <div className="bg-white p-6 rounded shadow">
        <h3 className="text-xl font-bold mb-4">Назначить достижение пользователю</h3>
        <form onSubmit={handleAssignAchievement} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Пользователь</label>
                <select name="userId" value={assignAchievementData.userId} onChange={handleAssignAchievementChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                    <option value="">Выберите пользователя</option>
                    {users.map(user => (
                        <option key={user.id} value={user.id}>{user.nickname}</option>
                    ))}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Достижение</label>
                <select name="achievementId" value={assignAchievementData.achievementId} onChange={handleAssignAchievementChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                    <option value="">Выберите достижение</option>
                    {achievementsList.map(ach => (
                        <option key={ach.id} value={ach.id}>{ach.title}</option>
                    ))}
                </select>
            </div>
            <button type="submit" className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition">Назначить достижение</button>
        </form>
    </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;