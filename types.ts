
export interface BookProgress {
  id: string;
  name: string;
  pageCount: string;
  teacherName: string;
  isCompleted: boolean;
}

export interface Student {
  id: string;
  fullName: string;
  phone: string;
  address: string;
  guardianName: string;
  guardianPhone: string;
  photo?: string; // Base64 image string
  
  // Education Level
  educationLevel: string;
  
  // Financial
  previousFinancialAid: string;
  aidSource: string;
  aidDuration: string;
  familyFinancialStatus: string;
  incomeSource: string;

  // Family & Health
  familyStatus: string;
  healthStatus: string;
  chronicDiseases: string;

  // Study History
  previousMosque: string;
  previousTeacher: string;
  previousBooks: BookProgress[];

  // Current Study
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
  location: string; // Hujra/Place
  studentNotes: string;
  hujraNotes: string;
  suggestions: string;
}

export type ViewState = 'DASHBOARD' | 'STUDENT_LIST' | 'ADD_STUDENT' | 'EDIT_STUDENT' | 'STUDENT_DETAIL' | 'VISIT_HISTORY' | 'REPORTS' | 'ADD_VISIT' | 'EDIT_VISIT' | 'SETTINGS';
