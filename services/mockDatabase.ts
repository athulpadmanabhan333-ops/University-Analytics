
import { SYNTHETIC_STUDENTS } from '../constants';
import { Student, DepartmentStats } from '../types';

export const getStudents = (department?: string, minGpa?: number): Student[] => {
  let filtered = [...SYNTHETIC_STUDENTS];
  if (department) {
    filtered = filtered.filter(s => s.department.toLowerCase() === department.toLowerCase());
  }
  if (minGpa !== undefined) {
    filtered = filtered.filter(s => s.gpa >= minGpa);
  }
  return filtered;
};

export const getStudentById = (id: string): Student | undefined => {
  return SYNTHETIC_STUDENTS.find(s => s.id === id);
};

export const calculateDeptStats = (department: string): DepartmentStats | null => {
  const students = SYNTHETIC_STUDENTS.filter(s => s.department.toLowerCase() === department.toLowerCase());
  if (students.length === 0) return null;

  const totalGpa = students.reduce((acc, s) => acc + s.gpa, 0);
  const totalCredits = students.reduce((acc, s) => acc + s.credits, 0);

  return {
    department,
    totalStudents: students.length,
    avgGpa: Number((totalGpa / students.length).toFixed(2)),
    totalCredits
  };
};

export const performCustomAggregation = (ids: string[]): { avgGpa: number, totalCredits: number } => {
  const students = SYNTHETIC_STUDENTS.filter(s => ids.includes(s.id));
  if (students.length === 0) return { avgGpa: 0, totalCredits: 0 };

  const totalGpa = students.reduce((acc, s) => acc + s.gpa, 0);
  const totalCredits = students.reduce((acc, s) => acc + s.credits, 0);

  return {
    avgGpa: Number((totalGpa / students.length).toFixed(2)),
    totalCredits
  };
};
