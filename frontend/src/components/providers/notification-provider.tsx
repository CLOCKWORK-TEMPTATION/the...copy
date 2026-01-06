"use client"

import { createContext, useContext, useState, useCallback, ReactNode } from "react"

/**
 * Notification Types
 */
export type NotificationType = "success" | "error" | "warning" | "info"

export interface Notification {
  id: string
  message: string
  type: NotificationType
  duration?: number
}

/**
 * Notification Context
 */
interface NotificationContextType {
  notifications: Notification[]
  showNotification: (message: string, type?: NotificationType, duration?: number) => void
  removeNotification: (id: string) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

/**
 * Notification Provider Component
 * Manages global notification state
 */
export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const showNotification = useCallback(
    (message: string, type: NotificationType = "info", duration = 5000) => {
      const id = Math.random().toString(36).substring(7)
      const notification: Notification = { id, message, type, duration }

      setNotifications((prev) => [...prev, notification])

      // Auto-remove after duration
      if (duration > 0) {
        setTimeout(() => {
          removeNotification(id)
        }, duration)
      }
    },
    []
  )

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  return (
    <NotificationContext.Provider
      value={{ notifications, showNotification, removeNotification }}
    >
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-4 rounded-lg shadow-lg text-white min-w-72 animate-in slide-in-from-right-5 fade-in duration-300 ${
              notification.type === "success"
                ? "bg-green-600"
                : notification.type === "error"
                  ? "bg-red-600"
                  : notification.type === "warning"
                    ? "bg-yellow-600"
                    : "bg-blue-600"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium">{notification.message}</p>
              <button
                onClick={() => removeNotification(notification.id)}
                className="text-white/80 hover:text-white"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  )
}

/**
 * Hook to use notifications
 */
export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider")
  }
  return context
}
