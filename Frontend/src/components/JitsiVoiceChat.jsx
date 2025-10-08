// src/components/JitsiVoiceChat.jsx
import React, { useEffect, useRef, useState } from 'react';

const JitsiVoiceChat = ({ roomId = 'coding-session-default', username = 'User' }) => {
  const jitsiContainerRef = useRef(null);
  const jitsiApiRef = useRef(null);
  const [isJitsiLoaded, setIsJitsiLoaded] = useState(false);

  // Состояния для перетаскивания
  const [position, setPosition] = useState({ x: window.innerWidth - 350, y: window.innerHeight - 450 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Логика перетаскивания
  const handleDragStart = (e) => {
    if (e.target.closest('.draggable-handle')) {
      setIsDragging(true);
      const rect = jitsiContainerRef.current.getBoundingClientRect();
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

    return () => {
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
    };
  }, [isDragging, dragOffset]);

  // Загрузка Jitsi API
  useEffect(() => {
    // Проверяем, загружен ли уже API
    if (window.JitsiMeetExternalAPI) {
      setIsJitsiLoaded(true);
      return;
    }

    // Создаем и добавляем скрипт Jitsi
    const script = document.createElement('script');
    script.src = 'https://meet.jit.si/external_api.js';
    script.async = true;
    script.onload = () => {
      console.log('Jitsi Meet API loaded');
      setIsJitsiLoaded(true);
    };
    script.onerror = () => {
      console.error('Failed to load Jitsi Meet API');
    };
    
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
      // Уничтожаем инстанс Jitsi при размонтировании
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
      }
    };
  }, []);

  // Инициализация Jitsi Meet
  useEffect(() => {
    if (!isJitsiLoaded || !jitsiContainerRef.current) return;

    // Если инстанс уже существует, уничтожаем его
    if (jitsiApiRef.current) {
      jitsiApiRef.current.dispose();
    }

    // Опции для Jitsi
    const options = {
      roomName: roomId,
      width: '100%',
      height: '100%',
      parentNode: jitsiContainerRef.current,
      configOverwrite: {
        startWithAudioMuted: true,
        startWithVideoMuted: true,
        disableDeepLinking: true,
        prejoinPageEnabled: false,
        disableInviteFunctions: true,
        disableThirdPartyRequests: true,
      },
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        SHOW_BRAND_WATERMARK: false,
        SHOW_POWERED_BY: false,
        DISPLAY_WELCOME_PAGE_CONTENT: false,
        APP_NAME: 'Реинкарнация',
        LANG_DETECTION: false,
        TOOLBAR_BUTTONS: [
          'microphone', 'camera', 'desktop', 'fullscreen',
          'fodeviceselection', 'hangup', 'profile', 'chat',
          'settings', 'raisehand', 'videoquality', 'filmstrip',
          'feedback', 'stats', 'shortcuts', 'tileview'
        ],
      },
      userInfo: {
        displayName: username
      }
    };

    try {
      // Создаем инстанс Jitsi
      jitsiApiRef.current = new window.JitsiMeetExternalAPI('meet.jit.si', options);
      
      // Добавляем обработчики событий
      jitsiApiRef.current.on('videoConferenceJoined', () => {
        console.log('Jitsi: Присоединился к конференции');
      });

      jitsiApiRef.current.on('videoConferenceLeft', () => {
        console.log('Jitsi: Покинул конференцию');
      });

      jitsiApiRef.current.on('participantJoined', (participant) => {
        console.log('Jitsi: Участник присоединился', participant);
      });

      jitsiApiRef.current.on('participantLeft', (participant) => {
        console.log('Jitsi: Участник покинул', participant);
      });

    } catch (error) {
      console.error('Ошибка инициализации Jitsi Meet:', error);
    }

    // Очистка при размонтировании или изменении зависимостей
    return () => {
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
        jitsiApiRef.current = null;
      }
    };
  }, [isJitsiLoaded, roomId, username]);

  return (
    <div
      ref={jitsiContainerRef}
      className="fixed bg-dark-800 rounded-xl border border-dark-700 shadow-2xl z-50 cursor-move"
      style={{
        width: '20rem',
        height: '25rem',
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
      onMouseDown={handleDragStart}
    >
      {/* Заголовок с классом draggable-handle */}
      <div className="draggable-handle p-3 border-b border-dark-700 flex items-center justify-between cursor-move">
        <div className="flex items-center">
          <i className="fas fa-microphone mr-2 text-neon-blue"></i>
          <span className="font-medium">Голосовой чат</span>
        </div>
        <button 
          className="text-gray-400 hover:text-white"
          onClick={() => {
            if (jitsiApiRef.current) {
              jitsiApiRef.current.executeCommand('hangup');
              jitsiApiRef.current.dispose();
            }
          }}
        >
          <i className="fas fa-times"></i>
        </button>
      </div>

      {/* Контейнер для Jitsi Meet */}
      <div className="p-3 h-full">
        {!isJitsiLoaded ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-400">Загрузка голосового чата...</div>
          </div>
        ) : (
          <div id="jitsi-meet-container" className="w-full h-full rounded-lg overflow-hidden">
            {/* Jitsi будет встроен сюда */}
          </div>
        )}
      </div>
    </div>
  );
};

export default JitsiVoiceChat;