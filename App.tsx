
import React from 'react';
import { ViewState, Student, TeacherVisit, StudyLog, FinancialLog, BookProgress } from './types.ts';
import Layout from './components/Layout.tsx';
import StudentForm from './components/StudentForm.tsx';
import VisitForm from './components/VisitForm.tsx';
import Reports from './components/Reports.tsx';
import { analyzeStudentProgress } from './services/geminiService.ts';
import { db } from './services/db.ts';
import { 
  Book, Phone, MapPin, Search, PlusCircle, BrainCircuit, Users, History, 
  ArrowLeft, GraduationCap, BarChart3, User, BookOpen, Trash2, AlertTriangle, 
  Edit3, MessageSquare, Lightbulb, Download, Upload, Database, Settings, 
  Share2, Info, X, Loader2, CheckCircle2, Copy, Check, ShieldCheck, 
  Globe, Smartphone, Server, Github, Zap, UserPlus, Calendar, DollarSign, Plus, School, ChevronLeft, ChevronRight, FileText, HeartPulse,
  Wallet, TrendingUp, Activity, Clock, LineChart, ListFilter, Award, Save
} from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = React.useState<ViewState>('DASHBOARD');
  const [students, setStudents] = React.useState<Student[]>([]);
  const [visits, setVisits] = React.useState<TeacherVisit[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  
  const [selectedStudentId, setSelectedStudentId] = React.useState<string | null>(null);
  const [selectedMosque, setSelectedMosque] = React.useState<string | null>(null);
  const [visitViewMode, setVisitViewMode] = React.useState<'MOSQUES' | 'STUDENTS' | 'HISTORY'>('MOSQUES');
  
  const [editingStudent, setEditingStudent] = React.useState<Student | null>(null);
  const [editingVisit, setEditingVisit] = React.useState<TeacherVisit | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  
  const [selectedBookReport, setSelectedBookReport] = React.useState<string | null>(null);

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

  const handleSaveVisit = async (visit: TeacherVisit, extraData?: { studyLogs?: (Partial<StudyLog> & {isNewBook?: boolean, isBookCompleted?: boolean})[], financeLog?: Partial<FinancialLog> }) => {
    setIsLoading(true);
    try {
      await db.saveVisit(visit);
      const student = students.find(s => s.id === visit.studentId);
      if (student && extraData) {
        let updatedStudent = { ...student };
        
        if (extraData.studyLogs && extraData.studyLogs.length > 0) {
          extraData.studyLogs.forEach((log, index) => {
            const bName = log.bookName || 'نادیار';
            const cPage = log.currentPage || '0';
            const tName = log.teacherName || visit.teacherName;
            
            const newHistoryItem: StudyLog = {
              id: Date.now().toString() + '-' + index + '-s',
              date: visit.visitDate,
              bookName: bName,
              currentPage: cPage,
              teacherName: tName,
              notes: log.isBookCompleted 
                ? `ئەم کتێبە تەواو کرا لەلایەن مامۆستا ${tName}` 
                : `وانەی مامۆستا ${tName}`
            };
            updatedStudent.studyHistory = [newHistoryItem, ...(updatedStudent.studyHistory || [])];

            if (log.isNewBook) {
              const newBookEntry: BookProgress = {
                id: Date.now().toString() + '-' + index + '-nb',
                name: bName,
                pageCount: cPage,
                teacherName: tName,
                isCompleted: log.isBookCompleted || false
              };
              if (log.isBookCompleted) {
                updatedStudent.previousBooks = [newBookEntry, ...(updatedStudent.previousBooks || [])];
              } else {
                updatedStudent.currentBooks = [newBookEntry, ...(updatedStudent.currentBooks || [])];
              }
            } else {
              const bookToUpdate = updatedStudent.currentBooks?.find(b => b.name === bName);
              if (bookToUpdate) {
                if (log.isBookCompleted) {
                  updatedStudent.currentBooks = updatedStudent.currentBooks.filter(b => b.name !== bName);
                  updatedStudent.previousBooks = [
                    { ...bookToUpdate, pageCount: cPage, teacherName: tName, isCompleted: true },
                    ...(updatedStudent.previousBooks || [])
                  ];
                } else {
                  updatedStudent.currentBooks = updatedStudent.currentBooks.map(b => 
                    b.name === bName ? { ...b, pageCount: cPage, teacherName: tName } : b
                  );
                }
              }
            }
          });
        }

        if (extraData.financeLog?.amount) {
          const newFinanceLog: FinancialLog = {
            id: Date.now().toString() + '-f',
            date: visit.visitDate,
            amount: extraData.financeLog.amount,
            source: extraData.financeLog.source || 'هاوکاری کاتی سەردان',
            notes: `تۆمارکرا لە سەردانی مامۆستا ${visit.teacherName}`
          };
          updatedStudent.financialHistory = [newFinanceLog, ...(updatedStudent.financialHistory || [])];
        }

        await db.saveStudent(updatedStudent);
      }

      const [updatedStudents, updatedVisits] = await Promise.all([db.getAllStudents(), db.getAllVisits()]);
      setStudents(updatedStudents);
      setVisits(updatedVisits);
      
      setView('VISIT_HISTORY');
      setVisitViewMode('MOSQUES');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportBackup = async () => {
    const data = await db.exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hujra_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.students && data.visits) {
          if (confirm('ئایا دڵنیایت؟ هەموو زانیارییەکانی ئێستات دەسڕێتەوە و زانیارییە نوێیەکان جێگەی دەگرنەوە.')) {
            setIsLoading(true);
            await db.importAllData(data);
            const [loadedStudents, loadedVisits] = await Promise.all([
              db.getAllStudents(),
              db.getAllVisits()
            ]);
            setStudents(loadedStudents);
            setVisits(loadedVisits);
            alert('زانیارییەکان بە سەرکەوتوویی گەڕێنرانەوە.');
          }
        } else {
          alert('فایلەکە نادروستە.');
        }
      } catch (err) {
        alert('هەڵەیەک لە خوێندنەوەی فایلەکەدا هەیە.');
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsText(file);
  };

  const filteredStudents = students.filter(s => s.fullName.toLowerCase().includes(searchTerm.toLowerCase()));
  const selectedStudent = students.find(s => s.id === selectedStudentId);
  const mosques = Array.from(new Set(students.map(s => s.currentMosque))).filter(Boolean).sort();

  return (
    <Layout currentView={view} onViewChange={(v) => { setView(v); if(v === 'VISIT_HISTORY') setVisitViewMode('MOSQUES'); }}>
      {isLoading && (
         <div className="fixed inset-0 bg-white/50 backdrop-blur-sm z-[100] flex items-center justify-center">
            <Loader2 className="animate-spin text-emerald-900" size={48} />
         </div>
      )}

      {view === 'DASHBOARD' && (
        <div className="space-y-6">
          <div className="bg-emerald-900 rounded-[2.5rem] p-8 text-white kurdish-pattern shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-500">
             <div className="relative z-10 text-right">
                <h2 className="text-3xl font-black mb-1">سیستەمی حوجرە</h2>
                <p className="text-emerald-100 opacity-80 text-sm font-bold">بەدواداچوون و بەڕێوەبردنی پێشکەوتنی فەقێکان</p>
                <div className="flex gap-3 mt-10">
                   <button onClick={() => setView('ADD_VISIT')} className="bg-amber-500 text-emerald-950 px-6 py-4 rounded-2xl text-xs font-black flex items-center gap-2 shadow-xl active:scale-95 transition-all">
                     <History size={18} /> تۆماری سەردانی نوێ
                   </button>
                   <button onClick={() => setView('ADD_STUDENT')} className="bg-white/10 backdrop-blur-md text-white px-6 py-4 rounded-2xl text-xs font-black border border-white/20 active:scale-95 transition-all">
                     <UserPlus size={18} /> فەقێی نوێ
                   </button>
                </div>
             </div>
             <div className="absolute left-[-30px] bottom-[-30px] opacity-10 rotate-12">
               <GraduationCap size={220} />
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-7 rounded-[2.5rem] shadow-md border border-emerald-50 text-center cursor-pointer active:scale-95 transition-all" onClick={() => setView('STUDENT_LIST')}>
               <Users className="mx-auto text-emerald-700 mb-2" size={32} />
               <p className="text-2xl font-black text-emerald-950">{students.length}</p>
               <p className="text-[10px] font-bold text-gray-400 uppercase">فەقێکان</p>
            </div>
            <div className="bg-white p-7 rounded-[2.5rem] shadow-md border border-blue-50 text-center cursor-pointer active:scale-95 transition-all" onClick={() => { setView('VISIT_HISTORY'); setVisitViewMode('MOSQUES'); }}>
               <History className="mx-auto text-blue-700 mb-2" size={32} />
               <p className="text-2xl font-black text-blue-950">{visits.length}</p>
               <p className="text-[10px] font-bold text-gray-400 uppercase">سەردانەکان</p>
            </div>
          </div>

          <div className="space-y-4 pt-4">
             <div className="flex justify-between items-center px-2">
               <h3 className="font-black text-gray-800">دوایین فەقێ تۆمارکراوەکان</h3>
               <button onClick={() => setView('STUDENT_LIST')} className="text-emerald-700 text-xs font-black">هەمووی</button>
             </div>
             {students.slice(-3).reverse().map(s => (
                <div key={s.id} onClick={() => { setSelectedStudentId(s.id); setView('STUDENT_DETAIL'); }} className="bg-white p-5 rounded-[2.5rem] border border-gray-50 flex items-center gap-4 cursor-pointer active:scale-95 transition-all shadow-sm">
                   <div className="w-14 h-14 bg-emerald-900 rounded-2xl flex items-center justify-center text-white font-black kurdish-pattern overflow-hidden">
                     {s.photo ? <img src={s.photo} className="w-full h-full object-cover" alt="" /> : s.fullName[0]}
                   </div>
                   <div className="flex-1 text-right">
                     <h4 className="font-black text-sm text-gray-950">{s.fullName}</h4>
                     <p className="text-[10px] text-emerald-700 font-bold">حوجرەی {s.currentMosque}</p>
                   </div>
                   <ChevronLeft size={20} className="text-gray-300" />
                </div>
             ))}
          </div>
        </div>
      )}

      {view === 'VISIT_HISTORY' && (
        <div className="space-y-6 text-right">
          <div className="flex justify-between items-center px-1">
             <h2 className="text-2xl font-black text-emerald-950">مێژووی سەردانەکان</h2>
             <div className="flex gap-2">
               <button onClick={() => setView('ADD_VISIT')} className="bg-amber-500 text-emerald-950 px-4 py-2 rounded-xl font-black text-xs flex items-center gap-2 active:scale-90 transition-all shadow-md">
                 <Plus size={16}/> تۆماری سەردان
               </button>
               {visitViewMode !== 'MOSQUES' && (
                 <button onClick={() => {
                    if(visitViewMode === 'HISTORY') setVisitViewMode('STUDENTS');
                    else setVisitViewMode('MOSQUES');
                 }} className="bg-emerald-50 text-emerald-800 px-4 py-2 rounded-xl font-black text-xs flex items-center gap-2">گەڕانەوە <ArrowLeft size={16}/></button>
               )}
             </div>
          </div>

          {visitViewMode === 'MOSQUES' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-300">
              {mosques.map(m => (
                <div key={m} onClick={() => { setSelectedMosque(m); setVisitViewMode('STUDENTS'); }} className="bg-white p-7 rounded-[2.5rem] border border-gray-100 shadow-md flex items-center justify-between cursor-pointer active:scale-95 transition-all">
                   <ChevronLeft size={24} className="text-gray-200" />
                   <div className="flex items-center gap-4">
                      <div className="text-right">
                        <h4 className="font-black text-emerald-900 text-lg">حوجرەی {m}</h4>
                        <p className="text-xs text-amber-600 font-bold">{students.filter(s => s.currentMosque === m).length} فەقێ</p>
                      </div>
                      <div className="p-4 bg-emerald-50 text-emerald-700 rounded-3xl"><School size={28}/></div>
                   </div>
                </div>
              ))}
              {mosques.length === 0 && <p className="col-span-2 text-center text-gray-400 py-10 font-bold italic">هیچ حوجرەیەک نییە بۆ نیشاندان</p>}
            </div>
          )}

          {visitViewMode === 'STUDENTS' && (
            <div className="space-y-3 animate-in slide-in-from-right-4 duration-300">
              <h3 className="font-black text-amber-800 text-sm px-2">فەقێکانی حوجرەی {selectedMosque}</h3>
              {students.filter(s => s.currentMosque === selectedMosque).map(s => (
                <div key={s.id} onClick={() => { setSelectedStudentId(s.id); setVisitViewMode('HISTORY'); }} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-md flex items-center justify-between cursor-pointer active:scale-95 transition-all">
                   <div className="flex items-center gap-3">
                      <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-xl font-black">
                        {visits.filter(v => v.studentId === s.id).length} سەردان
                      </span>
                      <ChevronLeft size={20} className="text-gray-200" />
                   </div>
                   <div className="flex items-center gap-5">
                      <div className="text-right">
                        <h4 className="font-black text-gray-900 text-lg">{s.fullName}</h4>
                      </div>
                      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center font-black text-emerald-900 kurdish-pattern overflow-hidden shadow-inner">
                        {s.photo ? <img src={s.photo} className="w-full h-full object-cover" alt="" /> : s.fullName[0]}
                      </div>
                   </div>
                </div>
              ))}
            </div>
          )}

          {visitViewMode === 'HISTORY' && (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
              <button onClick={() => setView('STUDENT_DETAIL')} className="w-full bg-emerald-900 text-white py-4 rounded-2xl font-black text-sm shadow-lg mb-4">بینینی پڕۆفایلی {students.find(s => s.id === selectedStudentId)?.fullName}</button>
              {visits.filter(v => v.studentId === selectedStudentId).sort((a,b) => b.visitDate.localeCompare(a.visitDate)).map(v => (
                <div key={v.id} className="bg-white p-7 rounded-[3rem] border-2 border-gray-50 shadow-lg text-right animate-in slide-in-from-bottom-2">
                  <div className="flex justify-between items-start mb-6">
                     <span className="text-xs bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl font-black">{v.visitDate}</span>
                     <div className="text-right">
                        <h4 className="font-black text-emerald-950 text-lg">مامۆستا: {v.teacherName}</h4>
                        <p className="text-xs text-amber-600 font-bold">شوێن: {v.location}</p>
                     </div>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100 space-y-4 shadow-inner">
                     <p className="text-sm text-black font-bold leading-relaxed">{v.studentNotes}</p>
                     {v.suggestions && <p className="text-xs text-amber-700 font-black italic pt-3 border-t border-gray-200">پێشنیار: {v.suggestions}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {view === 'STUDENT_DETAIL' && selectedStudent && (
        <div className="space-y-6 text-right pb-10 animate-in fade-in duration-300">
          <div className="flex justify-between items-center px-1">
            <div className="flex gap-2">
              <button onClick={() => { setEditingStudent(selectedStudent); setView('EDIT_STUDENT'); }} className="bg-blue-50 text-blue-700 px-4 py-3 rounded-2xl font-black text-xs flex items-center gap-2 active:scale-95 shadow-sm"><Edit3 size={16}/> دەستکاری</button>
              <button onClick={() => setView('ADD_VISIT')} className="bg-emerald-900 text-white px-4 py-3 rounded-2xl font-black text-xs flex items-center gap-2 active:scale-95 shadow-sm"><Plus size={16}/> تۆماری سەردان</button>
            </div>
            <button onClick={() => setView('STUDENT_LIST')} className="flex items-center text-emerald-800 font-black gap-2">گەڕانەوە <ArrowLeft size={24}/></button>
          </div>

          <div className="bg-white p-10 rounded-[3.5rem] shadow-2xl border border-gray-50 text-center space-y-6">
             <div className="relative inline-block">
               {selectedStudent.photo ? (
                 <img src={selectedStudent.photo} className="w-40 h-40 rounded-[2.5rem] object-cover border-4 border-white shadow-2xl" alt="" />
               ) : (
                 <div className="w-32 h-32 bg-emerald-900 text-white rounded-[2.5rem] flex items-center justify-center text-5xl font-black kurdish-pattern mx-auto shadow-2xl">{selectedStudent.fullName[0]}</div>
               )}
             </div>
             <div>
                <h2 className="text-3xl font-black text-gray-950 mb-1">{selectedStudent.fullName}</h2>
                <div className="flex justify-center gap-2">
                  <span className="text-emerald-700 font-black text-xs bg-emerald-50 px-3 py-1 rounded-full">حوجرەی {selectedStudent.currentMosque}</span>
                  <span className="text-blue-700 font-black text-xs bg-blue-50 px-3 py-1 rounded-full">ئاستی {selectedStudent.educationLevel}</span>
                </div>
             </div>
          </div>

          <div className="bg-white p-7 rounded-[3rem] shadow-lg border border-gray-50 overflow-hidden">
             <h3 className="font-black text-xl text-emerald-900 mb-6 flex items-center justify-end gap-2 border-b border-gray-50 pb-4">
                <TrendingUp size={24} className="text-emerald-600" /> مێژووی گشتی خوێندن
             </h3>
             <div className="space-y-4">
                {selectedStudent.studyHistory && selectedStudent.studyHistory.length > 0 ? (
                  selectedStudent.studyHistory.sort((a,b) => b.date.localeCompare(a.date)).map(log => (
                    <div key={log.id} className="p-5 bg-gray-50 rounded-3xl flex justify-between items-center border border-gray-100 shadow-sm">
                       <div className="text-left">
                          <p className="font-mono text-[10px] text-gray-400">{log.date}</p>
                          <p className="text-[10px] font-black text-emerald-600 mt-1">مامۆستا: {log.teacherName || 'نادیار'}</p>
                       </div>
                       <div className="text-right">
                          <p className="font-black text-sm text-gray-900">{log.bookName}</p>
                          <p className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-lg inline-block mt-1">لاپەڕە {log.currentPage}</p>
                       </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-400 py-10 font-bold italic">هیچ مێژوویەک نییە</p>
                )}
             </div>
          </div>

          <div className="bg-white p-7 rounded-[3rem] shadow-lg border border-amber-50 overflow-hidden">
             <h3 className="font-black text-xl text-amber-900 mb-6 flex items-center justify-end gap-2 border-b border-amber-50 pb-4">
                <DollarSign size={24} className="text-amber-600" /> مێژووی هاوکارییە داراییەکان
             </h3>
             <div className="overflow-x-auto rounded-2xl border border-amber-50">
                <table className="w-full text-right border-collapse">
                   <thead className="bg-amber-50">
                      <tr>
                        <th className="p-4 text-xs font-black text-amber-800 border-b">بەروار</th>
                        <th className="p-4 text-xs font-black text-amber-800 border-b">بڕ (دینار)</th>
                        <th className="p-4 text-xs font-black text-amber-800 border-b">سەرچاوە</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-amber-50">
                      {selectedStudent.financialHistory && selectedStudent.financialHistory.length > 0 ? (
                        selectedStudent.financialHistory.sort((a,b) => b.date.localeCompare(a.date)).map(log => (
                          <tr key={log.id} className="hover:bg-amber-50/10 transition-colors">
                             <td className="p-4 font-black text-gray-400 text-xs font-mono">{log.date}</td>
                             <td className="p-4 font-black text-amber-950 text-sm">{parseInt(log.amount).toLocaleString()}</td>
                             <td className="p-4 font-bold text-amber-700 text-xs">{log.source}</td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan={3} className="p-8 text-center text-gray-400 font-bold italic">هیچ هاوکارییەک تۆمار نەکراوە</td></tr>
                      )}
                   </tbody>
                </table>
             </div>
          </div>
        </div>
      )}

      {view === 'STUDENT_LIST' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex justify-between items-center px-1">
             <h2 className="text-2xl font-black text-emerald-950">لیستی فەقێکان</h2>
             <button onClick={() => setView('ADD_STUDENT')} className="bg-amber-500 text-emerald-950 px-6 py-3 rounded-2xl text-xs font-black shadow-lg active:scale-95 transition-all">+ تۆماری فەقێ</button>
          </div>
          <div className="relative">
             <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
             <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="گەڕان بەدوای ناوی فەقێ..." className="w-full bg-white pr-16 pl-6 py-6 rounded-[2.5rem] shadow-lg border-2 border-gray-50 font-black text-right text-black outline-none focus:border-emerald-500 transition-all" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {filteredStudents.map(s => (
               <div key={s.id} onClick={() => { setSelectedStudentId(s.id); setView('STUDENT_DETAIL'); }} className="bg-white p-6 rounded-[3rem] shadow-md border border-gray-50 flex items-center gap-5 cursor-pointer active:scale-95 transition-all">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center font-black text-2xl text-emerald-900 kurdish-pattern overflow-hidden shadow-inner">
                    {s.photo ? <img src={s.photo} className="w-full h-full object-cover" alt="" /> : s.fullName[0]}
                  </div>
                  <div className="flex-1 text-right">
                    <h3 className="font-black text-lg text-gray-950">{s.fullName}</h3>
                    <p className="text-xs text-emerald-700 font-bold">حوجرەی {s.currentMosque}</p>
                  </div>
                  <ChevronLeft className="text-gray-200" size={28} />
               </div>
             ))}
          </div>
        </div>
      )}

      {view === 'REPORTS' && <Reports students={students} visits={visits} />}
      {(view === 'ADD_STUDENT' || view === 'EDIT_STUDENT') && <StudentForm initialData={editingStudent} onSave={handleSaveStudent} onCancel={() => { setEditingStudent(null); setView('DASHBOARD'); }} />}
      {(view === 'ADD_VISIT' || view === 'EDIT_VISIT') && <VisitForm students={students} initialData={editingVisit} onSave={handleSaveVisit} onCancel={() => { setView('VISIT_HISTORY'); setVisitViewMode('MOSQUES'); }} />}
      
      {view === 'SETTINGS' && (
        <div className="space-y-6 pb-10 text-right">
          <div className="bg-white p-10 rounded-[3.5rem] shadow-2xl border border-gray-50 space-y-8 animate-in zoom-in-95">
             <div className="w-24 h-24 bg-emerald-100 text-emerald-900 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-inner"><Database size={48}/></div>
             <h2 className="text-2xl font-black text-emerald-950 text-center">پاراستنی زانیارییەکان</h2>
             
             <div className="space-y-4">
                <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100">
                  <h3 className="font-black text-emerald-900 mb-2 flex items-center justify-end gap-2">دابەزاندنی پاڵپشت <Download size={18}/></h3>
                  <p className="text-xs text-gray-500 font-bold mb-4">هەموو زانیارییەکان وەک فایلێک دابەزێنە بۆ ئەوەی لە مۆبایلێکی تر بەکاری بهێنیتەوە.</p>
                  <button onClick={handleExportBackup} className="w-full bg-emerald-900 text-white py-4 rounded-2xl font-black text-sm shadow-md active:scale-95 transition-all">دابەزاندنی پاڵپشت</button>
                </div>

                <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100">
                  <h3 className="font-black text-amber-900 mb-2 flex items-center justify-end gap-2">گەڕاندنەوەی پاڵپشت <Upload size={18}/></h3>
                  <p className="text-xs text-gray-500 font-bold mb-4">فایلە پاڵپشتەکەت هەڵبژێرە بۆ ئەوەی زانیارییەکانت بگەڕێنیتەوە.</p>
                  <label className="block w-full bg-amber-500 text-emerald-950 py-4 rounded-2xl font-black text-sm shadow-md active:scale-95 transition-all text-center cursor-pointer">
                    هەڵبژاردنی فایل
                    <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
                  </label>
                </div>

                <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100">
                   <p className="text-[10px] font-black text-blue-800 leading-relaxed">تێبینی: زانیارییەکان بە شێوەی خودکار لەناو مۆبایلەکەتدا خەزن کراون (IndexedDB)، ئەم بەشە تەنها بۆ گواستنەوەی داتایە یان بۆ دڵنیایی زیاتر.</p>
                </div>
             </div>
             
             <button onClick={() => setView('DASHBOARD')} className="w-full bg-gray-100 text-gray-600 py-5 rounded-2xl font-black">گەڕانەوە بۆ سەرەکی</button>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;
