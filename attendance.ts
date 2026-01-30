export interface Person {
  barcode: string;
  name: string;
  role: 'Student' | 'Teacher';
  status: 'Present' | 'Absent';
  totalAbsences: number;
}

export interface Stats {
  total: number;
  present: number;
  absent: number;
}

export interface ScanResult {
  type: 'success' | 'warning' | 'error';
  message: string;
  person?: Person;
}
