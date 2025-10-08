import React, { useState, useRef, useEffect } from 'react';

const DraggableVoiceChat = () => {
  // Состояния для перетаскивания
  const [position, setPosition] = useState({ x: window.innerWidth - 300, y: window.innerHeight - 400 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const voiceChatRef = useRef(null);

  // Логика перетаскивания
  const handleDragStart = (e) => {
    // Проверяем, было ли нажатие на "заголовок" (элемент с классом draggable-handle)
    if (e.target.closest('.draggable-handle')) {
      setIsDragging(true);
      const rect = voiceChatRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleDragMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      });
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // Эффекты для событий мыши
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('mouseup', handleDragEnd);
    } else {
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
    }

    // Функция очистки
    return () => {
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
    };
  }, [isDragging, dragOffset]);

  return (
    <div
      ref={voiceChatRef}
      className="fixed bg-dark-800 rounded-xl border border-dark-700 shadow-2xl z-50 cursor-move"
      style={{
        width: '18rem', // w-72 = 18rem
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
      onMouseDown={handleDragStart}
    >
      {/* Заголовок с классом draggable-handle */}
      <div className="draggable-handle p-3 border-b border-dark-700 flex items-center justify-between cursor-move">
        <div className="flex items-center">
          <i className="fas fa-microphone mr-2 text-neon-blue"></i>
          <span className="font-medium">Кодинг-сессия</span>
        </div>
        <button className="text-gray-400 hover:text-white">
          <i className="fas fa-times"></i>
        </button>
      </div>

      <div className="p-3">
        <div className="space-y-3">
          <div className="flex items-center">
            <div className="relative">
              <img src="https://via.placeholder.com/40" alt="Аватар" className="w-10 h-10 rounded-full border-2 border-neon-purple"/>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-neon-green rounded-full border-2 border-dark-800"></div>
            </div>
            <div className="ml-3 flex-1">
              <div className="font-medium">Dev_Guru</div>
              <div className="text-xs text-gray-400 flex items-center">
                <i className="fas fa-microphone mr-1 text-neon-green"></i>
                Говорит
              </div>
            </div>
            <div className="flex space-x-2">
              <button className="w-8 h-8 rounded-full bg-dark-700 flex items-center justify-center text-gray-400 hover:text-neon-pink">
                <i className="fas fa-volume-up"></i>
              </button>
            </div>
          </div>

          <div className="flex items-center">
            <div className="relative">
              <img src="https://via.placeholder.com/40" alt="Аватар" className="w-10 h-10 rounded-full border-2 border-neon-blue"/>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-neon-green rounded-full border-2 border-dark-800"></div>
            </div>
            <div className="ml-3 flex-1">
              <div className="font-medium">Python_Pro</div>
              <div className="text-xs text-gray-400 flex items-center">
                <i className="fas fa-headphones mr-1"></i>
                Включен звук
              </div>
            </div>
            <div className="flex space-x-2">
              <button className="w-8 h-8 rounded-full bg-dark-700 flex items-center justify-center text-gray-400 hover:text-neon-pink">
                <i className="fas fa-volume-up"></i>
              </button>
            </div>
          </div>

          <div className="flex items-center">
            <div className="relative">
              <img src="https://via.placeholder.com/40" alt="Аватар" className="w-10 h-10 rounded-full border-2 border-neon-blue"/>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-neon-green rounded-full border-2 border-dark-800"></div>
            </div>
            <div className="ml-3 flex-1">
              <div className="font-medium">Игрок123</div>
              <div className="text-xs text-gray-400 flex items-center">
                <i className="fas fa-microphone-slash mr-1 text-red-500"></i>
                Вы отключены
              </div>
            </div>
            <div className="flex space-x-2">
              <button className="w-8 h-8 rounded-full bg-dark-700 flex items-center justify-center text-gray-400 hover:text-neon-pink">
                <i className="fas fa-cog"></i>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-dark-700 flex items-center justify-between">
          <button className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white hover:bg-red-600 transition">
            <i className="fas fa-phone-slash"></i>
          </button>
          <div className="flex space-x-3">
            <button className="w-10 h-10 rounded-full bg-dark-700 flex items-center justify-center text-gray-400 hover:text-white hover:bg-dark-600">
              <i className="fas fa-microphone-slash"></i>
            </button>
            <button className="w-10 h-10 rounded-full bg-dark-700 flex items-center justify-center text-gray-400 hover:text-white hover:bg-dark-600">
              <i className="fas fa-headphones"></i>
            </button>
            <button className="w-10 h-10 rounded-full bg-dark-700 flex items-center justify-center text-gray-400 hover:text-white hover:bg-dark-600">
              <i className="fas fa-video"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DraggableVoiceChat;