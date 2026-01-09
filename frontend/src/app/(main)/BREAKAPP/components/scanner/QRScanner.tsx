'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface QRScannerProps {
  onScan: (decodedText: string) => void;
  onError?: (error: string) => void;
}

export default function QRScanner({ onScan, onError }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const elementId = 'qr-scanner-region';

  useEffect(() => {
    return () => {
      // Cleanup scanner on unmount
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const startScanning = async () => {
    try {
      setError(null);
      
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(elementId);
      }

      await scannerRef.current.start(
        { facingMode: 'environment' }, // Use back camera
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // QR code successfully scanned
          onScan(decodedText);
          stopScanning();
        },
        (errorMessage) => {
          // Scanning errors happen frequently during scanning process
          // Only log in development mode
          if (process.env.NODE_ENV === 'development') {
            console.debug('Scan attempt:', errorMessage);
          }
        }
      );

      setIsScanning(true);
    } catch (err: any) {
      const errorMsg = err?.message || 'Failed to start camera';
      setError(errorMsg);
      if (onError) onError(errorMsg);
    }
  };

  const stopScanning = async () => {
    try {
      if (scannerRef.current?.isScanning) {
        await scannerRef.current.stop();
        setIsScanning(false);
      }
    } catch (err) {
      console.error('Error stopping scanner:', err);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div 
        id={elementId} 
        className="w-full max-w-md rounded-lg overflow-hidden"
        style={{ minHeight: isScanning ? '300px' : '0' }}
      />
      
      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg max-w-md w-full">
          <p className="text-sm font-medium">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="flex gap-4">
        {!isScanning ? (
          <button
            onClick={startScanning}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Start Scanning
          </button>
        ) : (
          <button
            onClick={stopScanning}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Stop Scanning
          </button>
        )}
      </div>

      {isScanning && (
        <div className="text-sm text-gray-600 text-center max-w-md">
          <p>Position the QR code within the frame</p>
          <p className="text-xs mt-1">Make sure the QR code is well-lit and in focus</p>
        </div>
      )}
    </div>
  );
}
