import React from 'react';
import { FaLanguage, FaCode, FaPaintBrush, FaPalette, FaTrophy, FaGem, FaCheck, FaCoins, FaFire, FaEnvelope, FaPhoneAlt, FaMapMarkerAlt } from 'react-icons/fa';
import { FaVk, FaTelegram, FaInstagram, FaYoutube } from 'react-icons/fa';

const MainPage = () => {
  return (
<body className="bg-dark-900 text-gray-100 font-sans">

<header className="bg-dark-800 border-b border-dark-700 sticky top-0 z-50">
    <div className="container mx-auto px-4 py-3 flex justify-between items-center">

      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center text-white font-bold shadow-lg">
          <img src="/src/assets/lotos.png"/>
        </div>
        <span className="text-xl font-extrabold bg-gradient-to-r from-neon-pink to-neon-purple bg-clip-text text-transparent">РЕИНКАРНАЦИЯ</span>
      </div>
  

      <nav className="hidden md:flex space-x-6">
        <a href="#" className="text-gray-300 hover:text-neon-pink transition font-medium hover:underline hover:underline-offset-4 hover:decoration-neon-blue">Главная</a>
        <a href="#skills" className="text-gray-300 hover:text-neon-pink transition font-medium hover:underline hover:underline-offset-4 hover:decoration-neon-green">Навыки</a>
        <a href="#game" className="text-gray-300 hover:text-neon-pink transition font-medium hover:underline hover:underline-offset-4 hover:decoration-neon-yellow">Игровой мир</a>
        <a href="#community" className="text-gray-300 hover:text-neon-pink transition font-medium hover:underline hover:underline-offset-4 hover:decoration-neon-purple">Комьюнити</a>
      </nav>
  
      <div>
        <a href="auth.html" className="bg-gradient-to-r from-neon-pink to-neon-purple text-white px-5 py-2 rounded-lg hover:shadow-glow hover:shadow-neon-pink/50 transition-all font-bold">
          Войти / Регистрация
        </a>
      </div>
    </div>
  </header>
  

  <section className="py-16 md:py-24 px-6 text-center relative overflow-hidden">
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-10 left-1/4 w-48 h-48 bg-neon-pink rounded-full filter blur-3xl opacity-10 animate-float"></div>
      <div className="absolute bottom-10 right-1/4 w-48 h-48 bg-neon-blue rounded-full filter blur-3xl opacity-10 animate-float" style={{animationDelay: '2s'}}></div>
      <div className="absolute top-1/3 right-1/3 w-32 h-32 bg-neon-green rounded-full filter blur-3xl opacity-10 animate-float" style={{animationDelay: '4s'}}></div>
    </div>
    <div className="max-w-5xl mx-auto relative z-10">
      <h1 className="text-4xl md:text-6xl font-extrabold mb-6">
        <span className="bg-gradient-to-r from-neon-pink via-neon-purple to-neon-blue bg-clip-text text-transparent">Прокачай</span> себя <br/>как персонажа в игре
      </h1>
      <p className="text-lg md:text-xl text-gray-400 mb-8 leading-relaxed max-w-3xl mx-auto">
        Учи английский, программирование, дизайн и рисование через игровые квесты. Зарабатывай опыт, открывай достижения и становись лучшей версией себя!
      </p>
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <a href="auth.html" className="bg-gradient-to-r from-neon-pink to-neon-purple hover:from-neon-purple hover:to-neon-blue text-white font-bold px-8 py-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-neon-pink/50">
          Начать игру
        </a>
        <a href="#skills" className="border-2 border-neon-blue text-neon-blue hover:bg-neon-blue/10 px-8 py-4 rounded-lg font-bold transition-all duration-300">
          Выбрать навык
        </a>
      </div>
      
      <div className="mt-16 flex justify-center">
        <div className="relative w-64 h-64 md:w-80 md:h-80">
          <div className="absolute inset-0 bg-gradient-to-br from-neon-pink/30 to-neon-blue/30 rounded-2xl rotate-45 blur-md"></div>
          <div className="absolute inset-2 bg-dark-800 rounded-xl border-2 border-neon-purple/50 flex items-center justify-center rotate-0 overflow-hidden">
            <img src="https://images.unsplash.com/photo-1542831371-29b0f74f9713?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" alt="Программирование" className="absolute inset-0 w-full h-full object-cover opacity-70"/>
            <div className="relative z-10 p-4">
              <div className="bg-dark-900/90 backdrop-blur-sm rounded-lg p-4 border border-neon-green/50">
                <h3 className="text-neon-green font-bold mb-2">Новый квест!</h3>
                <p className="text-sm">"Основы Python"</p>
                {/* Исправлено: style как объект */}
                <div className="mt-3 h-2 bg-dark-700 rounded-full overflow-hidden">
                  <div className="h-full bg-neon-green rounded-full" style={{width: '30%'}}></div>
                </div>
                <p className="text-xs mt-1 text-neon-green">+150 XP за прохождение</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  
  <section id="skills" className="py-16 bg-dark-800">
    <div className="container mx-auto px-6">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
          <span className="bg-gradient-to-r from-neon-green to-neon-blue bg-clip-text text-transparent">Навыки</span> для прокачки
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto">Выбери направление развития и начни зарабатывать опыт прямо сейчас</p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">

        <div className="bg-dark-700 p-6 rounded-xl border-2 border-neon-blue/20 hover:border-neon-blue/50 transition-all duration-300 transform hover:-translate-y-2 group">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-neon-blue rounded-lg flex items-center justify-center mx-auto mb-6 shadow-lg shadow-neon-blue/20 group-hover:shadow-neon-blue/40 transition-shadow">
            <FaLanguage className="text-2xl text-white" />
          </div>
          <h3 className="text-xl font-bold text-center mb-3 text-neon-blue">Английский</h3>
          <p className="text-gray-400 text-center mb-4">Изучай язык через игры, сериалы и общение с носителями</p>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Уровень: Новичок-Advanced</span>
            <span className="text-neon-green">+100 XP/урок</span>
          </div>
        </div>

        <div className="bg-dark-700 p-6 rounded-xl border-2 border-neon-green/20 hover:border-neon-green/50 transition-all duration-300 transform hover:-translate-y-2 group">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-neon-green rounded-lg flex items-center justify-center mx-auto mb-6 shadow-lg shadow-neon-green/20 group-hover:shadow-neon-green/40 transition-shadow">
            <FaCode className="text-2xl text-white" />
          </div>
          <h3 className="text-xl font-bold text-center mb-3 text-neon-green">Программирование</h3>
          <p className="text-gray-400 text-center mb-4">Python, JavaScript, HTML/CSS - создавай реальные проекты</p>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Уровень: От нуля до PRO</span>
            <span className="text-neon-green">+200 XP/проект</span>
          </div>
        </div>
        

        <div className="bg-dark-700 p-6 rounded-xl border-2 border-neon-pink/20 hover:border-neon-pink/50 transition-all duration-300 transform hover:-translate-y-2 group">
          <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-neon-pink rounded-lg flex items-center justify-center mx-auto mb-6 shadow-lg shadow-neon-pink/20 group-hover:shadow-neon-pink/40 transition-shadow">
            <FaPaintBrush className="text-2xl text-white" />
          </div>
          <h3 className="text-xl font-bold text-center mb-3 text-neon-pink">Дизайн</h3>
          <p className="text-gray-400 text-center mb-4">Photoshop, Figma, Illustrator - создавай крутые дизайны</p>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Уровень: Основы до профи</span>
            <span className="text-neon-green">+150 XP/работа</span>
          </div>
        </div>

        <div className="bg-dark-700 p-6 rounded-xl border-2 border-neon-purple/20 hover:border-neon-purple/50 transition-all duration-300 transform hover:-translate-y-2 group">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-neon-purple rounded-lg flex items-center justify-center mx-auto mb-6 shadow-lg shadow-neon-purple/20 group-hover:shadow-neon-purple/40 transition-shadow">
            <FaPalette className="text-2xl text-white" />
          </div>
          <h3 className="text-xl font-bold text-center mb-3 text-neon-purple">Рисование</h3>
          <p className="text-gray-400 text-center mb-4">Digital art, скетчинг, анимация - развивай креативность</p>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Уровень: От основ до ART</span>
            <span className="text-neon-green">+120 XP/рисунок</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section id="game" className="py-16 bg-dark-900">
    <div className="container mx-auto px-6">
      <div className="flex flex-col lg:flex-row items-center gap-12 max-w-6xl mx-auto">
        <div className="lg:w-1/2">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-6">
            <span className="bg-gradient-to-r from-neon-yellow to-neon-pink bg-clip-text text-transparent">Игровая</span> система мотивации
          </h2>
          <p className="text-gray-400 mb-6 leading-relaxed">
            Мы превратили обучение в увлекательную RPG-игру, где ты прокачиваешь не виртуального, а реального персонажа — себя!
          </p>
          
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1 mr-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center text-white">
                  <FaTrophy />
                </div>
              </div>
              <div>
                <h4 className="font-bold text-lg mb-1">Уровни и достижения</h4>
                <p className="text-gray-400">Повышай уровень, открывай ачивки и получай награды за реальные успехи в обучении.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1 mr-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-neon-pink to-neon-yellow flex items-center justify-center text-white">
                  <FaGem />
                </div>
              </div>
              <div>
                <h4 className="font-bold text-lg mb-1">Внутренняя валюта</h4>
                <p className="text-gray-400">Зарабатывай монеты и покупай полезные ресурсы.</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="lg:w-1/2 relative">
          <div className="bg-dark-800 border-2 border-neon-purple/30 rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-neon-pink to-neon-purple flex items-center justify-center text-white font-bold mr-3">
                  LVL
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">Твой уровень</div>
                  <div className="text-xl font-bold">14</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-400">Опыт</div>
                <div className="text-xl font-bold text-neon-green">1,240/2,000</div>
              </div>
            </div>
            
            <div className="mb-6">
              {/* Исправлено: style как объект */}
              <div className="h-3 bg-dark-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-neon-pink to-neon-purple rounded-full" style={{width: '62%'}}></div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-dark-700 rounded-lg p-3 border border-dark-600">
                <div className="text-xs text-gray-400 mb-1">Монеты</div>
                <div className="flex items-center">
                  <FaCoins className="text-neon-yellow mr-2" />
                  <span className="font-bold">1,450</span>
                </div>
              </div>
              <div className="bg-dark-700 rounded-lg p-3 border border-dark-600">
                <div className="text-xs text-gray-400 mb-1">Дней подряд</div>
                <div className="flex items-center">
                  <FaFire className="text-neon-pink mr-2" />
                  <span className="font-bold">8</span>
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <h4 className="font-bold mb-3 text-neon-blue">Последние достижения</h4>
              <div className="space-y-3">
                <div className="flex items-center bg-dark-700/50 rounded-lg p-2 border-l-4 border-neon-green">
                  <div className="w-8 h-8 rounded bg-gradient-to-br from-neon-green to-green-700 flex items-center justify-center text-white mr-3">
                    <FaCheck className="text-xs" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">Первый код на Python</div>
                    <div className="text-xs text-gray-400">+50 XP</div>
                  </div>
                </div>
                <div className="flex items-center bg-dark-700/50 rounded-lg p-2 border-l-4 border-neon-blue">
                  <div className="w-8 h-8 rounded bg-gradient-to-br from-neon-blue to-blue-700 flex items-center justify-center text-white mr-3">
                    <FaCheck className="text-xs" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">7 дней английского</div>
                    <div className="text-xs text-gray-400">+70 XP</div>
                  </div>
                </div>
              </div>
            </div>
            
            <button className="w-full bg-gradient-to-r from-neon-purple to-neon-blue text-white py-2 rounded-lg font-bold hover:shadow-lg hover:shadow-neon-purple/30 transition-all">
              Продолжить обучение
            </button>
          </div>
          
          <div className="absolute -z-10 inset-0 bg-gradient-to-br from-neon-purple/10 to-neon-blue/10 rounded-2xl blur-xl opacity-70"></div>
        </div>
      </div>
    </div>
  </section>
  
  <footer className="bg-dark-900 border-t border-dark-800 py-12">
    <div className="container mx-auto px-6">
      <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
        <div className="md:col-span-2">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center">
              <img src="image/lotos.png"/>
            </div>
            <span className="text-xl font-extrabold bg-gradient-to-r from-neon-pink to-neon-purple bg-clip-text text-transparent">РЕИНКАРНАЦИЯ</span>
          </div>
          <p className="text-gray-500 mb-4">Игровое образовательное сообщество для поколения Z. Прокачивай навыки, зарабатывай опыт и становись лучшей версией себя!</p>
          <div className="flex space-x-4">
            <a href="#" className="text-gray-500 hover:text-neon-pink transition">
              <FaVk className="text-xl" />
            </a>
            <a href="#" className="text-gray-500 hover:text-neon-blue transition">
              <FaTelegram className="text-xl" />
            </a>
            <a href="#" className="text-gray-500 hover:text-neon-pink transition">
              <FaInstagram className="text-xl" />
            </a>
            <a href="#" className="text-gray-500 hover:text-neon-red transition">
              <FaYoutube className="text-xl" />
            </a>
          </div>
        </div>
        <div>
          <h4 className="text-lg font-bold mb-4 text-gray-300">Навыки</h4>
          <ul className="space-y-2">
            <li><a href="#" className="text-gray-500 hover:text-neon-blue transition">Английский язык</a></li>
            <li><a href="#" className="text-gray-500 hover:text-neon-green transition">Программирование</a></li>
            <li><a href="#" className="text-gray-500 hover:text-neon-pink transition">Дизайн</a></li>
            <li><a href="#" className="text-gray-500 hover:text-neon-purple transition">Рисование</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-lg font-bold mb-4 text-gray-300">Контакты</h4>
          <ul className="space-y-2 text-gray-500">
            <li className="flex items-start">
              <FaEnvelope className="mt-1 mr-2" />
              <span>game@reincarnation.ru</span>
            </li>
            <li className="flex items-start">
              <FaPhoneAlt className="mt-1 mr-2" />
              <span>+7 (XXX) XXX-XX-XX</span>
            </li>
            <li className="flex items-start">
              <FaMapMarkerAlt className="mt-1 mr-2" />
              <span>Москва, Онлайн</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-dark-800 mt-12 pt-8 text-center text-gray-600 text-sm">
        <p>© 2025 Реинкарнация — Игровое образовательное сообщество. Все права защищены.</p>
      </div>
    </div>
  </footer>
</body>
  );
};

export default MainPage;