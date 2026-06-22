'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import { bellEvents } from '@/lib/notifications/bellEvents';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'lotito';
  text: string;
  timestamp: Date;
  isActionable?: boolean; // Si es un mensaje con botones (como comandos iniciales)
}

interface LotitoAgentContextType {
  isOpen: boolean;
  toggleChat: () => void;
  openChat: () => void;
  closeChat: () => void;
  messages: ChatMessage[];
  sendMessage: (text: string) => void;
  clearHistory: () => void;
  isTyping: boolean;
}

const LotitoAgentContext = createContext<LotitoAgentContextType | undefined>(undefined);

const ZEN_TIPS = [
  "💡 Tip Zen: Mantén el salón impecable, la limpieza visual es parte fundamental de la relajación.",
  "💡 Tip Zen: Sonríe al recibir a cada clienta. Una bienvenida cálida marca la diferencia y fideliza.",
  "💡 Tip Zen: Antes de cerrar, revisa la agenda de mañana para tener los materiales listos.",
  "💡 Tip Zen: Revisa periódicamente el inventario de esmaltes más usados para no quedarte sin stock.",
  "💡 Tip Zen: Una música suave y un buen aroma hacen que el tiempo de espera sea un placer.",
  "💡 Tip Zen: Si tienes un tiempo muerto, aprovecha para acomodar tu estación de trabajo.",
  "💡 Tip Zen: Escuchar activamente a tu clienta te ayudará a saber exactamente qué diseño busca."
];

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-init-1',
    sender: 'lotito',
    text: '¡Hola! Soy Lotito, tu asistente IA de Zen en entrenamiento. 🪷\n\nAún estoy aprendiendo a leer todo lo que escribes, pero ya estoy autorizado para ayudarte a hacer tareas de forma automática. ¿En qué te ayudo hoy?',
    timestamp: new Date(),
    isActionable: true,
  }
];

export function LotitoAgentProvider({ children }: { children: ReactNode }) {
  const { user } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [isTyping, setIsTyping] = useState(false);

  // Actualizar el saludo inicial con el nombre del usuario si está disponible
  useEffect(() => {
    if (user && messages.length === 1 && messages[0].id === 'msg-init-1') {
      const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Administradora';
      const greeting = `¡Hola ${name}! Qué gusto verte. Soy Lotito, tu asistente IA de Zen en entrenamiento. 🪷\n\nAún estoy aprendiendo a leer todo lo que escribes, pero ya estoy autorizado para ayudarte a hacer tareas de forma rápida y segura. ¿En qué te ayudo hoy?`;
      setMessages([{ ...messages[0], text: greeting }]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Ref para el audio
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  // Inicializar audio y pedir permisos
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audioRef.current.volume = 0.4; // Volumen sutil
    }
  }, []);

  const playZenSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.log('Audio autoplay blocked', e));
    }
  }, []);

  const openChat = useCallback(() => {
    setIsOpen(true);
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, []);

  const closeChat = useCallback(() => setIsOpen(false), []);
  const toggleChat = useCallback(() => {
    setIsOpen(prev => {
      if (!prev && typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
      return !prev;
    });
  }, []);

  // Router para navegación
  const router = useRouter();

  const clearHistory = useCallback(() => {
    if (user) {
      const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Administradora';
      const greeting = `¡Hola ${name}! Qué gusto verte. Soy Lotito, tu asistente IA de Zen en entrenamiento. 🪷\n\nAún estoy aprendiendo a leer todo lo que escribes, pero ya estoy autorizado para ayudarte a hacer tareas de forma rápida y segura. ¿En qué te ayudo hoy?`;
      setMessages([{ ...INITIAL_MESSAGES[0], text: greeting }]);
    } else {
      setMessages(INITIAL_MESSAGES);
    }
  }, [user]);

  const sendMessage = useCallback(async (text: string) => {
    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date(),
    };

    // Armamos el nuevo historial de forma síncrona
    const newHistory = [...messages, userMsg];

    // Actualizamos el estado visual
    setMessages(newHistory);
    setIsTyping(true);

    // Función interna para llamar a Groq
    async function fetchApiReply(chatHistory: ChatMessage[]) {
      try {
        const response = await fetch('/api/lotito', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: chatHistory }),
        });

        if (!response.ok) {
          throw new Error('Error en la API');
        }

        const data = await response.json();
        
        const aiMsg: ChatMessage = {
          id: `msg-ai-${Date.now()}`,
          sender: 'lotito',
          text: data.reply || 'No recibí respuesta del servidor.',
          timestamp: new Date(),
          isActionable: true,
        };

        setMessages(prev => [...prev, aiMsg]);
        
        // Ejecución de Herramientas (Tool Calling)
        if (data.toolCalls && data.toolCalls.length > 0) {
          data.toolCalls.forEach((tool: any) => {
            console.log("Lotito ejecutando herramienta:", tool.name, tool.arguments);
            if (tool.name === 'change_theme') {
              const theme = tool.arguments.theme;
              if (theme === 'dark') {
                document.documentElement.classList.add('dark');
                localStorage.setItem('theme', 'dark');
              } else {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('theme', 'light');
              }
            } else if (tool.name === 'navigate_to') {
              router.push(tool.arguments.route);
            } else if (tool.name === 'open_booking_modal') {
              // Si no estamos en el calendario, vamos al calendario primero
              if (window.location.pathname !== '/calendar') {
                router.push('/calendar');
              }
              // Simularemos hacer clic en el botón de agendar después de navegar
              setTimeout(() => {
                const btn = document.querySelector('button[aria-label="Nueva cita"], button:contains("Nueva Cita")') as HTMLButtonElement;
                if (btn) btn.click();
              }, 500);
            }
          });
        }
        
        // Notificación de éxito: Sonido y alerta visual
        playZenSound();
        if (typeof document !== 'undefined' && document.hidden && 'Notification' in window && Notification.permission === 'granted') {
          new Notification('Lotito (Zen Salon)', {
            body: data.reply.length > 50 ? data.reply.substring(0, 50) + '...' : data.reply,
            icon: '/icon.png'
          });
        }

        // Emitir evento al bus de bellEvents (lo consume useNotificationBell).
        bellEvents.emit({
          type: 'lotito_reply',
          payload: {
            title: 'Lotito respondió',
            body:
              data.reply.length > 80 ? data.reply.substring(0, 80) + '...' : data.reply,
            url: '/dashboard',
          },
        });
        
      } catch (error) {
        console.error('Error fetching Lotito API:', error);
        
        // Fallback en caso de que falle la red o la API Key esté mal
        const errorMsg: ChatMessage = {
          id: `msg-err-${Date.now()}`,
          sender: 'lotito',
          text: '¡Uy! Parece que perdí mi conexión con la nube. 🌧️ Mientras me recupero, por favor usa mis botones de acción abajo.',
          timestamp: new Date(),
          isActionable: true,
        };
        setMessages(prev => [...prev, errorMsg]);
      } finally {
        setIsTyping(false);
      }
    }

    // Llamamos a la API fuera del setState para evitar que React Strict Mode la ejecute doble
    fetchApiReply(newHistory);

  }, [messages, playZenSound, router]);

  return (
    <LotitoAgentContext.Provider
      value={{
        isOpen,
        toggleChat,
        openChat,
        closeChat,
        messages,
        sendMessage,
        clearHistory,
        isTyping,
      }}
    >
      {children}
    </LotitoAgentContext.Provider>
  );
}

export function useLotitoAgent() {
  const context = useContext(LotitoAgentContext);
  if (context === undefined) {
    throw new Error('useLotitoAgent must be used within a LotitoAgentProvider');
  }
  return context;
}
