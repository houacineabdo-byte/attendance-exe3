import { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, CameraOff, SwitchCamera } from 'lucide-react';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  isActive: boolean;
  onToggle: () => void;
}

export function BarcodeScanner({ onScan, isActive, onToggle }: BarcodeScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isRunningRef = useRef<boolean>(false);
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const lastScannedRef = useRef<string>('');
  const lastScanTimeRef = useRef<number>(0);

  // Safely stop the scanner
  const stopScanner = useCallback(async () => {
    if (scannerRef.current && isRunningRef.current) {
      try {
        await scannerRef.current.stop();
        isRunningRef.current = false;
      } catch (err) {
        console.log('Scanner already stopped or not running');
        isRunningRef.current = false;
      }
    }
  }, []);

  // Initialize cameras on mount
  useEffect(() => {
    let mounted = true;

    Html5Qrcode.getCameras()
      .then((devices) => {
        if (!mounted) return;
        if (devices && devices.length > 0) {
          setCameras(devices);
          setError(null);
          setIsInitialized(true);
        } else {
          setError('No cameras found on this device');
        }
      })
      .catch((err) => {
        if (!mounted) return;
        console.error('Error getting cameras:', err);
        setError('Unable to access camera. Please grant camera permissions.');
      });

    return () => {
      mounted = false;
      stopScanner();
    };
  }, [stopScanner]);

  // Start scanner function
  const startScanner = useCallback(async () => {
    if (!cameras.length || !isInitialized) return;

    try {
      // Stop any existing scanner first
      await stopScanner();

      // Create new scanner instance if needed
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode('barcode-reader');
      }

      await scannerRef.current.start(
        cameras[currentCameraIndex].id,
        {
          fps: 10,
          qrbox: { width: 250, height: 150 },
          aspectRatio: 1.5,
        },
        (decodedText) => {
          const now = Date.now();
          // Prevent duplicate scans within 2 seconds
          if (decodedText !== lastScannedRef.current || now - lastScanTimeRef.current > 2000) {
            lastScannedRef.current = decodedText;
            lastScanTimeRef.current = now;
            onScan(decodedText);
          }
        },
        () => {
          // QR Code scanning failure - ignore silently
        }
      );
      
      isRunningRef.current = true;
      setError(null);
    } catch (err) {
      console.error('Error starting scanner:', err);
      isRunningRef.current = false;
      setError('Failed to start camera. Please try again.');
    }
  }, [cameras, currentCameraIndex, isInitialized, onScan, stopScanner]);

  // Handle active state changes
  useEffect(() => {
    if (isActive && isInitialized && cameras.length > 0) {
      startScanner();
    } else if (!isActive) {
      stopScanner();
    }
  }, [isActive, isInitialized, cameras.length, startScanner, stopScanner]);

  // Handle camera switch
  const switchCamera = useCallback(async () => {
    if (cameras.length <= 1) return;
    
    await stopScanner();
    setCurrentCameraIndex((prev) => (prev + 1) % cameras.length);
  }, [cameras.length, stopScanner]);

  // Restart scanner when camera index changes
  useEffect(() => {
    if (isActive && isInitialized && cameras.length > 0 && currentCameraIndex >= 0) {
      startScanner();
    }
  }, [currentCameraIndex]);

  return (
    <div className="space-y-4">
      {/* Scanner Controls */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={onToggle}
          className={`flex items-center gap-2 font-semibold py-2.5 px-5 rounded-xl transition-all ${
            isActive
              ? 'bg-destructive text-destructive-foreground hover:opacity-90'
              : 'bg-primary text-primary-foreground hover:opacity-90'
          }`}
        >
          {isActive ? (
            <>
              <CameraOff className="w-5 h-5" />
              إيقاف الكاميرا
            </>
          ) : (
            <>
              <Camera className="w-5 h-5" />
              تشغيل الكاميرا
            </>
          )}
        </button>

        {isActive && cameras.length > 1 && (
          <button
            onClick={switchCamera}
            className="flex items-center gap-2 bg-secondary text-secondary-foreground font-semibold py-2.5 px-4 rounded-xl hover:bg-secondary/80 transition-colors"
          >
            <SwitchCamera className="w-5 h-5" />
            تبديل
          </button>
        )}
      </div>

      {/* Camera View */}
      <div className="relative">
        <div
          id="barcode-reader"
          className={`w-full max-w-md mx-auto rounded-xl overflow-hidden bg-background/50 ${
            isActive ? 'min-h-[280px]' : 'min-h-[100px] flex items-center justify-center'
          }`}
        >
          {!isActive && (
            <div className="text-center text-foreground/60 p-6">
              <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>اضغط على "تشغيل الكاميرا" لبدء المسح</p>
            </div>
          )}
        </div>

        {/* Scanning animation overlay */}
        {isActive && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-[260px] h-[160px] border-2 border-primary rounded-lg relative">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary animate-pulse-soft" />
              <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-primary rounded-tl" />
              <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-primary rounded-tr" />
              <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-primary rounded-bl" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-primary rounded-br" />
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 rounded-lg bg-destructive/20 border border-destructive text-destructive text-sm text-center">
          {error}
        </div>
      )}

      {/* Instructions */}
      {isActive && (
        <p className="text-center text-sm text-foreground/70">
          وجّه الكاميرا نحو الباركود للمسح تلقائياً
        </p>
      )}
    </div>
  );
}
