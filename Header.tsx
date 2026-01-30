import { ScanBarcode, Shield } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-background py-6 px-4 border-b-4 border-primary">
      <div className="container max-w-6xl mx-auto">
        <div className="flex items-center justify-center gap-4">
          <div className="p-3 rounded-xl bg-primary/20">
            <ScanBarcode className="w-8 h-8 text-primary" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-primary">
              نظام إدارة الحضور والغياب المدرسي
            </h1>
            <p className="text-muted-foreground text-sm mt-1 flex items-center justify-center gap-2">
              <Shield className="w-4 h-4" />
              نسخة احترافية
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
