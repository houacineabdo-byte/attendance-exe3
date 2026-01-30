import { ReactNode } from 'react';
import { Stats } from '@/types/attendance';
import { Users, UserCheck, UserX } from 'lucide-react';

interface StatsCardProps {
  title: string;
  stats: Stats;
  variant: 'students' | 'teachers';
  icon: ReactNode;
}

export function StatsCard({ title, stats, variant, icon }: StatsCardProps) {
  const presentPercentage = stats.total > 0 
    ? Math.round((stats.present / stats.total) * 100) 
    : 0;

  return (
    <div className="bg-success/20 rounded-xl border-2 border-success/30 shadow-card hover:shadow-card-hover transition-all duration-300 p-6">
      <div className="flex items-center justify-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-success/20 text-success">
          {icon}
        </div>
        <h3 className="font-bold text-xl text-foreground">{title}</h3>
      </div>

      {/* Main stats display like Python app */}
      <div className="text-center space-y-4">
        <div className="text-3xl font-bold text-foreground">
          حضور: <span className="text-success">{stats.present}</span> / الكلي: <span className="text-primary">{stats.total}</span>
        </div>

        {/* Progress bar */}
        <div>
          <div className="h-3 bg-background/50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-success transition-all duration-500 ease-out"
              style={{ width: `${presentPercentage}%` }}
            />
          </div>
          <p className="text-sm text-foreground/80 mt-2">
            نسبة الحضور: {presentPercentage}%
          </p>
        </div>

        {/* Detailed stats */}
        <div className="grid grid-cols-3 gap-2 pt-4 border-t border-foreground/20">
          <div className="text-center p-2 rounded-lg bg-background/30">
            <Users className="w-5 h-5 mx-auto mb-1 text-primary" />
            <div className="text-lg font-bold text-foreground">{stats.total}</div>
            <div className="text-xs text-foreground/70">الكلي</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-success/20">
            <UserCheck className="w-5 h-5 mx-auto mb-1 text-success" />
            <div className="text-lg font-bold text-success">{stats.present}</div>
            <div className="text-xs text-foreground/70">حاضر</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-destructive/20">
            <UserX className="w-5 h-5 mx-auto mb-1 text-destructive" />
            <div className="text-lg font-bold text-destructive">{stats.absent}</div>
            <div className="text-xs text-foreground/70">غائب</div>
          </div>
        </div>
      </div>
    </div>
  );
}
