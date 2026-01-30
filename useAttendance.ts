import { useState, useEffect, useCallback } from 'react';
import { Person, Stats, ScanResult } from '@/types/attendance';

const STORAGE_KEY = 'attendance_database';

const defaultData: Person[] = [
  { barcode: '1001', name: 'محمد إسلام', role: 'Student', status: 'Absent', totalAbsences: 0 },
  { barcode: '1002', name: 'أحمد خالد', role: 'Student', status: 'Absent', totalAbsences: 0 },
  { barcode: '1003', name: 'يوسف علي', role: 'Student', status: 'Absent', totalAbsences: 0 },
  { barcode: '2001', name: 'الأستاذ علي', role: 'Teacher', status: 'Absent', totalAbsences: 0 },
  { barcode: '2002', name: 'الأستاذ محمد', role: 'Teacher', status: 'Absent', totalAbsences: 0 },
];

export function useAttendance() {
  const [people, setPeople] = useState<Person[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setPeople(JSON.parse(stored));
      } catch {
        setPeople(defaultData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
      }
    } else {
      setPeople(defaultData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
    }
    setIsLoading(false);
  }, []);

  // Save to localStorage whenever people changes
  useEffect(() => {
    if (!isLoading && people.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(people));
    }
  }, [people, isLoading]);

  const getStats = useCallback((role: 'Student' | 'Teacher'): Stats => {
    const filtered = people.filter(p => p.role === role);
    const present = filtered.filter(p => p.status === 'Present').length;
    return {
      total: filtered.length,
      present,
      absent: filtered.length - present,
    };
  }, [people]);

  const processScan = useCallback((barcode: string): ScanResult => {
    const trimmedCode = barcode.trim();
    const personIndex = people.findIndex(p => p.barcode === trimmedCode);

    if (personIndex === -1) {
      return {
        type: 'error',
        message: '⛔ أنت غير مسجل في النظام',
      };
    }

    const person = people[personIndex];

    if (person.status === 'Present') {
      return {
        type: 'warning',
        message: `⚠️ ${person.name} مسجل بالفعل اليوم`,
        person,
      };
    }

    // Mark as present
    const updatedPeople = [...people];
    updatedPeople[personIndex] = { ...person, status: 'Present' };
    setPeople(updatedPeople);

    const greeting = person.role === 'Teacher' 
      ? `✅ مرحباً، ${person.name}!` 
      : `✅ تم تسجيل الحضور: ${person.name}`;

    return {
      type: 'success',
      message: greeting,
      person: updatedPeople[personIndex],
    };
  }, [people]);

  const startNewDay = useCallback(() => {
    const updatedPeople = people.map(person => ({
      ...person,
      totalAbsences: person.status === 'Absent' ? person.totalAbsences + 1 : person.totalAbsences,
      status: 'Absent' as const,
    }));
    setPeople(updatedPeople);
  }, [people]);

  const reloadData = useCallback(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setPeople(JSON.parse(stored));
      } catch {
        // Keep current data
      }
    }
  }, []);

  const addPerson = useCallback((person: Omit<Person, 'status' | 'totalAbsences'>) => {
    const newPerson: Person = {
      ...person,
      status: 'Absent',
      totalAbsences: 0,
    };
    setPeople(prev => [...prev, newPerson]);
  }, []);

  const deletePerson = useCallback((barcode: string) => {
    setPeople(prev => prev.filter(p => p.barcode !== barcode));
  }, []);

  const exportData = useCallback(() => {
    return JSON.stringify(people, null, 2);
  }, [people]);

  const importData = useCallback((data: string) => {
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        setPeople(parsed);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  return {
    people,
    isLoading,
    studentStats: getStats('Student'),
    teacherStats: getStats('Teacher'),
    processScan,
    startNewDay,
    reloadData,
    addPerson,
    deletePerson,
    exportData,
    importData,
  };
}
