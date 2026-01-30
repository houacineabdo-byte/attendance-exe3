import { useState } from 'react';
import { GraduationCap, BookUser } from 'lucide-react';
import { Header } from '@/components/attendance/Header';
import { StatsCard } from '@/components/attendance/StatsCard';
import { ScanInput } from '@/components/attendance/ScanInput';
import { ControlPanel } from '@/components/attendance/ControlPanel';
import { LoginScreen } from '@/components/attendance/LoginScreen';
import { AttendanceTable } from '@/components/attendance/AttendanceTable';
import { useAttendance } from '@/hooks/useAttendance';
import { Toaster } from 'sonner';

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const {
    people,
    isLoading,
    studentStats,
    teacherStats,
    processScan,
    startNewDay,
    reloadData,
    exportData,
    addPerson,
    deletePerson,
  } = useAttendance();

  if (!isLoggedIn) {
    return <LoginScreen onLogin={() => setIsLoggedIn(true)} />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading attendance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-center" richColors />
      <Header />

      <main className="container max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Statistics Section */}
        <section className="grid md:grid-cols-2 gap-6 animate-slide-up">
          <StatsCard
            title="إحصائيات الطلاب"
            stats={studentStats}
            variant="students"
            icon={<GraduationCap className="w-5 h-5" />}
          />
          <StatsCard
            title="إحصائيات الأساتذة"
            stats={teacherStats}
            variant="teachers"
            icon={<BookUser className="w-5 h-5" />}
          />
        </section>

        {/* Scan Section */}
        <section className="max-w-xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <ScanInput onScan={processScan} />
        </section>

        {/* Attendance Table with QR Codes */}
        <section className="animate-slide-up" style={{ animationDelay: '0.15s' }}>
          <AttendanceTable people={people} onDeletePerson={deletePerson} />
        </section>

        {/* Control Panel */}
        <section className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <ControlPanel
            onNewDay={startNewDay}
            onReload={reloadData}
            onExport={exportData}
            onAddPerson={addPerson}
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-sm text-foreground/70 border-t border-foreground/20">
        <p>نظام الحضور الذكي • نسخة احترافية</p>
      </footer>
    </div>
  );
};

export default Index;
