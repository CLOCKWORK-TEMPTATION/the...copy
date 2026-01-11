'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/auth';
import { useSocket } from '@/hooks/useSocket';

interface ConnectionStatus {
  api: 'connected' | 'disconnected' | 'checking';
  socket: 'connected' | 'disconnected' | 'checking';
  apiMessage?: string;
  socketMessage?: string;
}

export default function ConnectionTest() {
  const [status, setStatus] = useState<ConnectionStatus>({
    api: 'checking',
    socket: 'checking',
  });

  const { connected: socketConnected, error: socketError } = useSocket({
    autoConnect: true,
    auth: false,
  });

  // اختبار الاتصال بواجهة برمجة التطبيقات (API)
  useEffect(() => {
    const testApiConnection = async () => {
      try {
        const response = await api.get('/health');
        setStatus(prev => ({
          ...prev,
          api: 'connected',
          apiMessage: 'تم الاتصال بنجاح بالمنصة الأم',
        }));
      } catch (error: any) {
        setStatus(prev => ({
          ...prev,
          api: 'disconnected',
          apiMessage: error?.message || 'فشل الاتصال بالمنصة الأم',
        }));
      }
    };

    testApiConnection();
    
    // اختبار الاتصال كل 30 ثانية
    const interval = setInterval(testApiConnection, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // تحديث حالة المقبس (Socket)
  useEffect(() => {
    if (socketConnected) {
      setStatus(prev => ({
        ...prev,
        socket: 'connected',
        socketMessage: 'تم الاتصال بنجاح بمقبس المنصة الأم',
      }));
    } else if (socketError) {
      setStatus(prev => ({
        ...prev,
        socket: 'disconnected',
        socketMessage: socketError,
      }));
    }
  }, [socketConnected, socketError]);

  const getStatusColor = (state: 'connected' | 'disconnected' | 'checking') => {
    switch (state) {
      case 'connected':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'disconnected':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'checking':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    }
  };

  const getStatusIcon = (state: 'connected' | 'disconnected' | 'checking') => {
    switch (state) {
      case 'connected':
        return '✓';
      case 'disconnected':
        return '✗';
      case 'checking':
        return '⟳';
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        حالة الاتصال بالمنصة الأم
      </h3>
      
      <div className="space-y-4">
        {/* حالة اتصال API */}
        <div className={`p-4 rounded-lg border-2 ${getStatusColor(status.api)}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">واجهة برمجة التطبيقات (API)</span>
            <span className="text-2xl">{getStatusIcon(status.api)}</span>
          </div>
          <p className="text-sm">
            {status.apiMessage || 'جارٍ التحقق من الاتصال...'}
          </p>
          <p className="text-xs mt-2 opacity-75">
            العنوان: {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}
          </p>
        </div>

        {/* حالة اتصال Socket */}
        <div className={`p-4 rounded-lg border-2 ${getStatusColor(status.socket)}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">المقبس (WebSocket)</span>
            <span className="text-2xl">{getStatusIcon(status.socket)}</span>
          </div>
          <p className="text-sm">
            {status.socketMessage || 'جارٍ التحقق من الاتصال...'}
          </p>
          <p className="text-xs mt-2 opacity-75">
            العنوان: {process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000'}
          </p>
        </div>
      </div>
    </div>
  );
}
