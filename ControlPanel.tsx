import { useState } from 'react';
import { Sun, RefreshCw, Download, Upload, UserPlus } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface ControlPanelProps {
  onNewDay: () => void;
  onReload: () => void;
  onExport: () => string;
  onAddPerson: (person: { barcode: string; name: string; role: 'Student' | 'Teacher' }) => void;
}

export function ControlPanel({ onNewDay, onReload, onExport, onAddPerson }: ControlPanelProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newPerson, setNewPerson] = useState<{ barcode: string; name: string; role: 'Student' | 'Teacher' }>({ barcode: '', name: '', role: 'Student' });

  const handleNewDay = () => {
    onNewDay();
    toast.success('تم بدء يوم جديد!', {
      description: 'تم تحديث عدد الغيابات لمن كانوا غائبين.',
    });
  };

  const handleReload = () => {
    onReload();
    toast.info('تم إعادة تحميل قاعدة البيانات بنجاح!');
  };

  const handleExport = () => {
    const data = onExport();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('تم تصدير البيانات بنجاح!');
  };

  const handleAddPerson = () => {
    if (!newPerson.barcode || !newPerson.name) {
      toast.error('يرجى ملء جميع الحقول');
      return;
    }
    onAddPerson(newPerson);
    setNewPerson({ barcode: '', name: '', role: 'Student' });
    setAddDialogOpen(false);
    toast.success(`تمت إضافة ${newPerson.name} بنجاح!`);
  };

  return (
    <div className="gradient-panel rounded-xl shadow-card p-4 border-2 border-primary/30">
      <div className="flex flex-wrap justify-center gap-3">
        {/* New Day Button */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className="flex items-center gap-2 bg-destructive text-destructive-foreground font-semibold py-2.5 px-4 rounded-lg hover:opacity-90 transition-opacity">
              <Sun className="w-4 h-4" />
              بدء يوم جديد
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>بدء يوم جديد؟</AlertDialogTitle>
              <AlertDialogDescription>
                سيتم:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>إضافة +1 لعدد الغيابات لكل من كان غائباً</li>
                  <li>إعادة تعيين حالة الحضور للجميع إلى "غائب"</li>
                </ul>
                <p className="mt-2 font-medium">لا يمكن التراجع عن هذا الإجراء.</p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2">
              <AlertDialogCancel>إلغاء</AlertDialogCancel>
              <AlertDialogAction onClick={handleNewDay} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                نعم، ابدأ يوم جديد
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Add Person Button */}
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 bg-success text-success-foreground font-semibold py-2.5 px-4 rounded-lg hover:opacity-90 transition-opacity">
              <UserPlus className="w-4 h-4" />
              إضافة شخص
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إضافة شخص جديد</DialogTitle>
              <DialogDescription>
                أدخل بيانات الطالب أو الأستاذ الجديد.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="block text-sm font-medium mb-1">رقم الباركود</label>
                <input
                  type="text"
                  value={newPerson.barcode}
                  onChange={(e) => setNewPerson(prev => ({ ...prev, barcode: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="مثال: 1004"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">الاسم الكامل</label>
                <input
                  type="text"
                  value={newPerson.name}
                  onChange={(e) => setNewPerson(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="مثال: محمد أحمد"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">الصفة</label>
                <select
                  value={newPerson.role}
                  onChange={(e) => setNewPerson(prev => ({ ...prev, role: e.target.value as 'Student' | 'Teacher' }))}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                >
                  <option value="Student">طالب</option>
                  <option value="Teacher">أستاذ</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setAddDialogOpen(false)}
                className="px-4 py-2 rounded-lg border border-input hover:bg-secondary transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleAddPerson}
                className="px-4 py-2 rounded-lg bg-success text-success-foreground hover:opacity-90 transition-opacity"
              >
                إضافة
              </button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Reload Button */}
        <button
          onClick={handleReload}
          className="flex items-center gap-2 bg-primary text-primary-foreground font-semibold py-2.5 px-4 rounded-lg hover:opacity-90 transition-opacity"
        >
          <RefreshCw className="w-4 h-4" />
          تحديث البيانات
        </button>

        {/* Export Button */}
        <button
          onClick={handleExport}
          className="flex items-center gap-2 bg-secondary text-secondary-foreground font-semibold py-2.5 px-4 rounded-lg hover:bg-secondary/80 transition-colors"
        >
          <Download className="w-4 h-4" />
          تصدير البيانات
        </button>
      </div>
    </div>
  );
}
