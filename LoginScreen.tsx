import { useState } from 'react';
import { Shield, Lock, Eye, EyeOff } from 'lucide-react';

interface LoginScreenProps {
  onLogin: () => void;
}

const ADMIN_PASSWORD = 'admin';

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      onLogin();
    } else {
      setError('كلمة المرور غير صحيحة. حاول مرة أخرى.');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className={`gradient-panel rounded-2xl shadow-elevated p-8 w-full max-w-md border-2 border-primary/30 ${isShaking ? 'animate-shake' : ''}`}>
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-4 rounded-full bg-primary/20 mb-4">
            <Shield className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-primary">نظام الحضور الذكي</h1>
          <p className="text-foreground/80 mt-2">أدخل كلمة المرور للدخول إلى النظام</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <Lock className="w-5 h-5 text-foreground/60" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              placeholder="أدخل كلمة المرور"
              className="w-full pr-10 pl-12 py-3 rounded-xl border-2 border-primary/50 bg-background/50 text-foreground focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all outline-none text-lg"
              autoFocus
              dir="ltr"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 left-0 flex items-center pl-3 text-foreground/60 hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-destructive/20 border border-destructive text-destructive text-sm text-center animate-bounce-in">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground font-semibold py-3 px-6 rounded-xl hover:opacity-90 transition-opacity focus:ring-4 focus:ring-primary/30"
          >
            تسجيل الدخول
          </button>
        </form>

        <p className="text-center text-xs text-foreground/70 mt-6">
          كلمة المرور الافتراضية: <code className="bg-background/50 px-1.5 py-0.5 rounded" dir="ltr">admin</code>
        </p>
      </div>
    </div>
  );
}
