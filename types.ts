
export interface BookProgress {
  id: string;
  name: string;
  pageCount: string;
  teacherName: string;
  isCompleted: boolean;
}

export interface StudyLog {
  id: string;
  date: string; // ISO date or "2023-10"
  bookName: string;
  currentPage: string;
  teacherName?: string;
  notes?: string;
}

export interface FinancialLog {
  id: string;
  date: string;
  amount: string;
  source: string;
  notes?: string;
}

export interface Student {
  id: string;
  fullName: string;
  phone: string;
  address: string;
  guardianName: string;
  guardianPhone: string;
  photo?: string;
  
  educationLevel: string;
  familyFinancialStatus: string;
  incomeSource: string;
  familyStatus: string;
  healthStatus: string;
  chronicDiseases: string;

  // History Tracking
  studyHistory: StudyLog[];
  financialHistory: FinancialLog[];

  previousMosque: string;
  previousTeacher: string;
  previousBooks: BookProgress[];

  currentMosque: string;
  currentTeacher: string;
  currentBooks: BookProgress[];
  
  createdAt: string;
}

export interface TeacherVisit {
  id: string;
  studentId: string;
  teacherName: string;
  visitDate: string;
  location: string;
  studentNotes: string;
  hujraNotes: string;
  suggestions: string;
}

export type ViewState = 'DASHBOARD' | 'STUDENT_LIST' | 'ADD_STUDENT' | 'EDIT_STUDENT' | 'STUDENT_DETAIL' | 'VISIT_HISTORY' | 'REPORTS' | 'ADD_VISIT' | 'EDIT_VISIT' | 'SETTINGS';
