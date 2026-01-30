import { useState, useRef, useEffect } from 'react';
import { ScanResult } from '@/types/attendance';
import { ScanBarcode, CheckCircle2, AlertTriangle, XCircle, Keyboard } from 'lucide-react';
import { BarcodeScanner } from './BarcodeScanner';

interface ScanInputProps {
  onScan: (barcode: string) => ScanResult;
}

export function ScanInput({ onScan }: ScanInputProps) {
  const [barcode, setBarcode] = useState('');
  const [result, setResult] = useState<ScanResult | null>(null);
  const [animationKey, setAnimationKey] = useState(0);
  const [scannerActive, setScannerActive] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showManualInput) {
      inputRef.current?.focus();
    }
  }, [showManualInput]);

  const handleScan = (scannedBarcode: string) => {
    const scanResult = onScan(scannedBarcode);
    setResult(scanResult);
    setAnimationKey(prev => prev + 1);
    
    // Play sound feedback
    if (scanResult.type === 'success') {
      playBeep(1000, 200); // Same as Python: winsound.Beep(1000, 200)
    } else if (scanResult.type === 'error') {
      playBeep(500, 500);  // Same as Python: winsound.Beep(500, 500)
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcode.trim()) return;

    handleScan(barcode);
    setBarcode('');
    inputRef.current?.focus();
  };

  const playBeep = (frequency: number, duration: number) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.3;
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + duration / 1000);
    } catch (e) {
      // Audio not supported
    }
  };

  const getResultStyles = () => {
    if (!result) return 'bg-muted';
    switch (result.type) {
      case 'success':
        return 'bg-success text-success-foreground';
      case 'warning':
        return 'bg-warning text-warning-foreground';
      case 'error':
        return 'bg-destructive text-destructive-foreground animate-shake';
      default:
        return 'bg-muted';
    }
  };

  const getResultIcon = () => {
    if (!result) return null;
    switch (result.type) {
      case 'success':
        return <CheckCircle2 className="w-10 h-10" />;
      case 'warning':
        return <AlertTriangle className="w-10 h-10" />;
      case 'error':
        return <XCircle className="w-10 h-10" />;
      default:
        return null;
    }
  };

  return (
    <div className="gradient-panel rounded-xl shadow-elevated p-6 md:p-8 border-2 border-primary/30">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center p-3 rounded-full bg-primary/20 mb-4">
          <ScanBarcode className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">ماسح الباركود</h2>
        <p className="text-foreground/80 text-sm mt-1">
          امسح الباركود بالكاميرا أو أدخله يدوياً
        </p>
      </div>

      {/* Camera Scanner */}
      <BarcodeScanner
        onScan={handleScan}
        isActive={scannerActive}
        onToggle={() => setScannerActive(!scannerActive)}
      />

      {/* Manual Input Toggle */}
      <div className="mt-6 pt-6 border-t border-foreground/20">
        <button
          onClick={() => setShowManualInput(!showManualInput)}
          className="flex items-center gap-2 mx-auto text-sm text-foreground/80 hover:text-foreground transition-colors"
        >
          <Keyboard className="w-4 h-4" />
          {showManualInput ? 'إخفاء الإدخال اليدوي' : 'إدخال الباركود يدوياً'}
        </button>

        {showManualInput && (
          <form onSubmit={handleManualSubmit} className="mt-4 space-y-3">
            <input
              ref={inputRef}
              type="text"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder="أدخل رقم الباركود..."
              className="w-full text-center text-xl font-mono py-3 px-4 rounded-xl border-2 border-primary/50 bg-background/50 text-foreground focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all outline-none"
              autoComplete="off"
              dir="ltr"
            />
            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground font-semibold py-2.5 px-4 rounded-xl hover:bg-primary/90 transition-colors"
            >
              تسجيل الحضور
            </button>
          </form>
        )}
      </div>

      {/* Result Display - Large box like Python app */}
      <div className="mt-6">
        <div
          key={animationKey}
          className={`flex flex-col items-center justify-center gap-3 p-6 rounded-xl min-h-[120px] ${getResultStyles()} ${result ? 'animate-bounce-in' : ''}`}
        >
          {result ? (
            <>
              {getResultIcon()}
              <span className="font-bold text-2xl text-center">{result.message}</span>
              {result.person && (
                <span className="text-lg opacity-90">
                  الصفة: {result.person.role === 'Student' ? 'طالب' : 'أستاذ'} | الوقت: {new Date().toLocaleTimeString('ar-EG')}
                </span>
              )}
            </>
          ) : (
            <>
              <div className="w-3 h-3 rounded-full bg-success animate-pulse-soft" />
              <span className="text-xl font-semibold text-foreground/70">جاهز للمسح...</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
