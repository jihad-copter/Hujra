
import React from 'react';
import { TeacherVisit, Student, StudyLog, FinancialLog, BookProgress } from '../types';
import { Save, X, MapPin, User, FileText, Lightbulb, BookOpen, DollarSign, Calendar, School, Plus, Book, CheckCircle2, Trash2 } from 'lucide-react';

interface StudyUpdateItem {
  id: string;
  bookName: string;
  page: string;
  teacherName: string;
  isBookCompleted: boolean;
  isNewBook: boolean;
}

interface VisitFormProps {
  students: Student[];
  initialData?: TeacherVisit | null;
  onSave: (visit: TeacherVisit, extraData?: { studyLogs?: (Partial<StudyLog> & {isNewBook?: boolean, isBookCompleted?: boolean})[], financeLog?: Partial<FinancialLog> }) => void;
  onCancel: () => void;
}

const VisitForm: React.FC<VisitFormProps> = ({ students, initialData, onSave, onCancel }) => {
  const [formData, setFormData] = React.useState<Partial<TeacherVisit>>({
    studentId: '',
    teacherName: '',
    visitDate: new Date().toISOString().split('T')[0],
    location: '',
    studentNotes: '',
    hujraNotes: '',
    suggestions: '',
  });

  const [isOtherLocation, setIsOtherLocation] = React.useState(false);
  const [manualLocation, setManualLocation] = React.useState('');

  const selectedStudent = React.useMemo(() => 
    students.find(s => s.id === formData.studentId), 
  [formData.studentId, students]);

  const mosqueNames = React.useMemo(() => {
    const names = students.map(s => s.currentMosque).filter(n => n && n.trim() !== '');
    return Array.from(new Set(names)).sort();
  }, [students]);

  const [addProgress, setAddProgress] = React.useState(false);
  const [studyUpdates, setStudyUpdates] = React.useState<StudyUpdateItem[]>([
    { id: '1', bookName: '', page: '', teacherName: '', isBookCompleted: false, isNewBook: false }
  ]);
  const [financeUpdate, setFinanceUpdate] = React.useState({ amount: '', source: '' });

  React.useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      if (initialData.location && !mosqueNames.includes(initialData.location)) {
        setIsOtherLocation(true);
        setManualLocation(initialData.location);
      }
    }
  }, [initialData, mosqueNames]);

  const addStudyUpdateField = () => {
    setStudyUpdates([...studyUpdates, { id: Date.now().toString(), bookName: '', page: '', teacherName: '', isBookCompleted: false, isNewBook: false }]);
  };

  const removeStudyUpdateField = (id: string) => {
    setStudyUpdates(studyUpdates.filter(u => u.id !== id));
  };

  const updateStudyItem = (id: string, changes: Partial<StudyUpdateItem>) => {
    setStudyUpdates(prev => prev.map(u => u.id === id ? { ...u, ...changes } : u));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalLocation = isOtherLocation ? manualLocation : formData.location;
    const extraData: any = {};

    if (addProgress) {
      const validStudyLogs = studyUpdates
        .filter(u => u.bookName.trim() !== '')
        .map(u => ({
          bookName: u.bookName,
          currentPage: u.page,
          teacherName: u.teacherName || formData.teacherName, // Defaults to visit teacher if not specified
          date: formData.visitDate,
          isNewBook: u.isNewBook,
          isBookCompleted: u.isBookCompleted
        }));
      
      if (validStudyLogs.length > 0) {
        extraData.studyLogs = validStudyLogs;
      }

      if (financeUpdate.amount) {
        extraData.financeLog = { 
          amount: financeUpdate.amount, 
          source: financeUpdate.source || 'هاوکاری کاتی سەردان', 
          date: formData.visitDate, 
          notes: `وەردەگیرا لە کاتی سەردان` 
        };
      }
    }

    onSave({ 
      ...formData, 
      location: finalLocation,
      id: initialData?.id || Date.now().toString() 
    } as TeacherVisit, extraData);
  };

  const inputClasses = "w-full border-2 border-gray-100 bg-white p-4 rounded-2xl outline-none focus:border-emerald-500 text-right text-black font-bold shadow-sm transition-all";
  const labelClasses = "flex items-center justify-end gap-2 text-[11px] font-black text-emerald-800 mb-2 mr-1 uppercase";

  return (
    <div className="bg-white p-6 rounded-[2.5rem] shadow-2xl border border-gray-100 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300 pb-20">
      <h2 className="text-xl font-black text-emerald-900 mb-8 text-center">
        {initialData ? 'دەستکاریکردنی سەردان' : 'تۆمارکردنی سەردانی نوێ'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClasses}>هەڵبژاردنی فەقێ <User size={14}/></label>
            <select required value={formData.studentId} onChange={e => setFormData({...formData, studentId: e.target.value})} className={inputClasses}>
              <option value="">هەڵبژێرە...</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.fullName}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClasses}>ناوی مامۆستا</label>
            <input required value={formData.teacherName} onChange={e => setFormData({...formData, teacherName: e.target.value})} className={inputClasses} placeholder="ناوی مامۆستای سەردانیکەر" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <label className={labelClasses}>شوێنی سەردان (حوجرە) <School size={14}/></label>
            <select 
              required={!isOtherLocation}
              value={isOtherLocation ? 'other' : formData.location} 
              onChange={e => {
                if (e.target.value === 'other') {
                  setIsOtherLocation(true);
                } else {
                  setIsOtherLocation(false);
                  setFormData({...formData, location: e.target.value});
                }
              }} 
              className={inputClasses}
            >
              <option value="">هەڵبژاردنی حوجرە...</option>
              {mosqueNames.map(name => <option key={name} value={name}>{name}</option>)}
              <option value="other">حوجرەیەکی نوێ (نوسین)</option>
            </select>
            {isOtherLocation && (
               <div className="mt-3 animate-in slide-in-from-top-2">
                 <input 
                   required 
                   className={inputClasses} 
                   value={manualLocation}
                   placeholder="ناوی حوجرە نوێیەکە" 
                   onChange={e => setManualLocation(e.target.value)} 
                 />
               </div>
            )}
          </div>
          <div>
            <label className={labelClasses}>کاتی سەردان <Calendar size={14}/></label>
            <input type="date" required value={formData.visitDate} onChange={e => setFormData({...formData, visitDate: e.target.value})} className={`${inputClasses} text-left font-mono`} />
          </div>
        </div>

        <div className="bg-emerald-50/50 p-6 rounded-[2rem] border-2 border-dashed border-emerald-100 space-y-4 shadow-inner">
           <button type="button" onClick={() => setAddProgress(!addProgress)} className={`w-full py-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 ${addProgress ? 'bg-emerald-700 text-white shadow-lg' : 'bg-white text-emerald-700 border border-emerald-200'}`}>
             {addProgress ? '✓ پاشەکەوتکردنی پێشکەوتن چالاکە' : '+ تۆمارکردنی پێشکەوتن لەم سەردانەدا'}
           </button>
           
           {addProgress && (
             <div className="space-y-6 pt-2 animate-in fade-in zoom-in-95">
                {studyUpdates.map((update, index) => (
                  <div key={update.id} className="p-5 bg-white rounded-3xl border border-emerald-100 shadow-sm space-y-4 relative">
                    {studyUpdates.length > 1 && (
                      <button type="button" onClick={() => removeStudyUpdateField(update.id)} className="absolute left-4 top-4 text-red-400 p-1 hover:bg-red-50 rounded-lg">
                        <Trash2 size={16} />
                      </button>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-emerald-800 mr-2">کتێب یان زانستی خوێندراو</label>
                        <select 
                          value={update.isNewBook ? 'new' : update.bookName}
                          onChange={e => {
                            if(e.target.value === 'new') {
                              updateStudyItem(update.id, { isNewBook: true, bookName: '' });
                            } else {
                              updateStudyItem(update.id, { isNewBook: false, bookName: e.target.value });
                            }
                          }}
                          className="w-full bg-emerald-50/30 border border-emerald-100 rounded-xl p-3 text-right text-sm font-bold text-black shadow-inner"
                        >
                          <option value="">هەڵبژاردنی کتێب...</option>
                          {selectedStudent?.currentBooks.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                          <option value="new" className="text-emerald-700 font-black">+ کتێبێکی نوێ</option>
                        </select>
                        {update.isNewBook && (
                          <input 
                            placeholder="ناوی کتێبە نوێیەکە" 
                            value={update.bookName} 
                            onChange={e => updateStudyItem(update.id, { bookName: e.target.value })} 
                            className="w-full bg-amber-50/30 border border-amber-100 rounded-xl p-3 text-right text-sm font-bold text-black mt-2 shadow-inner"
                          />
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-emerald-800 mr-2">لای کێ خوێندراوە؟</label>
                        <input 
                          value={update.teacherName} 
                          onChange={e => updateStudyItem(update.id, { teacherName: e.target.value })} 
                          className="w-full bg-emerald-50/30 border border-emerald-100 rounded-xl p-3 text-right text-sm font-bold text-black shadow-inner" 
                          placeholder="ناوی مامۆستای وانە"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-emerald-800 mr-2">لاپەڕە</label>
                          <input 
                            type="number" 
                            value={update.page} 
                            onChange={e => updateStudyItem(update.id, { page: e.target.value })} 
                            className="w-full bg-emerald-50/30 border border-emerald-100 rounded-xl p-3 text-right text-sm font-bold text-black shadow-inner" 
                            placeholder="١٤"
                          />
                       </div>
                       <div className="flex items-center justify-end gap-3 px-2 self-end pb-3">
                          <label className="text-xs font-black text-emerald-900 cursor-pointer select-none">تەواو بوو؟</label>
                          <input 
                            type="checkbox" 
                            checked={update.isBookCompleted} 
                            onChange={e => updateStudyItem(update.id, { isBookCompleted: e.target.checked })}
                            className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
                          />
                       </div>
                    </div>
                  </div>
                ))}
                
                <button type="button" onClick={addStudyUpdateField} className="w-full py-3 border-2 border-dashed border-emerald-200 rounded-2xl text-emerald-700 font-black text-xs flex items-center justify-center gap-2 hover:bg-emerald-50 transition-colors">
                  <Plus size={16} /> زیادکردنی کتێبێکی تر بۆ پێشکەوتن
                </button>

                <div className="grid grid-cols-2 gap-3 border-t border-emerald-100 pt-6">
                   <div className="space-y-1">
                      <label className="text-[9px] font-black text-amber-800 mr-2">سەرچاوەی هاوکاری</label>
                      <input value={financeUpdate.source} onChange={e => setFinanceUpdate({...financeUpdate, source: e.target.value})} className="bg-amber-50/30 border border-amber-100 rounded-xl p-3 text-right text-sm font-bold text-black w-full" placeholder="خێرخواز.." />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[9px] font-black text-amber-800 mr-2">بڕی پارە (دینار)</label>
                      <input type="number" value={financeUpdate.amount} onChange={e => setFinanceUpdate({...financeUpdate, amount: e.target.value})} className="bg-amber-50/30 border border-amber-100 rounded-xl p-3 text-right text-sm font-bold text-black w-full" placeholder="٥٠٠٠" />
                   </div>
                </div>
             </div>
           )}
        </div>

        <div>
          <label className={labelClasses}>تێبینی و ڕاسپاردەکان <FileText size={14}/></label>
          <textarea value={formData.studentNotes} onChange={e => setFormData({...formData, studentNotes: e.target.value})} className={inputClasses} rows={3} placeholder="هەر تێبینییەک لەسەر فەقێیەکە یان حوجرەکە هەبێت..." />
        </div>

        <div className="flex gap-4 pt-6">
          <button type="submit" className="flex-[2] bg-emerald-900 text-white h-16 rounded-2xl font-bold shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2">
            <Save size={20} /> پاشەکەوتکردنی سەردان
          </button>
          <button type="button" onClick={onCancel} className="flex-1 bg-gray-50 h-16 rounded-2xl font-bold text-gray-400 active:scale-90 transition-all">داخستن</button>
        </div>
      </form>
    </div>
  );
};

export default VisitForm;
