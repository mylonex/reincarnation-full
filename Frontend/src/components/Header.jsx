// src/components/Header.jsx
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const Header = ({ isAuthorized = true }) => {
  const [userAvatarSrc] = useState("/avatar0.png");
  const [userLevel] = useState(14);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  // Определяем, находимся ли мы на странице входа/регистрации
  const isAuthPage = ["/auth"].includes(location.pathname);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <>
      <header className="bg-dark-800 border-b border-dark-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          {/* Логотип */}
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

          {/* Бургер-меню (только на мобильных) */}
          <button
            className="md:hidden text-gray-300 focus:outline-none z-50"
            onClick={toggleMenu}
            aria-label="Открыть меню"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>

          {/* Навигация: десктоп */}
          <nav className="hidden md:flex space-x-6 item-center">
            <div className="item-center mr-96 my-3 space-x-6">
              <Link
                to="/"
                className="text-gray-300 hover:text-neon-pink transition font-medium hover:underline hover:underline-offset-4 hover:decoration-neon-blue"
              >
                Главная
              </Link>
              {isAuthorized && (
                <Link
                  to="/dashboard"
                  className="text-gray-300 hover:text-neon-pink transition font-medium hover:underline hover:underline-offset-4 hover:decoration-neon-green"
                >
                  Личный кабинет
                </Link>
              )}
              <Link
                to="/library"
                className="text-gray-300 hover:text-neon-pink transition font-medium hover:underline hover:underline-offset-4 hover:decoration-neon-yellow"
              >
                Библиотека
              </Link>
              {isAuthorized && (
                <Link
                  to="/chat"
                  className="text-gray-300 hover:text-neon-pink transition font-medium hover:underline hover:underline-offset-4 hover:decoration-neon-purple"
                >
                  Чат
                </Link>
              )}
            </div>

            {/* Кнопка входа или аватар — на десктопе */}
            {isAuthorized && !isAuthPage ? (
              <Link
                to="/dashboard"
                className="flex items-center space-x-2 bg-dark-700 hover:bg-dark-600 px-4 py-2 rounded-lg transition"
              >
                <img
                  src={userAvatarSrc}
                  alt="Аватар"
                  className="w-8 h-8 rounded-full border-2 border-neon-purple"
                />
                <span className="font-medium">Уровень {userLevel}</span>
              </Link>
            ) : !isAuthorized ? (
              <Link
                to="/auth"
                className="bg-gradient-to-r from-neon-pink to-neon-purple text-white px-4 py-2 rounded-lg font-bold hover:opacity-90 transition"
              >
                Войти
              </Link>
            ) : null}
          </nav>
        </div>

        {/* Мобильное меню (выпадающее) */}
        {isMenuOpen && (
          <div className="md:hidden bg-dark-800 border-t border-dark-700">
            <div className="container mx-auto px-4 py-4 space-y-4">
              <Link
                to="/"
                className="block text-gray-300 hover:text-neon-pink transition font-medium hover:underline hover:underline-offset-4 hover:decoration-neon-blue"
                onClick={() => setIsMenuOpen(false)}
              >
                Главная
              </Link>
              {isAuthorized && (
                <Link
                  to="/dashboard"
                  className="block text-gray-300 hover:text-neon-pink transition font-medium hover:underline hover:underline-offset-4 hover:decoration-neon-green"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Личный кабинет
                </Link>
              )}
              <Link
                to="/library"
                className="block text-gray-300 hover:text-neon-pink transition font-medium hover:underline hover:underline-offset-4 hover:decoration-neon-yellow"
                onClick={() => setIsMenuOpen(false)}
              >
                Библиотека
              </Link>
              {isAuthorized && (
                <Link
                  to="/chat"
                  className="block text-gray-300 hover:text-neon-pink transition font-medium hover:underline hover:underline-offset-4 hover:decoration-neon-purple"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Чат
                </Link>
              )}

              {/* Мобильная кнопка входа или аватар */}
              {isAuthorized && !isAuthPage ? (
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-2 bg-dark-700 hover:bg-dark-600 px-4 py-3 rounded-lg w-full"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <img
                    src={userAvatarSrc}
                    alt="Аватар"
                    className="w-8 h-8 rounded-full border-2 border-neon-purple"
                  />
                  <span className="font-medium">Уровень {userLevel}</span>
                </Link>
              ) : !isAuthorized ? (
                <Link
                  to="/"
                  className="block bg-gradient-to-r from-neon-pink to-neon-purple text-white text-center px-4 py-3 rounded-lg font-bold hover:opacity-90 transition"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Войти
                </Link>
              ) : null}
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;
