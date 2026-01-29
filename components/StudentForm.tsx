import React from 'react';
import { Plus, Trash, Save, User, Wallet, BookOpen, School, Camera, X, Edit3, Calendar, DollarSign, ChevronLeft, ChevronRight, Activity, HeartPulse, ShieldAlert } from 'lucide-react';
import { Student, BookProgress, StudyLog, FinancialLog } from '../types';
import { fromKu } from '../App';

interface StudentFormProps {
  initialData?: Student | null;
  onSave: (student: Student) => void;
  onCancel: () => void;
}

const StudentForm: React.FC<StudentFormProps> = ({ initialData, onSave, onCancel }) => {
  const [step, setStep] = React.useState(1);
  const [hasChronicDisease, setHasChronicDisease] = React.useState(false);
  const [isSick, setIsSick] = React.useState(false);
  
  const defaultValues: Partial<Student> = {
    fullName: '', phone: '', address: '', guardianName: '', guardianPhone: '',
    educationLevel: 'سەرەتایی', familyFinancialStatus: 'باش', incomeSource: '', familyStatus: 'ئاسایی', healthStatus: 'تەندروستە',
    chronicDiseases: 'نییە', previousMosque: '', previousTeacher: '',
    previousBooks: [], currentMosque: '', currentTeacher: '', currentBooks: [],
    studyHistory: [], financialHistory: [], photo: ''
  };

  const [formData, setFormData] = React.useState<Partial<Student>>(defaultValues);

  React.useEffect(() => {
    if (initialData) {
      setFormData({ ...defaultValues, ...initialData });
      setHasChronicDisease(initialData.chronicDiseases !== 'نییە');
      setIsSick(initialData.healthStatus !== 'تەندروستە');
    }
  }, [initialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // If it's phone, guardianPhone, sanitize using fromKu
    if (name === 'phone' || name === 'guardianPhone') {
        setFormData(prev => ({ ...prev, [name]: fromKu(value) }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, photo: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const addBook = (type: 'current' | 'previous') => {
    const newBook: BookProgress = { id: Date.now().toString(), name: '', pageCount: '', teacherName: '', isCompleted: type === 'previous' };
    const listKey = type === 'current' ? 'currentBooks' : 'previousBooks';
    setFormData(prev => ({ ...prev, [listKey]: [...(prev[listKey] || []), newBook] }));
  };

  const removeBook = (type: 'current' | 'previous', id: string) => {
    const listKey = type === 'current' ? 'currentBooks' : 'previousBooks';
    setFormData(prev => ({ ...prev, [listKey]: (prev[listKey] as BookProgress[]).filter(b => b.id !== id) }));
  };

  const updateBook = (type: 'current' | 'previous', id: string, field: keyof BookProgress, value: string) => {
    const listKey = type === 'current' ? 'currentBooks' : 'previousBooks';
    setFormData(prev => ({
      ...prev,
      [listKey]: (prev[listKey] as BookProgress[]).map(b => b.id === id ? { ...b, [field]: field === 'pageCount' ? fromKu(value) : value } : b)
    }));
  };

  const handleFinalSave = () => {
    const finalData = { ...formData };
    if (!hasChronicDisease) finalData.chronicDiseases = 'نییە';
    if (!isSick) finalData.healthStatus = 'تەندروستە';
    
    onSave({ 
      ...defaultValues, 
      ...finalData, 
      id: initialData?.id || Date.now().toString(), 
      createdAt: initialData?.createdAt || new Date().toISOString() 
    } as Student);
  };

  const inputClasses = "w-full bg-white border-2 border-gray-100 rounded-2xl p-4 focus:border-emerald-500 outline-none text-right font-bold text-black shadow-sm transition-all";
  const labelClasses = "block text-xs font-black text-emerald-800 mb-2 mr-2 text-right uppercase";

  return (
    <div className="pb-10">
      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden">
        <div className="bg-emerald-900 kurdish-pattern p-6 pt-8 text-white">
          <h2 className="text-xl font-bold text-center mb-6">تۆمارکردنی زانیاری فەقێ</h2>
          <div className="flex justify-between items-center max-w-sm mx-auto">
             {[1, 2, 3, 4, 5].map(num => (
               <div key={num} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${step === num ? 'bg-amber-500 text-emerald-950 scale-110' : 'bg-emerald-800 text-emerald-300 opacity-50'}`} onClick={() => setStep(num)}>
                 {num === 1 && <User size={18} />}
                 {num === 2 && <ShieldAlert size={18} />}
                 {num === 3 && <Activity size={18} />}
                 {num === 4 && <BookOpen size={18} />}
                 {num === 5 && <DollarSign size={18} />}
               </div>
             ))}
          </div>
        </div>

        <div className="p-6 space-y-6">
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-300 text-right">
              <div className="flex flex-col items-center mb-6">
                <div className="relative">
                  <div className="w-28 h-28 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center shadow-inner">
                    {formData.photo ? <img src={formData.photo} className="w-full h-full object-cover" /> : <Camera size={32} className="text-gray-200" />}
                  </div>
                  <label className="absolute -bottom-2 -right-2 bg-amber-500 text-emerald-950 p-2.5 rounded-xl cursor-pointer shadow-lg active:scale-90 transition-transform"><Plus size={18} /><input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} /></label>
                </div>
              </div>
              <div><label className={labelClasses}>ناوی سیانی</label><input name="fullName" value={formData.fullName} onChange={handleInputChange} className={inputClasses} placeholder="ناوی فەقێ بنووسە" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={labelClasses}>مۆبایلی فەقێ</label><input name="phone" value={formData.phone} onChange={handleInputChange} className={`${inputClasses} text-left`} placeholder="07XX" /></div>
                <div><label className={labelClasses}>ناوی حوجرە</label><input name="currentMosque" value={formData.currentMosque} onChange={handleInputChange} className={inputClasses} placeholder="ناوی مزگەوت" /></div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-300 text-right">
               <h3 className="font-black text-emerald-900 border-b pb-2 mb-4">سەرپەرشتیار و باری خێزان</h3>
               <div className="grid grid-cols-2 gap-3">
                  <div><label className={labelClasses}>ناوی سەرپەرشتیار</label><input name="guardianName" value={formData.guardianName} onChange={handleInputChange} className={inputClasses} placeholder="باوک یان کەسی نزیک" /></div>
                  <div><label className={labelClasses}>مۆبایلی سەرپەرشتیار</label><input name="guardianPhone" value={formData.guardianPhone} onChange={handleInputChange} className={`${inputClasses} text-left`} placeholder="07XX" /></div>
               </div>
               <div><label className={labelClasses}>باری خێزانی</label><input name="familyStatus" value={formData.familyStatus} onChange={handleInputChange} className={inputClasses} placeholder="ئاسایی، یەتیم، جیاواز.." /></div>
               
               <div className="bg-gray-50 p-5 rounded-[2rem] border border-gray-100 shadow-sm">
                 <label className="block text-sm font-black text-emerald-900 mb-3">ئایا لە ماڵەوەیان نەخۆشی درێژخایەن هەیە؟</label>
                 <div className="flex gap-2">
                    <button onClick={() => setHasChronicDisease(true)} className={`flex-1 py-3 rounded-xl font-black text-sm transition-all ${hasChronicDisease ? 'bg-emerald-800 text-white shadow-md' : 'bg-white text-gray-400 border border-gray-100'}`}>هەیە</button>
                    <button onClick={() => setHasChronicDisease(false)} className={`flex-1 py-3 rounded-xl font-black text-sm transition-all ${!hasChronicDisease ? 'bg-emerald-800 text-white shadow-md' : 'bg-white text-gray-400 border border-gray-100'}`}>نییە</button>
                 </div>
                 {hasChronicDisease && (
                    <div className="mt-4 animate-in slide-in-from-top-2">
                      <label className={labelClasses}>تێبینی دەربارەی نەخۆشییەکە</label>
                      <textarea name="chronicDiseases" value={formData.chronicDiseases === 'نییە' ? '' : formData.chronicDiseases} onChange={handleInputChange} className={inputClasses} placeholder="کێ هەیەتی و جۆرەکەی چییە؟" rows={2} />
                    </div>
                 )}
               </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5 animate-in fade-in duration-300 text-right">
               <h3 className="font-black text-emerald-900 border-b pb-2 mb-4">ئاستی زانستی و تەندروستی فەقێ</h3>
               <div>
                  <label className={labelClasses}>ئاستی زانستی (Education Level)</label>
                  <select name="educationLevel" value={formData.educationLevel} onChange={handleInputChange} className={inputClasses}>
                     <option value="سەرەتایی">سەرەتایی</option>
                     <option value="ناوەندی">ناوەندی</option>
                     <option value="ئامادەیی">ئامادەیی</option>
                     <option value="پێشکەوتوو">پێشکەوتوو</option>
                  </select>
               </div>
               <div>
                  <label className={labelClasses}>باری دارایی خێزان</label>
                  <select name="familyFinancialStatus" value={formData.familyFinancialStatus} onChange={handleInputChange} className={inputClasses}>
                     <option value="باش">باش</option>
                     <option value="مامناوەند">مامناوەند</option>
                     <option value="هەژار">هەژار</option>
                     <option value="خراپ">خراپ (پێویستی بە هاوکارییە)</option>
                  </select>
               </div>
               
               <div className="bg-red-50 p-5 rounded-[2rem] border border-red-100 shadow-sm">
                  <label className="block text-sm font-black text-red-900 mb-3">باری تەندروستی فەقێ چۆنە؟</label>
                  <div className="flex gap-2">
                    <button onClick={() => setIsSick(true)} className={`flex-1 py-3 rounded-xl font-black text-sm transition-all ${isSick ? 'bg-red-700 text-white shadow-md' : 'bg-white text-gray-300 border border-red-100'}`}>نەخۆشە</button>
                    <button onClick={() => setIsSick(false)} className={`flex-1 py-3 rounded-xl font-black text-sm transition-all ${!isSick ? 'bg-emerald-800 text-white shadow-md' : 'bg-white text-gray-300 border border-red-100'}`}>تەندروستە</button>
                  </div>
                  {isSick && (
                    <div className="mt-4 animate-in slide-in-from-top-2">
                       <label className={labelClasses}>جۆری نەخۆشی فەقێ</label>
                       <textarea name="healthStatus" value={formData.healthStatus === 'تەندروستە' ? '' : formData.healthStatus} onChange={handleInputChange} className={inputClasses} placeholder="نەخۆشییەکە لێرە بنووسە" rows={2} />
                    </div>
                  )}
               </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-in fade-in duration-300 text-right">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-black text-emerald-900 text-sm">کتێبە تەواوبووەکان</h3>
                  <button onClick={() => addBook('previous')} className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg text-xs font-black shadow-sm">+ کتێب</button>
                </div>
                <div className="space-y-3">
                  {formData.previousBooks?.map(book => (
                    <div key={book.id} className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 space-y-3 shadow-sm">
                      <div className="flex gap-2">
                        <input placeholder="ناوی کتێب" value={book.name} onChange={e => updateBook('previous', book.id, 'name', e.target.value)} className="flex-1 bg-white rounded-xl p-3 text-sm font-bold text-black text-right border-none shadow-inner" />
                        <button onClick={() => removeBook('previous', book.id)} className="text-red-400 bg-white p-3 rounded-xl shadow-sm"><Trash size={16}/></button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input placeholder="مامۆستا" value={book.teacherName} onChange={e => updateBook('previous', book.id, 'teacherName', e.target.value)} className="w-full bg-white rounded-xl p-3 text-xs font-bold text-black text-right border-none shadow-inner" />
                        <input placeholder="لاپەڕەکان" value={book.pageCount} onChange={e => updateBook('previous', book.id, 'pageCount', e.target.value)} className="w-full bg-white rounded-xl p-3 text-xs font-bold text-black text-right border-none shadow-inner" />
                      </div>
                    </div>
                  ))}
                  {formData.previousBooks?.length === 0 && <p className="text-center text-gray-400 text-[10px] font-bold py-4 italic">هیچ کتێبێک تۆمار نەکراوە</p>}
                </div>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-black text-blue-900 text-sm">ئەو کتێبانەی ئێستا دەیانخوێنێت</h3>
                  <button onClick={() => addBook('current')} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-xs font-black shadow-sm">+ کتێب</button>
                </div>
                <div className="space-y-3">
                  {formData.currentBooks?.map(book => (
                    <div key={book.id} className="bg-blue-50 p-4 rounded-2xl border border-blue-100 space-y-3 shadow-sm">
                      <div className="flex gap-2">
                        <input placeholder="ناوی کتێب" value={book.name} onChange={e => updateBook('current', book.id, 'name', e.target.value)} className="flex-1 bg-white rounded-xl p-3 text-sm font-bold text-black text-right border-none shadow-inner" />
                        <button onClick={() => removeBook('current', book.id)} className="text-red-400 bg-white p-3 rounded-xl shadow-sm"><Trash size={16}/></button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input placeholder="لای کێ دەخوێنێت؟" value={book.teacherName} onChange={e => updateBook('current', book.id, 'teacherName', e.target.value)} className="w-full bg-white rounded-xl p-3 text-xs font-bold text-black text-right border-none shadow-inner" />
                        <input placeholder="لاپەڕە چەندی؟" value={book.pageCount} onChange={e => updateBook('current', book.id, 'pageCount', e.target.value)} className="w-full bg-white rounded-xl p-3 text-xs font-bold text-black text-right border-none shadow-inner" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6 animate-in fade-in duration-300 text-right">
               <h3 className="font-black text-amber-900">هاوکارییە داراییەکان</h3>
               <button onClick={() => setFormData(prev => ({...prev, financialHistory: [{id: Date.now().toString(), date: new Date().toISOString().split('T')[0], amount: '', source: ''}, ...(prev.financialHistory || [])]}))} className="w-full bg-amber-100 text-amber-700 py-4 rounded-2xl font-black text-sm shadow-sm active:scale-95 transition-all">+ تۆماری هاوکاری نوێ</button>
               <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                  {formData.financialHistory?.map(log => (
                    <div key={log.id} className="bg-amber-50 p-4 rounded-3xl border border-amber-100 grid grid-cols-2 gap-3 shadow-sm animate-in zoom-in-95">
                       <input value={log.amount} onChange={e => setFormData(prev => ({...prev, financialHistory: prev.financialHistory?.map(l => l.id === log.id ? {...l, amount: fromKu(e.target.value)} : l)}))} className="bg-white p-3 rounded-xl text-sm font-bold text-black text-right border-none" placeholder="بڕی پارە" />
                       <input value={log.source} onChange={e => setFormData(prev => ({...prev, financialHistory: prev.financialHistory?.map(l => l.id === log.id ? {...l, source: e.target.value} : l)}))} className="bg-white p-3 rounded-xl text-sm font-bold text-black text-right border-none" placeholder="سەرچاوە" />
                       <button onClick={() => setFormData(prev => ({...prev, financialHistory: prev.financialHistory?.filter(l => l.id !== log.id)}))} className="col-span-2 text-red-400 text-[10px] font-bold text-center mt-1">سڕینەوەی ئەم تۆمارە</button>
                    </div>
                  ))}
               </div>
            </div>
          )}

          <div className="flex gap-3 pt-6 border-t border-gray-100">
            {step > 1 && <button onClick={() => setStep(step - 1)} className="flex-1 h-16 bg-gray-100 rounded-2xl font-bold text-gray-600 flex items-center justify-center active:scale-90 transition-all"><ChevronRight size={24} /></button>}
            {step < 5 ? (
              <button onClick={() => setStep(step + 1)} className="flex-[2] h-16 bg-emerald-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg">هەنگاوی دواتر <ChevronLeft size={24} /></button>
            ) : (
              <button onClick={handleFinalSave} className="flex-[2] h-16 bg-amber-500 text-emerald-950 rounded-2xl font-black shadow-xl flex items-center justify-center active:scale-95 transition-all"><Save className="ml-2" size={20} /> پاشەکەوتکردن</button>
            )}
            {step === 1 && <button onClick={onCancel} className="flex-1 h-16 bg-gray-50 rounded-2xl font-bold text-gray-400 active:scale-90 transition-all">داخستن</button>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentForm;