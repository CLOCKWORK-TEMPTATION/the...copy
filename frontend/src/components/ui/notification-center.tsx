"use client"

export type NotificationType = "success" | "error" | "warning" | "info" | "ai"

export interface NotificationAction {
  label: string
  onClick: () => void
}

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message?: string
  duration?: number
  action?: NotificationAction
}

export function NotificationCenter() {
  return null
}

export default NotificationCenter
