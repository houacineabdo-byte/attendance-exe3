import { useState } from 'react';
import { Person } from '@/attendance';
import { QRCodeSVG } from 'qrcode.react';
import { UserCheck, UserX, QrCode, Printer, Search, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/dialog';
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
} from '@/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/table';
import { Badge } from '@/badge';
import { toast } from 'sonner';

interface AttendanceTableProps {
  people: Person[];
  onDeletePerson: (barcode: string) => void;
}

export function AttendanceTable({ people, onDeletePerson }: AttendanceTableProps) {
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [personToDelete, setPersonToDelete] = useState<Person | null>(null);

  const handleDeletePerson = (person: Person) => {
    onDeletePerson(person.barcode);
    setPersonToDelete(null);
    toast.success(`تم حذف ${person.name} بنجاح!`);
  };
  const [filter, setFilter] = useState<'all' | 'present' | 'absent'>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | 'Student' | 'Teacher'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPeople = people.filter((person) => {
    const matchesStatus = filter === 'all' || 
      (filter === 'present' && person.status === 'Present') ||
      (filter === 'absent' && person.status === 'Absent');
    
    const matchesRole = roleFilter === 'all' || person.role === roleFilter;
    
    const matchesSearch = person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.barcode.includes(searchQuery);

    return matchesStatus && matchesRole && matchesSearch;
  });

  const handlePrintQRCode = (person: Person) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>QR Code - ${person.name}</title>
          <style>
            body {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
            }
            .card {
              border: 2px solid #333;
              border-radius: 12px;
              padding: 30px;
              text-align: center;
              max-width: 300px;
            }
            .name {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .role {
              font-size: 16px;
              color: #666;
              margin-bottom: 20px;
            }
            .barcode {
              font-size: 18px;
              font-family: monospace;
              margin-top: 15px;
              color: #333;
            }
            svg {
              max-width: 200px;
              height: auto;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="name">${person.name}</div>
            <div class="role">${person.role === 'Student' ? '🎓 Student' : '👨‍🏫 Teacher'}</div>
            <div id="qr-container"></div>
            <div class="barcode">ID: ${person.barcode}</div>
          </div>
          <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script>
          <script>
            const canvas = document.createElement('canvas');
            QRCode.toCanvas(canvas, '${person.barcode}', { width: 200 }, function(error) {
              if (!error) {
                document.getElementById('qr-container').appendChild(canvas);
                setTimeout(() => window.print(), 500);
              }
            });
          </script>
        </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handlePrintAllQRCodes = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const cardsHtml = filteredPeople.map(person => `
        <div class="card">
          <div class="name">${person.name}</div>
          <div class="role">${person.role === 'Student' ? '🎓 Student' : '👨‍🏫 Teacher'}</div>
          <div class="qr" data-barcode="${person.barcode}"></div>
          <div class="barcode">ID: ${person.barcode}</div>
        </div>
      `).join('');

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>All QR Codes</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
            }
            .grid {
              display: grid;
              grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
              gap: 20px;
            }
            .card {
              border: 2px solid #333;
              border-radius: 12px;
              padding: 20px;
              text-align: center;
              page-break-inside: avoid;
            }
            .name {
              font-size: 16px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .role {
              font-size: 12px;
              color: #666;
              margin-bottom: 10px;
            }
            .barcode {
              font-size: 12px;
              font-family: monospace;
              margin-top: 10px;
            }
            canvas {
              max-width: 150px;
              height: auto;
            }
            @media print {
              .card { break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <h1 style="text-align: center; margin-bottom: 30px;">QR Code Cards</h1>
          <div class="grid">${cardsHtml}</div>
          <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script>
          <script>
            document.querySelectorAll('.qr').forEach(div => {
              const canvas = document.createElement('canvas');
              QRCode.toCanvas(canvas, div.dataset.barcode, { width: 150 }, function(error) {
                if (!error) div.appendChild(canvas);
              });
            });
            setTimeout(() => window.print(), 1000);
          </script>
        </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="gradient-panel rounded-xl shadow-card p-6 space-y-4 border-2 border-primary/30">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <QrCode className="w-5 h-5 text-primary" />
          سجل الحضور ورموز QR
        </h3>
        <button
          onClick={handlePrintAllQRCodes}
          className="flex items-center gap-2 bg-primary text-primary-foreground font-semibold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity text-sm"
        >
          <Printer className="w-4 h-4" />
          طباعة جميع رموز QR
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/60" />
          <input
            type="text"
            placeholder="البحث بالاسم أو الرقم..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-9 pl-4 py-2 rounded-lg border border-foreground/30 bg-background/50 text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
          />
        </div>
        
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'present' | 'absent')}
            className="px-3 py-2 rounded-lg border border-foreground/30 bg-background/50 text-foreground text-sm"
          >
            <option value="all">جميع الحالات</option>
            <option value="present">حاضر</option>
            <option value="absent">غائب</option>
          </select>
          
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as 'all' | 'Student' | 'Teacher')}
            className="px-3 py-2 rounded-lg border border-foreground/30 bg-background/50 text-foreground text-sm"
          >
            <option value="all">الجميع</option>
            <option value="Student">الطلاب</option>
            <option value="Teacher">الأساتذة</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="border border-foreground/30 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-background/30">
              <TableHead className="font-semibold text-foreground">رمز QR</TableHead>
              <TableHead className="font-semibold text-foreground">الاسم</TableHead>
              <TableHead className="font-semibold text-foreground">الرقم</TableHead>
              <TableHead className="font-semibold text-foreground">الصفة</TableHead>
              <TableHead className="font-semibold text-foreground">الحالة</TableHead>
              <TableHead className="font-semibold text-foreground text-center">إجمالي الغيابات</TableHead>
              <TableHead className="font-semibold text-foreground text-left">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPeople.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-foreground/60">
                  لا توجد سجلات
                </TableCell>
              </TableRow>
            ) : (
              filteredPeople.map((person) => (
                <TableRow key={person.barcode} className="hover:bg-background/20 border-foreground/20">
                  <TableCell>
                    <button
                      onClick={() => setSelectedPerson(person)}
                      className="p-1 rounded-lg hover:bg-primary/10 transition-colors bg-white"
                    >
                      <QRCodeSVG value={person.barcode} size={40} />
                    </button>
                  </TableCell>
                  <TableCell className="font-medium text-foreground">{person.name}</TableCell>
                  <TableCell className="font-mono text-sm text-foreground/80" dir="ltr">
                    {person.barcode}
                  </TableCell>
                  <TableCell>
                    <Badge variant={person.role === 'Student' ? 'default' : 'secondary'}>
                      {person.role === 'Student' ? '🎓 طالب' : '👨‍🏫 أستاذ'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {person.status === 'Present' ? (
                      <span className="inline-flex items-center gap-1.5 text-success font-medium">
                        <UserCheck className="w-4 h-4" />
                        حاضر
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-destructive font-medium">
                        <UserX className="w-4 h-4" />
                        غائب
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`font-bold ${person.totalAbsences > 3 ? 'text-destructive' : 'text-foreground/70'}`}>
                      {person.totalAbsences}
                    </span>
                  </TableCell>
                  <TableCell className="text-left">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handlePrintQRCode(person)}
                        className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                      >
                        <Printer className="w-4 h-4" />
                        طباعة
                      </button>
                      <AlertDialog open={personToDelete?.barcode === person.barcode} onOpenChange={(open) => !open && setPersonToDelete(null)}>
                        <AlertDialogTrigger asChild>
                          <button
                            onClick={() => setPersonToDelete(person)}
                            className="inline-flex items-center gap-1.5 text-sm text-destructive hover:underline"
                          >
                            <Trash2 className="w-4 h-4" />
                            حذف
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>هل أنت متأكد من الحذف؟</AlertDialogTitle>
                            <AlertDialogDescription>
                              سيتم حذف <strong>{person.name}</strong> نهائياً من النظام.
                              <br />
                              لا يمكن التراجع عن هذا الإجراء.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="gap-2">
                            <AlertDialogCancel>إلغاء</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeletePerson(person)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              نعم، احذف
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* QR Code Dialog */}
      <Dialog open={!!selectedPerson} onOpenChange={() => setSelectedPerson(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">{selectedPerson?.name}</DialogTitle>
          </DialogHeader>
          {selectedPerson && (
            <div className="flex flex-col items-center py-6 space-y-4">
              <div className="p-4 bg-white rounded-xl shadow-lg">
                <QRCodeSVG value={selectedPerson.barcode} size={200} />
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm text-muted-foreground">
                  {selectedPerson.role === 'Student' ? '🎓 طالب' : '👨‍🏫 أستاذ'}
                </p>
                <p className="font-mono text-lg" dir="ltr">الرقم: {selectedPerson.barcode}</p>
              </div>
              <div className="flex gap-4 text-sm">
                <span className={selectedPerson.status === 'Present' ? 'text-success' : 'text-destructive'}>
                  {selectedPerson.status === 'Present' ? '✅ حاضر' : '❌ غائب'}
                </span>
                <span className="text-muted-foreground">
                  إجمالي الغيابات: <strong>{selectedPerson.totalAbsences}</strong>
                </span>
              </div>
              <button
                onClick={() => handlePrintQRCode(selectedPerson)}
                className="flex items-center gap-2 bg-primary text-primary-foreground font-semibold py-2 px-6 rounded-lg hover:opacity-90 transition-opacity"
              >
                <Printer className="w-4 h-4" />
                طباعة رمز QR
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
