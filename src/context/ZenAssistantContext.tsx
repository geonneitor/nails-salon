'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type ContextualMessage = {
  title: string;
  content: string;
  tip?: string;
  actionRequired?: boolean; // If true, shows a pulse indicating they need to do something
  targetSelector?: string; // CSS selector for the element to point to
  isHappy?: boolean;
  options?: {
    label: string;
    onClick: () => void;
    primary?: boolean;
  }[];
};

const TOUR_COMPLETED_KEY = 'zen-assistant-completed';

interface ZenAssistantContextType {
  isActive: boolean;
  message: ContextualMessage | null;
  startTour: () => void;
  closeTour: () => void;
  setContextMessage: (msg: ContextualMessage | null) => void;
  hasCompletedTour: boolean;
  resetTour: () => void;
}

const ZenAssistantContext = createContext<ZenAssistantContextType | undefined>(undefined);

export function ZenAssistantProvider({ children }: { children: React.ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [message, setMessage] = useState<ContextualMessage | null>(null);
  const [hasCompletedTour, setHasCompletedTour] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const completed = localStorage.getItem(TOUR_COMPLETED_KEY) === 'true';
      setHasCompletedTour(completed);
    } catch {
      // Ignore
    } finally {
      setHydrated(true);
    }
  }, []);

  const startTour = React.useCallback(() => {
    setIsActive(true);
  }, []);

  const closeTour = React.useCallback(() => {
    setIsActive(false);
    try {
      localStorage.setItem(TOUR_COMPLETED_KEY, 'true');
    } catch {
      // Ignore
    }
    setHasCompletedTour(true);
  }, []);

  const setContextMessage = React.useCallback((msg: ContextualMessage | null) => {
    setMessage(msg);
  }, []);

  const resetTour = React.useCallback(() => {
    try {
      localStorage.removeItem(TOUR_COMPLETED_KEY);
    } catch {}
    setHasCompletedTour(false);
  }, []);

  const value = {
    isActive,
    message,
    startTour,
    closeTour,
    setContextMessage,
    hasCompletedTour: hydrated ? hasCompletedTour : false,
    resetTour,
  };

  return (
    <ZenAssistantContext.Provider value={value}>
      {children}
    </ZenAssistantContext.Provider>
  );
}

export function useZenAssistant() {
  const context = useContext(ZenAssistantContext);
  if (!context) {
    throw new Error('useZenAssistant must be used within a ZenAssistantProvider');
  }
  return context;
}
