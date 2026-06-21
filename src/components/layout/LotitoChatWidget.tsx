'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation, useMotionValue } from 'framer-motion';
import { useLotitoAgent } from '@/context/LotitoAgentContext';
import { LotusCharacter } from '@/components/tutorial/LotusCharacter';
import { X, Send, Sparkles, Calendar, Bell, Scissors } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

export function LotitoChatWidget() {
  const { isOpen, closeChat, toggleChat, messages, sendMessage, isTyping } = useLotitoAgent();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Lógica de arrastre magnético para Lotito
  const dragControls = useAnimation();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [fabPos, setFabPos] = useState({ isRight: true, bottom: 32 });

  useEffect(() => {
    dragControls.start({ scale: 1, opacity: 1 });
  }, [dragControls]);

  const handleDragEnd = (e: any, info: any) => {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const isRight = info.point.x > windowWidth / 2;
    const newBottom = Math.min(
      windowHeight - 100,
      Math.max(32, windowHeight - info.point.y - 32)
    );

    setFabPos({ isRight, bottom: newBottom });
    x.set(0);
    y.set(0);

    dragControls.start({
      rotate: isRight ? [0, 360] : [0, -360],
      scale: [1, 0.8, 1.2, 1],
      transition: { duration: 0.5, type: "spring", stiffness: 300 }
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      sendMessage(inputText.trim());
      setInputText('');
    }
  };

  const handleActionClick = (action: string) => {
    sendMessage(`Quiero ${action}`);
    
    // Simulate actions based on the clicked button
    setTimeout(() => {
      if (action === 'agendar cita') {
        if (pathname !== '/calendar') {
          router.push('/calendar');
        }
        // Ideally we would open a modal here, but navigating to calendar is step 1
      }
    }, 1500);
  };

  return (
    <>
      {/* Botón flotante permanente */}
      <motion.button
        drag
        dragMomentum={false}
        style={{
          x,
          y,
          bottom: fabPos.bottom,
          right: fabPos.isRight ? '2rem' : 'auto',
          left: fabPos.isRight ? 'auto' : '2rem'
        }}
        animate={dragControls}
        onDragEnd={handleDragEnd}
        onClick={toggleChat}
        className="fixed z-50 bg-surface-container-lowest border border-primary/20 shadow-[0_8px_30px_rgba(212,175,55,0.15)] rounded-full p-1.5 transition-colors group cursor-grab active:cursor-grabbing"
        aria-label="Abrir asistente Lotito"
      >
        <div className="relative w-14 h-14 bg-surface-container rounded-full flex items-center justify-center overflow-hidden">
          <div className="scale-[0.8] mt-4">
            <LotusCharacter isHappy={isOpen} />
          </div>
          <div className="absolute inset-0 bg-gradient-to-tr from-accent-gold-primary/10 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-gold-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-accent-gold-primary border-2 border-surface-container-lowest"></span>
          </span>
        )}
      </motion.button>

      {/* Panel del Chat */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            style={{
              bottom: '5rem',
              right: fabPos.isRight ? '1.5rem' : 'auto',
              left: fabPos.isRight ? 'auto' : '1.5rem'
            }}
            className="fixed z-50 w-[calc(100vw-3rem)] md:w-96 max-h-[600px] h-[70vh] bg-surface-container-lowest/95 backdrop-blur-2xl border border-primary/20 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-surface-variant/30 border-b border-primary/10 p-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center overflow-hidden relative border border-primary/10">
                  <div className="scale-[0.6] mt-4">
                    <LotusCharacter isHappy={true} />
                  </div>
                </div>
                <div>
                  <h3 className="font-serif font-bold text-primary leading-none flex items-center gap-1.5">
                    Lotito <Sparkles className="w-3 h-3 text-accent-gold-primary" />
                  </h3>
                  <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-semibold mt-1">
                    IA en Entrenamiento
                  </p>
                </div>
              </div>
              <button
                onClick={closeChat}
                className="text-on-surface-variant hover:text-on-surface p-2 rounded-full hover:bg-surface-variant/50 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 no-scrollbar">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col max-w-[85%] ${
                    msg.sender === 'user' ? 'self-end items-end' : 'self-start items-start'
                  }`}
                >
                  <div
                    className={`p-3.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.sender === 'user'
                        ? 'bg-primary text-on-primary rounded-tr-sm'
                        : 'bg-surface-container-high text-on-surface rounded-tl-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-on-surface-variant/50 mt-1.5 px-1 font-medium uppercase tracking-wider">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>

                  {/* Sugerencias de acciones solo en el último mensaje de Lotito si es accionable */}
                  {msg.sender === 'lotito' && msg.isActionable && msg.id === messages[messages.length - 1]?.id && (
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col gap-2 mt-3 w-full"
                    >
                      <button onClick={() => handleActionClick('agendar cita')} className="flex items-center gap-2 text-xs font-semibold bg-surface-variant/30 hover:bg-primary/10 border border-primary/20 text-primary px-3 py-2 rounded-xl transition-colors">
                        <Calendar className="w-3.5 h-3.5" />
                        Agendar Nueva Cita
                      </button>
                      <button onClick={() => handleActionClick('cancelar una cita')} className="flex items-center gap-2 text-xs font-semibold bg-surface-variant/30 hover:bg-primary/10 border border-primary/20 text-primary px-3 py-2 rounded-xl transition-colors">
                        <X className="w-3.5 h-3.5" />
                        Cancelar Cita
                      </button>
                      <button onClick={() => handleActionClick('enviar recordatorios')} className="flex items-center gap-2 text-xs font-semibold bg-surface-variant/30 hover:bg-primary/10 border border-primary/20 text-primary px-3 py-2 rounded-xl transition-colors">
                        <Bell className="w-3.5 h-3.5" />
                        Enviar Recordatorios
                      </button>
                    </motion.div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="self-start bg-surface-container-high rounded-2xl rounded-tl-sm p-3.5 flex gap-1.5 items-center">
                  <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 border-t border-primary/10 bg-surface-container-lowest shrink-0">
              <form onSubmit={handleSend} className="relative flex items-center">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Escribe una instrucción..."
                  className="w-full bg-surface-container text-sm text-on-surface rounded-xl pl-4 pr-12 py-3 outline-none focus:ring-1 focus:ring-primary/30 transition-all placeholder:text-on-surface-variant/40"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || isTyping}
                  className="absolute right-2 p-1.5 bg-primary text-on-primary rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
              <div className="text-center mt-2">
                <span className="text-[9px] text-on-surface-variant/50 uppercase tracking-widest font-semibold">
                  Lotito v0.1 (Fase de Aprendizaje)
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
