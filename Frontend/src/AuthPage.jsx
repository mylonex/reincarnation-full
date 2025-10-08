import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

const AuthPage = () => {
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
    remember: false,
  });
  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });

  // Проверка токена при монтировании компонента
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch("http://localhost:5000/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.id) {
            console.log(
              "Пользователь авторизован, перенаправление на dashboard"
            );
            // navigate is now defined and will work here
            navigate("/dashboard");
          }
        })
        .catch(() => {
          localStorage.removeItem("token");
        });
    }
  }, [navigate]); // Add navigate to dependencies to satisfy ESLint (though it won't change often)

  const handleTabSwitch = (tab) => {
    setIsLogin(tab === "login");
  };

  const handleLoginChange = (e) => {
    const { id, value, type, checked } = e.target;
    setLoginData((prev) => ({
      ...prev,
      [id.replace("login-", "")]: type === "checkbox" ? checked : value,
    }));
  };

  const handleRegisterChange = (e) => {
    const { id, value, type, checked } = e.target;
    setRegisterData((prev) => ({
      ...prev,
      [id.replace("register-", "")]: type === "checkbox" ? checked : value,
    }));
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: loginData.email,
          password: loginData.password,
          remember: loginData.remember,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        console.log("Успешный вход, перенаправление на dashboard");
        navigate("/dashboard");
      } else {
        alert(data.message || "Ошибка входа");
      }
    } catch (error) {
      console.error("Ошибка:", error);
      alert("Ошибка соединения с сервером");
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    if (!registerData.terms) {
      alert("Пожалуйста, примите условия использования");
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      alert("Пароли не совпадают");
      return;
    }

    if (registerData.password.length < 8) {
      alert("Пароль должен содержать минимум 8 символов");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nickname: registerData.username,
          name: registerData.username,
          email: registerData.email,
          password: registerData.password,
          confirmPassword: registerData.confirmPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(
          "Заявка отправлена! После одобрения администратором вы сможете войти."
        );
        handleTabSwitch("login");
      } else {
        alert(data.message || "Ошибка регистрации");
      }
    } catch (error) {
      console.error("Ошибка:", error);
      alert("Ошибка соединения с сервером");
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Шапка сайта */}
      <header className="bg-dark-800 border-b border-dark-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          {/* Логотип */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center text-white font-bold shadow-lg">
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

          {/* Навигация */}
          <nav className="hidden md:flex space-x-6">
            <a
              href="/"
              className="text-gray-300 hover:text-neon-pink transition font-medium hover:underline hover:underline-offset-4 hover:decoration-neon-blue"
            >
              Главная
            </a>
            <a
              href="/#skills"
              className="text-gray-300 hover:text-neon-pink transition font-medium hover:underline hover:underline-offset-4 hover:decoration-neon-green"
            >
              Навыки
            </a>
            <a
              href="/#game"
              className="text-gray-300 hover:text-neon-pink transition font-medium hover:underline hover:underline-offset-4 hover:decoration-neon-yellow"
            >
              Игровой мир
            </a>
          </nav>

          {/* Кнопка на главную */}
          <div>
            <a
              href="/"
              className="bg-gradient-to-r from-neon-pink to-neon-purple text-white px-5 py-2 rounded-lg hover:shadow-glow hover:shadow-neon-pink/50 transition-all font-bold"
            >
              На главную
            </a>
          </div>
        </div>
      </header>

      {/* Основной контент */}
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-12 md:py-24">
          <div className="max-w-md mx-auto">
            {/* Переключатель между входом и регистрацией */}
            <div className="flex mb-8 border-b border-dark-700">
              <button
                onClick={() => handleTabSwitch("login")}
                className={`flex-1 py-3 font-bold ${
                  isLogin
                    ? "text-neon-pink border-b-2 border-neon-pink"
                    : "text-gray-400 hover:text-neon-blue transition"
                }`}
              >
                Вход
              </button>
              <button
                onClick={() => handleTabSwitch("register")}
                className={`flex-1 py-3 font-bold ${
                  !isLogin
                    ? "text-neon-pink border-b-2 border-neon-pink"
                    : "text-gray-400 hover:text-neon-blue transition"
                }`}
              >
                Регистрация
              </button>
            </div>

            {/* Форма входа */}
            <div
              className={`bg-dark-800 rounded-xl p-8 border-2 border-neon-purple/30 shadow-lg ${
                !isLogin ? "hidden" : ""
              }`}
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">Вход в аккаунт</h2>
                <p className="text-gray-400">
                  Продолжи свой путь к совершенству
                </p>
              </div>

              <form onSubmit={handleLoginSubmit}>
                <div className="mb-6">
                  <label
                    htmlFor="login-email"
                    className="block text-sm font-medium mb-2 text-gray-300"
                  >
                    Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      id="login-email"
                      value={loginData.email}
                      onChange={handleLoginChange}
                      className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-neon-purple focus:border-transparent"
                      placeholder="your@email.com"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <i className="fas fa-envelope text-gray-500"></i>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <label
                    htmlFor="login-password"
                    className="block text-sm font-medium mb-2 text-gray-300"
                  >
                    Пароль
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      id="login-password"
                      value={loginData.password}
                      onChange={handleLoginChange}
                      className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-neon-purple focus:border-transparent"
                      placeholder="••••••••"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <i className="fas fa-lock text-gray-500"></i>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <input
                      id="login-remember"
                      type="checkbox"
                      checked={loginData.remember}
                      onChange={handleLoginChange}
                      className="h-4 w-4 bg-dark-700 border-dark-600 rounded text-neon-purple focus:ring-neon-purple"
                    />
                    <label
                      htmlFor="login-remember"
                      className="ml-2 block text-sm text-gray-400"
                    >
                      Запомнить меня
                    </label>
                  </div>
                  <a
                    href="#"
                    className="text-sm text-neon-blue hover:underline"
                  >
                    Забыли пароль?
                  </a>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-neon-pink to-neon-purple text-white py-3 rounded-lg font-bold hover:shadow-lg hover:shadow-neon-pink/30 transition-all mb-4"
                >
                  Войти
                </button>

                <div className="text-center text-sm text-gray-500">
                  Нет аккаунта?
                  <button
                    type="button"
                    onClick={() => handleTabSwitch("register")}
                    className="text-neon-blue hover:underline ml-1"
                  >
                    Зарегистрироваться
                  </button>
                </div>
              </form>
            </div>

            {/* Форма регистрации */}
            <div
              className={`bg-dark-800 rounded-xl p-8 border-2 border-neon-blue/30 shadow-lg ${
                isLogin ? "hidden" : ""
              }`}
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">Создать аккаунт</h2>
                <p className="text-gray-400">
                  Начни свое путешествие к новым навыкам
                </p>
              </div>

              <form onSubmit={handleRegisterSubmit}>
                <div className="mb-6">
                  <label
                    htmlFor="register-username"
                    className="block text-sm font-medium mb-2 text-gray-300"
                  >
                    Имя пользователя
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="register-username"
                      value={registerData.username}
                      onChange={handleRegisterChange}
                      className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent"
                      placeholder="gamemaster"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <i className="fas fa-user text-gray-500"></i>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <label
                    htmlFor="register-email"
                    className="block text-sm font-medium mb-2 text-gray-300"
                  >
                    Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      id="register-email"
                      value={registerData.email}
                      onChange={handleRegisterChange}
                      className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent"
                      placeholder="your@email.com"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <i className="fas fa-envelope text-gray-500"></i>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <label
                    htmlFor="register-password"
                    className="block text-sm font-medium mb-2 text-gray-300"
                  >
                    Пароль
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      id="register-password"
                      value={registerData.password}
                      onChange={handleRegisterChange}
                      className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent"
                      placeholder="••••••••"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <i className="fas fa-lock text-gray-500"></i>
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Минимум 8 символов, включая цифры и буквы
                  </p>
                </div>

                <div className="mb-6">
                  <label
                    htmlFor="register-confirm-password"
                    className="block text-sm font-medium mb-2 text-gray-300"
                  >
                    Подтвердите пароль
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      id="register-confirm-password"
                      value={registerData.confirmPassword}
                      onChange={handleRegisterChange}
                      className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent"
                      placeholder="••••••••"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <i className="fas fa-lock text-gray-500"></i>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-center">
                    <input
                      id="register-terms"
                      type="checkbox"
                      checked={registerData.terms}
                      onChange={handleRegisterChange}
                      className="h-4 w-4 bg-dark-700 border-dark-600 rounded text-neon-blue focus:ring-neon-blue"
                      required
                    />
                    <label
                      htmlFor="register-terms"
                      className="ml-2 block text-sm text-gray-400"
                    >
                      Я принимаю{" "}
                      <a href="#" className="text-neon-blue hover:underline">
                        условия использования
                      </a>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-neon-blue to-neon-green text-white py-3 rounded-lg font-bold hover:shadow-lg hover:shadow-neon-blue/30 transition-all mb-4"
                >
                  Подать заявку
                </button>

                <div className="text-center text-sm text-gray-500">
                  Уже есть аккаунт?
                  <button
                    type="button"
                    onClick={() => handleTabSwitch("login")}
                    className="text-neon-pink hover:underline ml-1"
                  >
                    Войти
                  </button>
                </div>
              </form>
            </div>

            {/* Социальные сети */}
            <div className="mt-8 text-center">
              <p className="text-gray-500 mb-4">Или войти через</p>
              <div className="flex justify-center space-x-4">
                <a
                  href="#"
                  className="w-12 h-12 rounded-full bg-dark-700 flex items-center justify-center text-white hover:bg-gradient-to-br from-blue-600 to-blue-800 transition"
                >
                  <i className="fab fa-vk text-xl"></i>
                </a>
                <a
                  href="#"
                  className="w-12 h-12 rounded-full bg-dark-700 flex items-center justify-center text-white hover:bg-gradient-to-br from-blue-400 to-blue-600 transition"
                >
                  <i className="fab fa-telegram text-xl"></i>
                </a>
                <a
                  href="#"
                  className="w-12 h-12 rounded-full bg-dark-700 flex items-center justify-center text-white hover:bg-gradient-to-br from-pink-500 to-red-500 transition"
                >
                  <i className="fab fa-google text-xl"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Футер */}
      <footer className="bg-dark-900 border-t border-dark-800 py-8 mt-auto">
        <div className="container mx-auto px-6">
          <div className="text-center text-gray-600 text-sm">
            <p>
              © 2025 Реинкарнация — Игровое образовательное сообщество. Все
              права защищены.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AuthPage;
