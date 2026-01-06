
export interface Student {
  id: string;
  name: string;
  department: string;
  gpa: number;
  credits: number;
  enrollmentDate: string;
  status: 'Active' | 'On Leave' | 'Graduated';
  email: string;
}

export interface ChatMessage {
  role: 'user' | 'model' | 'system';
  content: string;
  timestamp: number;
  isToolCall?: boolean;
}

export interface DepartmentStats {
  department: string;
  avgGpa: number;
  totalStudents: number;
  totalCredits: number;
}
