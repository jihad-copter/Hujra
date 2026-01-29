import React from 'react';
import { ViewState, Student, TeacherVisit, StudyLog, FinancialLog, BookProgress } from './types.ts';
import Layout from './components/Layout.tsx';
import StudentForm from './components/StudentForm.tsx';
import VisitForm from './components/VisitForm.tsx';
import Reports from './components/Reports.tsx';
import { db } from './services/db.ts';
import { 
  Users, History, ChevronLeft, GraduationCap, Edit3, Plus, 
  Search, Loader2, ArrowLeft, BookOpen, Clock, CheckCircle2, DollarSign, Database, 
  Download, Upload, School, X
} from 'lucide-react';

// گۆڕینی ژمارە بۆ کوردی بۆ نیشاندان
export const toKu = (num: any): string => {
  if (num === null || num === undefined) return '';
  const dict: { [key: string]: string } = {
    '0': '٠', '1': '١', '2': '٢', '3': '٣', '4': '٤',
    '5': '٥', '6': '٦', '7': '٧', '8': '٨', '9': '٩'
  };
  return num.toString().replace(/\d/g, (m: string) => dict[m] || m);
};

// گۆڕینی ژمارەی کوردی بۆ ئینگلیزی بۆ کردارە ژمێریارییەکان و داتابەیس
export const fromKu = (str: string): string => {
  if (!str) return '';
  const dict: { [key: string]: string } = {
    '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
    '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9'
  };
  // ئەم فەنکشنە هەموو ژمارە کوردییەکان دەگۆڕێت بۆ ئینگلیزی ستاندارد
  return str.toString().replace(/[٠-٩]/g, (m: string) => dict[m] || m);
};

const App: React.FC = () => {
  const [view, setView] = React.useState<ViewState>('DASHBOARD');
  const [students, setStudents] = React.useState<Student[]>([]);
  const [visits, setVisits] = React.useState<TeacherVisit[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  
  const [selectedStudentId, setSelectedStudentId] = React.useState<string | null>(null);
  const [selectedMosque, setSelectedMosque] = React.useState<string | null>(null);
  const [visitViewMode, setVisitViewMode] = React.useState<'MOSQUES' | 'STUDENTS' | 'HISTORY'>('MOSQUES');
  const [selectedBookForHistory, setSelectedBookForHistory] = React.useState<string | null>(null);

  const [editingStudent, setEditingStudent] = React.useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');

  React.useEffect(() => {
    const initDB = async () => {
      try {
        await db.open();
        const [loadedStudents, loadedVisits] = await Promise.all([
          db.getAllStudents(),
          db.getAllVisits()
        ]);
        setStudents(loadedStudents);
        setVisits(loadedVisits);
      } catch (err) {
        console.error("Database error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    initDB();
  }, []);

  const handleSaveStudent = async (student: Student) => {
    setIsLoading(true);
    try {
      await db.saveStudent(student);
      const updatedList = await db.getAllStudents();
      setStudents(updatedList);
      setEditingStudent(null);
      setSelectedStudentId(student.id);
      setView('STUDENT_DETAIL');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveVisit = async (visit: TeacherVisit, extraData?: any) => {
    setIsLoading(true);
    try {
      await db.saveVisit(visit);
      const student = students.find(s => s.id === visit.studentId);
      if (student && extraData) {
        let updatedStudent = { ...student };
        
        if (extraData.studyLogs) {
          extraData.studyLogs.forEach((log: any) => {
            const newHistoryItem: StudyLog = {
              id: Date.now().toString() + Math.random(),
              date: visit.visitDate,
              bookName: log.bookName,
              currentPage: log.currentPage,
              teacherName: log.teacherName || visit.teacherName
            };
            updatedStudent.studyHistory = [newHistoryItem, ...(updatedStudent.studyHistory || [])];
            
            // Update current books progress
            const bookToUpdate = updatedStudent.currentBooks?.find(b => b.name === log.bookName);
            if (bookToUpdate) {
               if (log.isBookCompleted) {
                  updatedStudent.currentBooks = updatedStudent.currentBooks.filter(b => b.name !== log.bookName);
                  updatedStudent.previousBooks = [{...bookToUpdate, isCompleted: true, pageCount: log.currentPage}, ...(updatedStudent.previousBooks || [])];
               } else {
                  updatedStudent.currentBooks = updatedStudent.currentBooks.map(b => b.name === log.bookName ? {...b, pageCount: log.currentPage} : b);
               }
            } else if (log.isNewBook) {
               const newBook: BookProgress = { id: Date.now().toString(), name: log.bookName, pageCount: log.currentPage, teacherName: log.teacherName, isCompleted: log.isBookCompleted };
               if (log.isBookCompleted) updatedStudent.previousBooks = [newBook, ...(updatedStudent.previousBooks || [])];
               else updatedStudent.currentBooks = [newBook, ...(updatedStudent.currentBooks || [])];
            }
          });
        }

        if (extraData.financeLog) {
          const newFinanceLog: FinancialLog = {
            id: Date.now().toString(),
            date: visit.visitDate,
            amount: extraData.financeLog.amount,
            source: extraData.financeLog.source
          };
          updatedStudent.financialHistory = [newFinanceLog, ...(updatedStudent.financialHistory || [])];
        }

        await db.saveStudent(updatedStudent);
      }
      const [updatedStudents, updatedVisits] = await Promise.all([db.getAllStudents(), db.getAllVisits()]);
      setStudents(updatedStudents);
      setVisits(updatedVisits);
      setView('VISIT_HISTORY');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStudents = students.filter(s => s.fullName.toLowerCase().includes(searchTerm.toLowerCase()));
  const selectedStudent = students.find(s => s.id === selectedStudentId);
  const mosques = Array.from(new Set(students.map(s => s.currentMosque))).filter(Boolean).sort();

  return (
    <Layout currentView={view} onViewChange={setView}>
      {isLoading && (
         <div className="fixed inset-0 bg-white/60 backdrop-blur-md z-[100] flex items-center justify-center">
            <Loader2 className="animate-spin text-emerald-900" size={48} />
         </div>
      )}

      {selectedBookForHistory && selectedStudent && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95">
              <div className="p-6 bg-emerald-900 text-white flex justify-between items-center kurdish-pattern">
                 <button onClick={() => setSelectedBookForHistory(null)}><X size={20}/></button>
                 <h3 className="font-black">مێژووی {selectedBookForHistory}</h3>
              </div>
              <div className="p-6 max-h-[60vh] overflow-y-auto space-y-3">
                 {selectedStudent.studyHistory.filter(h => h.bookName === selectedBookForHistory).map(h => (
                   <div key={h.id} className="p-3 bg-gray-50 rounded-xl flex justify-between items-center text-sm">
                      <span className="font-mono text-gray-400">{toKu(h.date)}</span>
                      <span className="font-black text-emerald-800">ل. {toKu(h.currentPage)}</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      )}

      {view === 'DASHBOARD' && (
        <div className="space-y-6">
          <div className="bg-emerald-900 rounded-[2.5rem] p-8 text-white kurdish-pattern shadow-2xl relative overflow-hidden">
             <div className="relative z-10 text-right">
                <h2 className="text-3xl font-black mb-1">سیستەمی حوجرە</h2>
                <p className="opacity-80 text-sm">بەڕێوەبردنی پێشکەوتنی فەقێکان (وێب)</p>
                <div className="flex gap-3 mt-10">
                   <button onClick={() => setView('ADD_VISIT')} className="bg-amber-500 text-emerald-950 px-6 py-3 rounded-2xl text-xs font-black shadow-lg">تۆماری سەردان</button>
                   <button onClick={() => setView('ADD_STUDENT')} className="bg-white/10 text-white px-6 py-3 rounded-2xl text-xs font-black border border-white/20">فەقێی نوێ</button>
                </div>
             </div>
             <GraduationCap size={180} className="absolute left-[-20px] bottom-[-20px] opacity-10 rotate-12" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-[2rem] shadow-md text-center border border-emerald-50">
               <Users className="mx-auto text-emerald-700 mb-2" size={28} />
               <p className="text-2xl font-black">{toKu(students.length)}</p>
               <p className="text-[10px] font-bold text-gray-400">کۆی فەقێکان</p>
            </div>
            <div className="bg-white p-6 rounded-[2rem] shadow-md text-center border border-blue-50">
               <History className="mx-auto text-blue-700 mb-2" size={28} />
               <p className="text-2xl font-black">{toKu(visits.length)}</p>
               <p className="text-[10px] font-bold text-gray-400">سەردانەکان</p>
            </div>
          </div>
        </div>
      )}

      {view === 'STUDENT_LIST' && (
        <div className="space-y-6">
          <div className="relative">
             <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
             <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="گەڕان بەدوای فەقێ..." className="w-full bg-white pr-14 pl-6 py-5 rounded-3xl shadow-md border-none font-bold text-right outline-none focus:ring-2 ring-emerald-500" />
          </div>
          <div className="grid gap-3">
             {filteredStudents.map(s => (
               <div key={s.id} onClick={() => { setSelectedStudentId(s.id); setView('STUDENT_DETAIL'); }} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 cursor-pointer active:scale-95 transition-all">
                  <div className="w-14 h-14 bg-emerald-900 rounded-2xl flex items-center justify-center text-white font-black kurdish-pattern overflow-hidden">
                    {s.photo ? <img src={s.photo} className="w-full h-full object-cover" /> : s.fullName[0]}
                  </div>
                  <div className="flex-1 text-right">
                    <h4 className="font-black text-sm">{s.fullName}</h4>
                    <p className="text-[10px] text-emerald-700">{s.currentMosque}</p>
                  </div>
                  <ChevronLeft className="text-gray-300" size={20} />
               </div>
             ))}
          </div>
        </div>
      )}

      {view === 'STUDENT_DETAIL' && selectedStudent && (
        <div className="space-y-6 text-right pb-10">
           <button onClick={() => setView('STUDENT_LIST')} className="flex items-center gap-2 text-emerald-800 font-black"><ArrowLeft size={20}/> گەڕانەوە</button>
           
           <div className="bg-white p-8 rounded-[3rem] shadow-xl text-center border border-gray-50">
              <div className="w-32 h-32 bg-emerald-900 text-white rounded-[2.5rem] flex items-center justify-center text-4xl font-black kurdish-pattern mx-auto mb-4 overflow-hidden shadow-lg">
                {selectedStudent.photo ? <img src={selectedStudent.photo} className="w-full h-full object-cover" /> : selectedStudent.fullName[0]}
              </div>
              <h2 className="text-2xl font-black">{selectedStudent.fullName}</h2>
              <p className="text-emerald-700 font-bold text-sm">حوجرەی {selectedStudent.currentMosque}</p>
           </div>

           <div className="bg-white p-6 rounded-[2rem] shadow-md space-y-4">
              <h3 className="font-black text-blue-900 border-b pb-2 flex items-center justify-end gap-2"><BookOpen size={18}/> پێشکەوتنی خوێندن</h3>
              <div className="space-y-2">
                 {selectedStudent.currentBooks.map(b => (
                   <div key={b.id} onClick={() => setSelectedBookForHistory(b.name)} className="p-4 bg-blue-50 rounded-2xl flex justify-between items-center cursor-pointer hover:bg-blue-100">
                      <span className="font-black text-blue-800">ل. {toKu(b.pageCount)}</span>
                      <span className="font-bold">{b.name}</span>
                   </div>
                 ))}
              </div>
           </div>

           <div className="bg-white p-6 rounded-[2rem] shadow-md space-y-4">
              <h3 className="font-black text-amber-900 border-b pb-2 flex items-center justify-end gap-2"><DollarSign size={18}/> تۆمارە داراییەکان</h3>
              <div className="space-y-2">
                 {selectedStudent.financialHistory.map(f => (
                   <div key={f.id} className="p-4 bg-amber-50 rounded-2xl flex justify-between items-center">
                      <span className="font-black text-amber-950">{toKu(parseInt(f.amount).toLocaleString())}</span>
                      <span className="text-xs text-gray-500">{toKu(f.date)}</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      )}

      {view === 'REPORTS' && <Reports students={students} visits={visits} />}
      {view === 'ADD_STUDENT' && <StudentForm onSave={handleSaveStudent} onCancel={() => setView('DASHBOARD')} />}
      {view === 'ADD_VISIT' && <VisitForm students={students} onSave={handleSaveVisit} onCancel={() => setView('DASHBOARD')} />}
      
      {view === 'SETTINGS' && (
        <div className="bg-white p-10 rounded-[3rem] shadow-xl text-center space-y-6">
           <Database size={48} className="mx-auto text-emerald-900" />
           <h2 className="text-xl font-black">پاراستنی زانیارییەکان</h2>
           <p className="text-sm text-gray-500">لێرەوە دەتوانیت پاڵپشتی (Backup) بۆ زانیارییەکانت دروست بکەیت.</p>
           <div className="grid gap-3">
              <button onClick={async () => {
                 const data = await db.exportAllData();
                 const blob = new Blob([JSON.stringify(data)], {type: 'application/json'});
                 const url = URL.createObjectURL(blob);
                 const a = document.createElement('a');
                 a.href = url; a.download = 'hujra_backup.json'; a.click();
              }} className="bg-emerald-900 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2"><Download size={20}/> دابەزاندنی پاڵپشت</button>
           </div>
        </div>
      )}
    </Layout>
  );
};

export default App;