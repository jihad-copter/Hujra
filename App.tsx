
import React from 'react';
import { ViewState, Student, TeacherVisit } from './types';
import Layout from './components/Layout';
import StudentForm from './components/StudentForm';
import VisitForm from './components/VisitForm';
import Reports from './components/Reports';
import { analyzeStudentProgress } from './services/geminiService';
import { db } from './services/db';
import { Book, Phone, MapPin, Search, PlusCircle, BrainCircuit, ExternalLink, Users, History, ArrowLeft, GraduationCap, BarChart3, User, BookOpen, Trash2, AlertTriangle, Edit3, MessageSquare, Lightbulb, Download, Upload, Database, Settings, Share2, Info, X, Loader2, CheckCircle2, Copy, Check, ShieldCheck, Globe, Smartphone, Server, Github, Zap } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = React.useState<ViewState>('DASHBOARD');
  const [students, setStudents] = React.useState<Student[]>([]);
  const [visits, setVisits] = React.useState<TeacherVisit[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [dbStatus, setDbStatus] = React.useState<'CONNECTING' | 'CONNECTED' | 'ERROR'>('CONNECTING');
  
  const [selectedStudentId, setSelectedStudentId] = React.useState<string | null>(null);
  const [editingStudent, setEditingStudent] = React.useState<Student | null>(null);
  const [editingVisit, setEditingVisit] = React.useState<TeacherVisit | null>(null);
  const [aiAnalysis, setAiAnalysis] = React.useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState<string | null>(null);

  React.useEffect(() => {
    const initDB = async () => {
      try {
        await db.open();
        setDbStatus('CONNECTED');
        const [loadedStudents, loadedVisits] = await Promise.all([
          db.getAllStudents(),
          db.getAllVisits()
        ]);
        setStudents(loadedStudents);
        setVisits(loadedVisits);
      } catch (err) {
        setDbStatus('ERROR');
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
      const updatedStudents = await db.getAllStudents();
      setStudents(updatedStudents);
      setEditingStudent(null);
      setSelectedStudentId(student.id);
      setView('STUDENT_DETAIL');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteStudent = async (id: string) => {
    setIsLoading(true);
    try {
      await db.deleteStudent(id);
      const updatedStudents = await db.getAllStudents();
      setStudents(updatedStudents);
      setSelectedStudentId(null);
      setShowDeleteConfirm(null);
      setView('STUDENT_LIST');
    } finally {
      setIsLoading(false);
    }
  };

  const exportData = () => {
    const data = { students, visits, version: "2.0" };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hujra_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const importData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          if (data.students) {
            setIsLoading(true);
            for (const s of data.students) await db.saveStudent(s);
            if (data.visits) for (const v of data.visits) await db.saveVisit(v);
            const [loadedStudents, loadedVisits] = await Promise.all([db.getAllStudents(), db.getAllVisits()]);
            setStudents(loadedStudents);
            setVisits(loadedVisits);
            alert("زانیارییەکان بە سەرکەوتوویی بارکران");
          }
        } catch (err) {
          alert("فایلی هەڵە");
        } finally {
          setIsLoading(false);
        }
      };
      reader.readAsText(file);
    }
  };

  const runAnalysis = async (student: Student) => {
    setIsAnalyzing(true);
    const result = await analyzeStudentProgress(student);
    setAiAnalysis(result);
    setIsAnalyzing(false);
  };

  const filteredStudents = students.filter(s => s.fullName.toLowerCase().includes(searchTerm.toLowerCase()));
  const selectedStudent = students.find(s => s.id === selectedStudentId);

  return (
    <Layout currentView={view} onViewChange={setView}>
      {view === 'DASHBOARD' && (
        <div className="space-y-6">
          <div className="bg-emerald-900 rounded-[2.5rem] p-8 text-white kurdish-pattern shadow-xl relative overflow-hidden">
             <div className="relative z-10 text-right">
                <div className="flex items-center justify-end gap-2 mb-4">
                  <span className="bg-emerald-800 text-[10px] px-3 py-1 rounded-full flex items-center gap-1 border border-emerald-700">
                    داتابەیس ناوخۆیی <ShieldCheck size={12} className="text-emerald-400" />
                  </span>
                </div>
                <h2 className="text-3xl font-black mb-1">بەڕێوەبەری حوجرە</h2>
                <p className="text-emerald-100 opacity-80 text-sm">سیستەمی تۆماری فەقێ و حوجرەکان</p>
                <div className="flex gap-2 mt-8">
                   <button onClick={() => setView('SETTINGS')} className="bg-amber-500 text-emerald-950 px-6 py-3 rounded-2xl text-xs font-black flex items-center gap-2 active:scale-95 transition-all shadow-lg">
                     <Zap size={16} /> چۆنیەتی بڵاوکردنەوە و بەکارهێنان
                   </button>
                </div>
             </div>
             <div className="absolute left-[-20px] bottom-[-20px] opacity-10 rotate-12">
               <GraduationCap size={180} />
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-7 rounded-[2.5rem] shadow-sm border border-emerald-50 text-center active:scale-95 transition-all cursor-pointer" onClick={() => setView('STUDENT_LIST')}>
               <Users className="mx-auto text-emerald-700 mb-3" size={32} />
               <p className="text-3xl font-black text-emerald-950">{students.length}</p>
               <p className="text-[10px] font-black text-gray-400 uppercase">فەقێکان</p>
            </div>
            <div className="bg-white p-7 rounded-[2.5rem] shadow-sm border border-blue-50 text-center active:scale-95 transition-all cursor-pointer" onClick={() => setView('REPORTS')}>
               <BarChart3 className="mx-auto text-blue-700 mb-3" size={32} />
               <p className="text-3xl font-black text-blue-950">{visits.length}</p>
               <p className="text-[10px] font-black text-gray-400 uppercase">سەردانەکان</p>
            </div>
          </div>

          <div className="bg-amber-50 p-6 rounded-[2.5rem] border border-amber-100 flex items-center justify-between">
             <div className="flex gap-2">
                <button onClick={exportData} className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-amber-600 shadow-sm border border-amber-100 active:scale-90 transition-all"><Download size={20}/></button>
                <label className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100 active:scale-90 transition-all cursor-pointer">
                   <Upload size={20}/><input type="file" accept=".json" onChange={importData} className="hidden" />
                </label>
             </div>
             <div className="text-right px-4 flex-1">
                <h4 className="font-black text-amber-950 text-sm">گوێزەرەوەی داتا</h4>
                <p className="text-[10px] text-amber-700 font-bold">هەناردەکردن و هاوردەکردنی زانیارییەکان</p>
             </div>
             <div className="w-12 h-12 bg-amber-200/50 rounded-2xl flex items-center justify-center text-amber-700"><Database size={24}/></div>
          </div>

          <div className="space-y-4">
             <div className="flex justify-between items-center px-2">
               <h3 className="font-black text-gray-800">دوایین تۆمارەکان</h3>
               <button onClick={() => setView('STUDENT_LIST')} className="text-emerald-700 text-xs font-black">بینینی هەمووی</button>
             </div>
             {students.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-3xl border border-dashed border-gray-200 text-gray-400 text-xs font-bold">هیچ فەقێیەک تۆمار نەکراوە</div>
             ) : (
                students.slice(-3).reverse().map(s => (
                  <div key={s.id} onClick={() => { setSelectedStudentId(s.id); setView('STUDENT_DETAIL'); }} className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-50 flex items-center gap-4 active:scale-95 transition-all cursor-pointer">
                     <div className="w-14 h-14 bg-emerald-900 rounded-2xl flex items-center justify-center text-white font-black kurdish-pattern">
                       {s.photo ? <img src={s.photo} className="w-full h-full object-cover rounded-2xl" /> : s.fullName[0]}
                     </div>
                     <div className="flex-1 text-right">
                       <h4 className="font-black text-gray-900">{s.fullName}</h4>
                       <p className="text-[10px] text-gray-400 font-bold">حوجرەی {s.currentMosque}</p>
                     </div>
                     <ArrowLeft size={18} className="text-gray-300" />
                  </div>
                ))
             )}
          </div>
        </div>
      )}

      {view === 'SETTINGS' && (
        <div className="space-y-6 text-right pb-10">
           <h2 className="text-2xl font-black text-emerald-950">ڕێنمایی بڵاوکردنەوە لە Vercel</h2>
           
           <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-8">
              <section className="space-y-4">
                 <div className="flex items-center justify-end gap-3 text-blue-600 font-black">
                    هەنگاوی یەکەم: کۆدەکە دابنێ <Github size={20} />
                 </div>
                 <p className="text-sm text-gray-600 leading-relaxed font-bold">
                    کۆدی بەرنامەکە لە فۆڵدەرێکدا لە کۆمپیوتەرەکەت دابنێ و پاشان بەرزی بکەرەوە بۆ ناو 
                    <span className="text-gray-900"> GitHub </span>. ئەمە یەکەم هەنگاوە بۆ ئەوەی Vercel بتوانێت کۆدەکەت بخوێنێتەوە.
                 </p>
              </section>

              <div className="h-px bg-gray-50 w-full"></div>

              <section className="space-y-4">
                 <div className="flex items-center justify-end gap-3 text-emerald-700 font-black">
                    هەنگاوی دووەم: بڵاوکردنەوە لە Vercel <Zap size={20} />
                 </div>
                 <div className="space-y-3 text-sm text-gray-600 font-bold">
                    <p>١. بڕۆ ناو وێبسایتی <span className="text-blue-600">vercel.com</span> و بە GitHub بچۆ ژوورەوە.</p>
                    <p>٢. پڕۆژە نوێیەکە (Repository) هەڵبژێرە.</p>
                    <p className="bg-amber-50 p-4 rounded-2xl border border-amber-100 text-amber-900">
                      <span className="font-black block mb-1">٣. زۆر گرنگ (Environment Variables):</span>
                      لە کاتی ڕێکخستنی پڕۆژەکەدا، کلیلی <span className="font-black">API_KEY</span> زیاد بکە و کلیلە تایبەتەکەی خۆتی تێدا دابنێ بۆ ئەوەی زیرەکی دەستکرد کار بکات.
                    </p>
                    <p>٤. دوگمەی <span className="font-black text-gray-950">Deploy</span> دابگرە.</p>
                 </div>
              </section>

              <div className="h-px bg-gray-50 w-full"></div>

              <section className="space-y-4">
                 <div className="flex items-center justify-end gap-3 text-purple-700 font-black">
                    هەنگاوی سێیەم: دابەزاندن بۆ موبایل <Smartphone size={20} />
                 </div>
                 <p className="text-sm text-gray-600 leading-relaxed font-bold">
                    دوای بڵاوکردنەوە، Vercel لینکێکی فەرمیت پێدەدات. ئەو لینکە لە Safari یان Chrome بکەرەوە و بژاردەی 
                    <span className="font-black text-gray-900"> Add to Home Screen </span> هەڵبژێرە بۆ ئەوەی وەک ئەپ دابەزێت.
                 </p>
              </section>
           </div>

           <div className="bg-emerald-900 p-8 rounded-[3rem] text-white kurdish-pattern text-center space-y-4 shadow-xl">
              <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
                <Info size={32} className="text-emerald-950" />
              </div>
              <p className="text-sm font-bold opacity-90 leading-relaxed">
                تێبینی: هەرکەسێک بەرنامەکە دابەزێنێت، داتاکانی لەسەر موبایلەکەی خۆی دەبێت. ئەگەر ویستت زانیارییەکانت بدەیت بە کەسێکی تر، دەبێت فایلی <span className="font-black text-amber-400">Backup</span>ی بۆ بنێریت.
              </p>
           </div>
        </div>
      )}

      {view === 'STUDENT_LIST' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center px-1">
             <h2 className="text-2xl font-black text-emerald-950">لیستی فەقێکان</h2>
             <div className="bg-emerald-100 text-emerald-700 px-4 py-1 rounded-full text-xs font-black">{students.length} کەس</div>
          </div>
          <div className="relative">
             <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
             <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="گەڕان بەپێی ناو..." className="w-full bg-white pr-14 pl-5 py-5 rounded-[2rem] shadow-sm border-2 border-gray-100 font-black outline-none focus:border-emerald-500 text-right" />
          </div>
          <div className="space-y-3">
             {filteredStudents.map(s => (
               <div key={s.id} onClick={() => { setSelectedStudentId(s.id); setView('STUDENT_DETAIL'); }} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-50 flex items-center gap-5 active:bg-emerald-50 transition-all cursor-pointer">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center font-black text-2xl text-emerald-900 kurdish-pattern">
                    {s.photo ? <img src={s.photo} className="w-full h-full object-cover rounded-2xl" /> : s.fullName[0]}
                  </div>
                  <div className="flex-1 text-right">
                    <h3 className="font-black text-xl text-gray-950">{s.fullName}</h3>
                    <p className="text-xs text-gray-400 font-bold mt-1">ئاستی {s.educationLevel}</p>
                  </div>
                  <ArrowLeft className="text-gray-200" size={24} />
               </div>
             ))}
          </div>
        </div>
      )}

      {view === 'REPORTS' && <Reports students={students} visits={visits} />}

      {(view === 'ADD_STUDENT' || view === 'EDIT_STUDENT') && (
        <StudentForm initialData={editingStudent} onSave={handleSaveStudent} onCancel={() => { setEditingStudent(null); setView('DASHBOARD'); }} />
      )}

      {(view === 'ADD_VISIT' || view === 'EDIT_VISIT') && (
        <VisitForm students={students} initialData={editingVisit} onSave={async (v) => { await db.saveVisit(v); setVisits(await db.getAllVisits()); setView('VISIT_HISTORY'); }} onCancel={() => setView('VISIT_HISTORY')} />
      )}

      {view === 'VISIT_HISTORY' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center px-1">
             <h2 className="text-2xl font-black text-emerald-950">سەردانەکان</h2>
             <button onClick={() => setView('ADD_VISIT')} className="bg-amber-500 text-emerald-950 px-6 py-3 rounded-2xl font-black text-sm shadow-lg active:scale-95 transition-all">+ سەردان</button>
          </div>
          <div className="space-y-5">
            {visits.map(v => (
              <div key={v.id} className="bg-white p-7 rounded-[2.5rem] border border-gray-100 shadow-sm text-right relative overflow-hidden">
                <div className="absolute top-0 right-0 w-2 h-full bg-amber-500"></div>
                <div className="flex justify-between items-start mb-4">
                   <div className="flex gap-2">
                      <button onClick={async () => { if(window.confirm('بسرێتەوە؟')) { await db.deleteVisit(v.id); setVisits(await db.getAllVisits()); } }} className="text-red-400 p-2"><Trash2 size={18}/></button>
                      <button onClick={() => { setEditingVisit(v); setView('EDIT_VISIT'); }} className="text-blue-500 p-2"><Edit3 size={18}/></button>
                   </div>
                   <div>
                     <span className="text-[10px] text-gray-400 font-black block mb-1">{v.visitDate}</span>
                     <h4 className="font-black text-emerald-900">مامۆستا {v.teacherName}</h4>
                   </div>
                </div>
                <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-2xl border border-gray-100 font-bold">{v.studentNotes}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {view === 'STUDENT_DETAIL' && selectedStudent && (
        <div className="space-y-6 text-right pb-10">
          <div className="flex justify-between items-center">
            <button onClick={() => { setEditingStudent(selectedStudent); setView('EDIT_STUDENT'); }} className="bg-blue-50 text-blue-700 px-6 py-4 rounded-2xl font-black text-sm flex items-center gap-2 active:scale-95 shadow-md"><Edit3 size={20}/> دەستکاری</button>
            <button onClick={() => setView('STUDENT_LIST')} className="flex items-center text-emerald-800 font-black gap-2">گەڕانەوە <ArrowLeft size={24}/></button>
          </div>

          <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-gray-50 text-center space-y-6">
             <div className="relative inline-block">
               {selectedStudent.photo ? (
                 <img src={selectedStudent.photo} className="w-40 h-40 rounded-[2.5rem] object-cover border-4 border-white shadow-2xl" />
               ) : (
                 <div className="w-32 h-32 bg-emerald-900 text-white rounded-[2.5rem] flex items-center justify-center text-5xl font-black kurdish-pattern mx-auto shadow-2xl">{selectedStudent.fullName[0]}</div>
               )}
               <div className="absolute -bottom-2 -right-2 bg-amber-500 p-3 rounded-2xl shadow-xl text-emerald-950"><GraduationCap size={24}/></div>
             </div>
             <div>
                <h2 className="text-4xl font-black text-gray-950">{selectedStudent.fullName}</h2>
                <p className="text-emerald-700 font-black text-lg mt-2">حوجرەی {selectedStudent.currentMosque}</p>
             </div>
             <div className="flex gap-4 justify-center">
                <a href={`tel:${selectedStudent.phone}`} className="w-16 h-16 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center active:scale-90 transition-all shadow-sm"><Phone size={28}/></a>
                <button onClick={() => runAnalysis(selectedStudent)} disabled={isAnalyzing} className="px-10 h-16 bg-emerald-950 text-white rounded-2xl font-black flex items-center gap-3 active:scale-95 transition-all shadow-xl disabled:opacity-50">
                  <BrainCircuit className={isAnalyzing ? 'animate-spin' : ''} /> {isAnalyzing ? 'چاوەڕوانبە...' : 'شیکردنەوەی AI'}
                </button>
             </div>
          </div>

          {aiAnalysis && (
             <div className="bg-amber-50 p-8 rounded-[2.5rem] border border-amber-100 shadow-inner animate-in zoom-in-95 duration-300">
                <h4 className="font-black text-amber-900 mb-4 flex items-center justify-end gap-2">ڕاپۆرتی زیرەکی دەستکرد <BrainCircuit size={20}/></h4>
                <p className="text-base text-amber-950 leading-relaxed italic whitespace-pre-wrap font-bold">{aiAnalysis}</p>
                <button onClick={() => setAiAnalysis(null)} className="mt-6 text-[10px] font-black text-amber-700 uppercase bg-white px-5 py-3 rounded-xl shadow-sm">داخستن</button>
             </div>
          )}

          <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-50 space-y-8">
             <div className="space-y-4">
                <h3 className="font-black text-2xl text-emerald-950 flex items-center justify-end gap-3">خوێندن و ئاست <BookOpen className="text-amber-500" /></h3>
                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-emerald-50 p-5 rounded-3xl text-center border border-emerald-100">
                      <p className="text-[10px] text-emerald-600 font-black mb-1">ئاستی زانستی</p>
                      <p className="font-black text-emerald-950">{selectedStudent.educationLevel}</p>
                   </div>
                   <div className="bg-emerald-50 p-5 rounded-3xl text-center border border-emerald-100">
                      <p className="text-[10px] text-emerald-600 font-black mb-1">مامۆستای ئێستا</p>
                      <p className="font-black text-emerald-950">{selectedStudent.currentTeacher}</p>
                   </div>
                </div>
             </div>

             <div className="space-y-4">
                <h3 className="font-black text-2xl text-emerald-950 flex items-center justify-end gap-3">کتێبەکان <Book className="text-amber-500" /></h3>
                {selectedStudent.currentBooks.map(b => (
                   <div key={b.id} className="p-5 bg-gray-50 rounded-[2rem] border border-gray-100 flex justify-between items-center group">
                      <div className="bg-emerald-900 text-white px-4 py-2 rounded-xl text-xs font-black shadow-md group-hover:scale-110 transition-all">ل: {b.pageCount}</div>
                      <div className="text-right">
                        <p className="font-black text-lg text-gray-900">{b.name}</p>
                        <p className="text-[10px] text-gray-400 font-bold">مامۆستا: {b.teacherName}</p>
                      </div>
                   </div>
                ))}
             </div>
          </div>

          <div className="pt-10">
            {showDeleteConfirm ? (
              <div className="bg-red-50 p-10 rounded-[3rem] border-2 border-red-200 text-center space-y-6 shadow-xl animate-in fade-in zoom-in-95">
                 <AlertTriangle size={48} className="text-red-600 mx-auto" />
                 <p className="font-black text-red-950">ئایا دڵنیایت لە سڕینەوەی ئەم فەقێیە و هەموو داتاکانی؟</p>
                 <div className="flex gap-4">
                    <button onClick={() => handleDeleteStudent(selectedStudent.id)} className="flex-1 bg-red-600 text-white h-16 rounded-2xl font-black shadow-lg">بەڵێ، بسڕەوە</button>
                    <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 bg-white border border-gray-200 h-16 rounded-2xl font-black text-gray-500">نەخێر</button>
                 </div>
              </div>
            ) : (
              <button onClick={() => setShowDeleteConfirm(selectedStudent.id)} className="w-full bg-white text-red-500 border-2 border-red-100 h-20 rounded-[2.5rem] font-black flex items-center justify-center gap-3 active:bg-red-50 shadow-sm transition-all"><Trash2 size={24}/> سڕینەوەی هەموو زانیارییەکان</button>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;
