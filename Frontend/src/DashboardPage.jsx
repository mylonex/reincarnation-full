import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";

const DashboardPage = () => {
  const [user, setUser] = useState({
    name: "Загрузка...",
    email: "Загрузка...",
    level: 5,
    xp: 1240,
    xpToNextLevel: 2000,
    avatar: "https://via.placeholder.com/120",
  });

  const [tasks, setTasks] = useState([]);
  const [quests, setQuests] = useState([]);
  const [achievements, setAchievements] = useState([
    {
      id: 1,
      title: "Первый код на Python",
      xp: 50,
      icon: "medal",
      date: "2 дня назад",
      color: "green",
    },
    {
      id: 2,
      title: "7 дней английского",
      xp: 70,
      icon: "fire",
      date: "сегодня",
      color: "blue",
    },
    {
      id: 3,
      title: "Первая неделя",
      xp: 100,
      icon: "star",
      date: "неделю назад",
      color: "pink",
    },
  ]);

  const [stats, setStats] = useState({
    streak: 8,
    totalTasks: 14,
    completedTasks: 0,
    earnedXp: 0,
  });

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());

  const token = localStorage.getItem("token");

  const handlePrevMonth = () => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  const tasksByDate = useMemo(() => {
    const dates = new Map();
    tasks.forEach((task) => {
      const dateKey = new Date(task.created_at).toDateString();
      if (!dates.has(dateKey)) {
        dates.set(dateKey, { total: 0, completed: 0 });
      }
      const data = dates.get(dateKey);
      data.total += 1;
      if (task.is_completed) {
        data.completed += 1;
      }
    });
    return dates;
  }, [tasks]);

  const loadUserProfile = async () => {
    if (!token) {
      window.location.href = "/auth";
      return;
    }
    try {
      const response = await fetch("http://localhost:5000/api/auth/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Не удалось загрузить профиль");
      }
      const userData = await response.json();
      setUser((prev) => ({
        ...prev,
        name: userData.name || "Пользователь",
        email: userData.email || "",
        level: userData.level || 5,
        xp: userData.xp || 1240,
        avatar: userData.avatar
          ? userData.avatar.startsWith("http")
            ? userData.avatar
            : `http://localhost:5000${userData.avatar}`
          : "https://via.placeholder.com/120",
      }));
    } catch (error) {
      console.error("Ошибка загрузки профиля:", error);
    }
  };

  const loadTasks = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/tasks", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Не удалось загрузить задачи");
      }
      const tasksData = await response.json();
      setTasks(tasksData);
    } catch (error) {
      console.error("Ошибка загрузки задач:", error);
    }
  };

  const loadQuests = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/quests", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Не удалось загрузить квесты");
      }
      const questsData = await response.json();
      setQuests(questsData);
    } catch (error) {
      console.error("Ошибка загрузки квестов:", error);
    }
  };

  const loadUserProgress = async () => {
    if (!token) return;
    try {
      const response = await fetch("http://localhost:5000/api/auth/progress", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Не удалось загрузить прогресс");
      }
      const progressData = await response.json();
      setStats((prev) => ({
        ...prev,
        totalTasks: progressData.total_tasks,
        completedTasks: progressData.completed_tasks,
        earnedXp: progressData.earned_xp,
      }));
      setUser((prev) => ({
        ...prev,
        xp: progressData.total_xp,
      }));
    } catch (error) {
      console.error("Ошибка загрузки прогресса:", error);
    }
  };

  const updateTaskStatus = async (taskId, isCompleted) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/auth/tasks/${taskId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ is_completed: isCompleted }),
        }
      );
      if (!response.ok) {
        throw new Error("Не удалось обновить задачу");
      }
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, is_completed: isCompleted } : task
        )
      );
      loadUserProfile();
      loadUserProgress();
    } catch (error) {
      console.error("Ошибка обновления задачи:", error);
      alert("Ошибка при обновлении задачи");
    }
  };

  const createTask = async () => {
    if (!newTaskTitle.trim()) return;
    try {
      const response = await fetch("http://localhost:5000/api/auth/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newTaskTitle.trim(),
          description: "",
          category: "Другое",
          xp_reward: 10,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create task");
      }
      const newTask = await response.json();
      console.log("Задача создана:", newTask);
      await loadTasks();
      await loadUserProgress();
      setNewTaskTitle("");
    } catch (error) {
      console.error("Ошибка создания задачи:", error);
      alert("Ошибка при создании задачи: " + error.message);
    }
  };

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem("token");
    window.location.href = "/auth";
  };

  useEffect(() => {
    loadUserProfile();
    loadTasks();
    loadQuests();
    loadUserProgress();
  }, []);

  const getCategoryColor = (category) => {
    const colors = {
      Программирование: "bg-neon-green/10 text-neon-green",
      Английский: "bg-neon-blue/10 text-neon-blue",
      Саморазвитие: "bg-neon-purple/10 text-neon-purple",
      Дизайн: "bg-neon-pink/10 text-neon-pink",
      Учеба: "bg-neon-green/10 text-neon-green",
      default: "bg-gray-700/10 text-gray-400",
    };
    return colors[category] || colors.default;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      Программирование: "fa-code",
      Английский: "fa-language",
      Саморазвитие: "fa-moon",
      Дизайн: "fa-paint-brush",
      Учеба: "fa-book",
      default: "fa-tasks",
    };
    return icons[category] || icons.default;
  };

  return (
    <>
      <header className="bg-dark-800 border-b border-dark-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center">
              <img
                src="/lotos.png"
                alt="Логотип"
                className="w-8 h-8 object-contain"
              />
            </div>
            <span className="text-xl font-extrabold bg-gradient-to-r from-neon-pink to-neon-purple bg-clip-text text-transparent">
              РЕИНКАРНАЦИЯ
            </span>
          </div>

          <nav className="hidden md:flex space-x-6">
            <a
              href="/"
              className="text-gray-300 hover:text-neon-pink transition font-medium hover:underline hover:underline-offset-4 hover:decoration-neon-blue"
            >
              Главная
            </a>
            <a
              href="/"
              className="text-gray-300 hover:text-neon-pink transition font-medium hover:underline hover:underline-offset-4 hover:decoration-neon-green"
            >
              Обучение
            </a>
            <a
              href="/"
              className="text-gray-300 hover:text-neon-pink transition font-medium hover:underline hover:underline-offset-4 hover:decoration-neon-yellow"
            >
              Сообщество
            </a>
            <a
              href="/dashboard"
              className="text-neon-green font-medium hover:underline hover:underline-offset-4 hover:decoration-neon-purple"
            >
              Мой прогресс
            </a>
          </nav>

          <div>
            <button
              id="logoutBtn"
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-dark-700 hover:bg-dark-600 px-4 py-2 rounded-lg transition"
            >
              <i className="fas fa-sign-out-alt"></i>
              <span className="font-medium">Выйти</span>
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-80 flex-shrink-0">
            <div className="bg-dark-800 rounded-xl border border-dark-700 p-6 shadow-lg mb-6">
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  <img
                    id="userAvatar"
                    src={user.avatar}
                    alt="Аватар"
                    className="w-24 h-24 rounded-full border-4 border-neon-purple"
                  />
                  <div className="absolute bottom-0 right-0 bg-neon-green text-dark-900 font-bold px-3 py-1 rounded-full text-sm border-2 border-dark-800">
                    Ур. <span id="userLevel">{user.level}</span>
                  </div>
                </div>
                <h2 className="text-xl font-bold mb-1" id="userName">
                  {user.name}
                </h2>
                <p className="text-gray-400 mb-4" id="userEmail">
                  {user.email}
                </p>

                <div className="w-full bg-dark-700 rounded-full h-2.5 mb-4">
                  <div
                    className="bg-gradient-to-r from-neon-pink to-neon-purple h-2.5 rounded-full"
                    style={{
                      width: `${(user.xp / user.xpToNextLevel) * 100}%`,
                    }}
                  ></div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center w-full mb-4">
                  <div>
                    <div className="text-2xl font-bold bg-gradient-to-r from-neon-green to-neon-blue bg-clip-text text-transparent">
                      {user.xp}
                    </div>
                    <div className="text-xs text-gray-400">XP</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold bg-gradient-to-r from-neon-yellow to-neon-pink bg-clip-text text-transparent">
                      {stats.streak}
                    </div>
                    <div className="text-xs text-gray-400">Дней подряд</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
                      {stats.completedTasks}
                    </div>
                    <div className="text-xs text-gray-400">Заданий</div>
                  </div>
                </div>

                <Link
                  to="/dashboardEdit"
                  id="editProfileBtn"
                  className="w-full bg-gradient-to-r from-neon-blue to-neon-purple text-white px-8 py-2 rounded-lg font-bold hover:shadow-lg hover:shadow-neon-blue/30 transition-all"
                >
                  Редактировать профиль
                </Link>
              </div>
            </div>

            <div className="bg-dark-800 rounded-xl border border-dark-700 p-6 shadow-lg">
              <h3 className="text-lg font-bold mb-4 flex items-center text-neon-yellow">
                <i className="fas fa-trophy mr-2"></i>
                Последние достижения
              </h3>
              <div className="space-y-3">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="flex items-center bg-dark-700/50 rounded-lg p-3 border-l-4 border-neon-green"
                  >
                    <div
                      className={`w-10 h-10 rounded bg-gradient-to-br from-neon-${achievement.color} to-${achievement.color}-700 flex items-center justify-center text-white mr-3`}
                    >
                      <i className={`fas fa-${achievement.icon}`}></i>
                    </div>
                    <div>
                      <div className="font-medium">{achievement.title}</div>
                      <div className="text-xs text-gray-400">
                        +{achievement.xp} XP • {achievement.date}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <a
                href="#"
                className="inline-block mt-4 text-neon-blue hover:underline text-sm"
              >
                Все достижения (5)
              </a>
            </div>
          </aside>

          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
              <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-0">
                <span className="bg-gradient-to-r from-neon-green to-neon-blue bg-clip-text text-transparent">
                  Мой планировщик
                </span>{" "}
                задач
              </h1>

              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Новая задача..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") createTask();
                  }}
                  className="bg-dark-800 border border-dark-700 text-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-purple w-full md:w-auto"
                />
                <button
                  onClick={createTask}
                  className="bg-gradient-to-r from-neon-pink to-neon-purple text-white px-4 py-2 rounded-lg hover:shadow-lg hover:shadow-neon-pink/30 transition-all"
                >
                  <i className="fas fa-plus mr-1"></i> Новая задача
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="bg-dark-800 rounded-xl border border-dark-700 p-4 shadow-lg lg:col-span-1">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold">
                    {currentDate.toLocaleString("ru-RU", {
                      month: "long",
                      year: "numeric",
                    })}
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={handlePrevMonth}
                      className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white"
                    >
                      <i className="fas fa-chevron-left"></i>
                    </button>
                    <button
                      onClick={handleNextMonth}
                      className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white"
                    >
                      <i className="fas fa-chevron-right"></i>
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-sm">
                  {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((day) => (
                    <div key={day} className="text-gray-500 py-1">
                      {day}
                    </div>
                  ))}
                  {[
                    ...Array(
                      new Date(
                        currentDate.getFullYear(),
                        currentDate.getMonth(),
                        1
                      ).getDay() - 1 || 6
                    ),
                  ].map((_, i) => (
                    <div key={`empty-${i}`} className="py-1"></div>
                  ))}
                  {[
                    ...Array(
                      new Date(
                        currentDate.getFullYear(),
                        currentDate.getMonth() + 1,
                        0
                      ).getDate()
                    ),
                  ].map((_, i) => {
                    const day = i + 1;
                    const date = new Date(
                      currentDate.getFullYear(),
                      currentDate.getMonth(),
                      day
                    );
                    const dateString = date.toDateString();
                    const today = new Date().toDateString();
                    const taskStats = tasksByDate.get(dateString) || {
                      total: 0,
                      completed: 0,
                    };
                    let dayClass = "py-1 rounded-full bg-dark-700";

                    if (dateString === today) {
                      dayClass =
                        "py-1 rounded-full bg-gradient-to-br from-neon-pink/20 to-neon-purple/20 border border-neon-purple/30";
                    } else if (
                      taskStats.total > 0 &&
                      taskStats.completed === 0
                    ) {
                      dayClass = "py-1 rounded-full bg-red-500/30";
                    } else if (taskStats.completed > 0) {
                      dayClass = "py-1 rounded-full bg-neon-green/30";
                    }

                    return (
                      <div key={day} className={dayClass}>
                        {day}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-dark-800 rounded-xl border border-dark-700 p-4 shadow-lg lg:col-span-2">
                <h3 className="font-bold mb-4 flex items-center text-neon-blue">
                  <i className="fas fa-chart-line mr-2"></i>
                  Прогресс за неделю
                </h3>
                <div className="grid grid-cols-7 gap-2 mb-4">
                  <div className="text-center">
                    <div className="text-xs text-gray-400 mb-1">Пн</div>
                    <div className="h-16 rounded-t-lg bg-gradient-to-t from-neon-green/30 to-green-900/10"></div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-400 mb-1">Вт</div>
                    <div className="h-24 rounded-t-lg bg-gradient-to-t from-neon-green/40 to-green-900/10"></div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-400 mb-1">Ср</div>
                    <div className="h-32 rounded-t-lg bg-gradient-to-t from-neon-green/50 to-green-900/10"></div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-400 mb-1">Чт</div>
                    <div className="h-20 rounded-t-lg bg-gradient-to-t from-neon-green/30 to-green-900/10"></div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-400 mb-1">Пт</div>
                    <div className="h-28 rounded-t-lg bg-gradient-to-t from-neon-green/40 to-green-900/10"></div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-400 mb-1">Сб</div>
                    <div className="h-12 rounded-t-lg bg-gradient-to-t from-neon-green/20 to-green-900/10"></div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-400 mb-1">Вс</div>
                    <div className="h-8 rounded-t-lg bg-gradient-to-t from-neon-green/10 to-green-900/10"></div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm text-gray-400">Выполнено задач</div>
                    <div className="text-xl font-bold">
                      {stats.completedTasks}/{stats.totalTasks}{" "}
                      <span className="text-sm text-neon-green">
                        (+3 vs прошлая неделя)
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-400">Заработано XP</div>
                    <div className="text-xl font-bold">
                      {stats.earnedXp}{" "}
                      <span className="text-sm text-neon-pink">(+50)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-dark-800 rounded-xl border border-dark-700 shadow-lg overflow-hidden">
              <div className="grid grid-cols-12 bg-dark-700 border-b border-dark-600">
                <div className="col-span-1 py-3 text-center text-gray-400">
                  <i className="fas fa-check"></i>
                </div>
                <div className="col-span-5 py-3 font-medium">Задача</div>
                <div className="col-span-2 py-3 font-medium">Категория</div>
                <div className="col-span-2 py-3 font-medium">Срок</div>
                <div className="col-span-2 py-3 font-medium">Награда</div>
              </div>

              {tasks.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <p>У вас пока нет задач. Добавьте первую!</p>
                </div>
              ) : (
                tasks.map((task) => (
                  <div
                    key={task.id}
                    className="grid grid-cols-12 border-b border-dark-600 hover:bg-dark-750 transition"
                  >
                    <div className="col-span-1 flex items-center justify-center p-3">
                      <input
                        type="checkbox"
                        className="w-5 h-5 rounded bg-dark-700 border-dark-600 text-neon-green focus:ring-neon-green"
                        checked={task.is_completed}
                        onChange={(e) =>
                          updateTaskStatus(task.id, e.target.checked)
                        }
                      />
                    </div>
                    <div className="col-span-5 p-3">
                      <div
                        className={`font-medium ${
                          task.is_completed ? "text-gray-400 line-through" : ""
                        }`}
                      >
                        {task.title}
                      </div>
                      <div className="text-sm text-gray-400">
                        {task.description}
                      </div>
                    </div>
                    <div className="col-span-2 p-3 flex items-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(
                          task.category
                        )}`}
                      >
                        <i
                          className={`fas ${getCategoryIcon(
                            task.category
                          )} mr-1`}
                        ></i>{" "}
                        {task.category}
                      </span>
                    </div>
                    <div className="col-span-2 p-3 flex items-center">
                      <span className="text-sm">
                        {task.due_date
                          ? new Date(task.due_date).toLocaleDateString("ru-RU")
                          : "Без срока"}
                      </span>
                    </div>
                    <div className="col-span-2 p-3 flex items-center">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-md text-sm font-medium ${
                          task.is_completed
                            ? "bg-neon-green/10 text-neon-green"
                            : task.due_date &&
                              new Date(task.due_date) < new Date()
                            ? "bg-red-500/10 text-red-400"
                            : "bg-neon-blue/10 text-neon-blue"
                        }`}
                      >
                        <i
                          className={`fas ${
                            task.is_completed ? "fa-check" : "fa-bolt"
                          } mr-1`}
                        ></i>{" "}
                        +{task.xp_reward} XP
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <i className="fas fa-quest mr-2 text-neon-purple"></i>
                <span className="bg-gradient-to-r from-neon-purple to-neon-pink bg-clip-text text-transparent">
                  Активные квесты
                </span>
              </h2>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {quests.length === 0 ? (
                  <p className="text-gray-500 text-center py-4 col-span-full">
                    У вас пока нет квестов
                  </p>
                ) : (
                  quests.map((quest) => (
                    <div
                      key={quest.id}
                      className="bg-dark-800 rounded-xl border border-dark-700 p-4 shadow-lg hover:border-neon-green transition"
                    >
                      <div className="flex items-center mb-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-neon-green to-green-700 flex items-center justify-center text-white mr-3">
                          <i className="fas fa-code"></i>
                        </div>
                        <h3 className="font-bold">{quest.title}</h3>
                      </div>
                      <p className="text-gray-400 text-sm mb-4">
                        {quest.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <div className="w-full bg-dark-700 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-neon-green to-neon-blue h-2 rounded-full"
                            style={{ width: `${quest.progress || 0}%` }}
                          ></div>
                        </div>
                        <span className="ml-3 text-xs font-medium">
                          {quest.progress || 0}%
                        </span>
                      </div>
                      <div className="flex justify-between mt-2 text-xs text-gray-500">
                        <span>+{quest.xp_reward} XP</span>
                        <span>
                          {quest.completed_tasks || 0}/{quest.total_tasks || 0}{" "}
                          заданий
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-dark-800 border-t border-dark-700 py-8">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-neon-pink to-neon-purple flex items-center justify-center text-white font-bold">
                  R
                </div>
                <span className="text-xl font-extrabold bg-gradient-to-r from-neon-pink to-neon-purple bg-clip-text text-transparent">
                  РЕИНКАРНАЦИЯ
                </span>
              </div>
              <p className="text-gray-500">
                Игровое образовательное сообщество для поколения Z. Прокачивай
                навыки, зарабатывай опыт и становись лучшей версией себя!
              </p>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4 text-gray-300">
                Быстрые ссылки
              </h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="index.html"
                    className="text-gray-500 hover:text-neon-blue transition"
                  >
                    Главная
                  </a>
                </li>
                <li>
                  <a
                    href="learning.html"
                    className="text-gray-500 hover:text-neon-green transition"
                  >
                    Обучение
                  </a>
                </li>
                <li>
                  <a
                    href="community.html"
                    className="text-gray-500 hover:text-neon-yellow transition"
                  >
                    Сообщество
                  </a>
                </li>
                <li>
                  <a
                    href="dashboard.html"
                    className="text-gray-500 hover:text-neon-purple transition"
                  >
                    Мой прогресс
                  </a>
                </li>
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
            <p>
              © 2025 Реинкарнация — Игровое образовательное сообщество. Все
              права защищены.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default DashboardPage;
