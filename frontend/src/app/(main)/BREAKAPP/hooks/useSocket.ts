'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { getToken } from '@/lib/auth';

interface UseSocketOptions {
  url?: string;
  autoConnect?: boolean;
  auth?: boolean;
}

export function useSocket(options: UseSocketOptions = {}) {
  const { 
    url = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000', 
    autoConnect = true,
    auth = false 
  } = options;
  
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!autoConnect) return;

    // إعداد خيارات الاتصال
    const socketOptions: any = {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    };

    // إضافة التوثيق (Authentication) إذا كان مطلوبًا
    if (auth) {
      const token = getToken();
      if (token) {
        socketOptions.auth = { token };
      }
    }

    // إنشاء اتصال المقبس (Socket)
    const socket = io(url, socketOptions);

    socketRef.current = socket;

    // معالجات أحداث الاتصال
    socket.on('connect', () => {
      console.log('تم الاتصال بالمقبس (Socket):', socket.id);
      setConnected(true);
      setError(null);
    });

    socket.on('disconnect', (reason) => {
      console.log('تم قطع الاتصال بالمقبس:', reason);
      setConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.error('خطأ في الاتصال بالمقبس:', err);
      setError(err.message);
      setConnected(false);
    });

    socket.on('error', (err) => {
      console.error('خطأ في المقبس:', err);
      setError(err);
    });

    // التنظيف عند إلغاء التحميل
    return () => {
      socket.disconnect();
    };
  }, [url, autoConnect, auth]);

  const emit = (event: string, data: any) => {
    if (socketRef.current && connected) {
      socketRef.current.emit(event, data);
    } else {
      console.warn('لا يمكن إرسال البيانات: المقبس غير متصل');
    }
  };

  const on = (event: string, handler: (...args: any[]) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, handler);
    }
  };

  const off = (event: string, handler?: (...args: any[]) => void) => {
    if (socketRef.current) {
      if (handler) {
        socketRef.current.off(event, handler);
      } else {
        socketRef.current.off(event);
      }
    }
  };

  const connect = () => {
    if (socketRef.current && !connected) {
      socketRef.current.connect();
    }
  };

  const disconnect = () => {
    if (socketRef.current && connected) {
      socketRef.current.disconnect();
    }
  };

  return {
    socket: socketRef.current,
    connected,
    error,
    emit,
    on,
    off,
    connect,
    disconnect,
  };
}
