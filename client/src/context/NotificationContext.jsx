import { createContext, useContext, useState, useEffect } from "react";
import { api } from "../services/api";
import { useAuth } from "./AuthContext";
import { getSocket } from "../services/socket";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (user) {
      loadNotifications();
      setupSocket();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user]);

  const loadNotifications = async () => {
    try {
      const res = await api.getNotifications();
      if (res.success) {
        setNotifications(res.notifications);
        setUnreadCount(res.unreadCount);
      }
    } catch (e) {
      // ignore
    }
  };

  const setupSocket = () => {
    try {
      const socket = getSocket();
      socket.emit("register_user", user._id);

      socket.on("new_notification", (notif) => {
        setToast(notif);
        setUnreadCount((c) => c + 1);
        setNotifications((prev) => [
          {
            _id: `notif_${Date.now()}`,
            ...notif,
            read: false,
            createdAt: new Date().toISOString()
          },
          ...prev
        ]);
        setTimeout(() => setToast(null), 5000);
      });
    } catch (e) {
      // ignore
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (e) {}
  };

  const markAllAsRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (e) {}
  };

  const showToast = (message, title = "Alert") => {
    setToast({ title, message });
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        toast,
        markAsRead,
        markAllAsRead,
        showToast,
        refreshNotifications: loadNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);
