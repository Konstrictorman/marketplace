"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const STORAGE_KEY = "mp_notifications";

export type NotificationType = "purchase" | "message" | "order" | "review";

export type AppNotification = {
  id: string;
  message: string;
  type: NotificationType;
  createdAt: string;
};

type NotificationsContextType = {
  notifications: AppNotification[];
  addNotification: (message: string, type: NotificationType) => void;
  dismiss: (id: string) => void;
  dismissAll: () => void;
};

const NotificationsContext = createContext<NotificationsContextType | null>(
  null,
);

export function NotificationsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const run = async () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) setNotifications(JSON.parse(stored) as AppNotification[]);
      } catch {
        // corrupted storage — start fresh
      }
    };
    void run();
  }, []);

  // Persist to localStorage whenever list changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  }, [notifications]);

  const addNotification = useCallback(
    (message: string, type: NotificationType) => {
      const notification: AppNotification = {
        id: crypto.randomUUID(),
        message,
        type,
        createdAt: new Date().toISOString(),
      };
      setNotifications((prev) => [notification, ...prev]);
    },
    [],
  );

  const dismiss = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationsContext.Provider
      value={{ notifications, addNotification, dismiss, dismissAll }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx)
    throw new Error(
      "useNotifications must be used inside NotificationsProvider",
    );
  return ctx;
}
