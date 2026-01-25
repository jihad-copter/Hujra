
import React from 'react';
import { Plus, Trash, Save, User, Wallet, BookOpen, School, Camera, X, Edit3, MapPin, Phone, ChevronLeft, ChevronRight } from 'lucide-react';
import { Student, BookProgress } from '../types';

interface StudentFormProps {
  initialData?: Student | null;
  onSave: (student: Student) => void;
  onCancel: () => void;
}

const StudentForm: React.FC<StudentFormProps> = ({ initialData, onSave, onCancel }) => {
  const [step, setStep] = React.useState(1);
  
  const defaultValues: Partial<Student> = {
    fullName: '', phone: '', address: '', guardianName: '', guardianPhone: '',
    educationLevel: '', previousFinancialAid: '', aidSource: '', aidDuration: '',
    familyFinancialStatus: '', incomeSource: '', familyStatus: '', healthStatus: '',
    chronicDiseases: '', previousMosque: '', previousTeacher: '',
    previousBooks: [], currentMosque: '', currentTeacher: '', currentBooks: [],
    photo: ''
  };

  const [formData, setFormData] = React.useState<Partial<Student>>(defaultValues);

  React.useEffect(() => {
    if (initialData) {
      setFormData({ ...defaultValues, ...initialData });
    }
  }, [initialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const addBook = (type: 'previous' | 'current') => {
    const key = type === 'previous' ? 'previousBooks' : 'currentBooks';
    const newBook: BookProgress = { 
      id: Math.random().toString(36).substr(2, 9), 
      name: '', 
      pageCount: '', 
      teacherName: '',
      isCompleted: type === 'previous' 
    };
    setFormData(prev => ({ 
      ...prev, 
      [key]: [...(prev[key] || []), newBook] 
    }));
  };

  const updateBook = (type: 'previous' | 'current', id: string, field: keyof BookProgress, value: any) => {
    const key = type === 'previous' ? 'previousBooks' : 'currentBooks';
    setFormData(prev => ({
      ...prev,
      [key]: (prev[key] || []).map(b => b.id === id ? { ...b, [field]: value } : b)
    }));
  };

  const removeBook = (type: 'previous' | 'current', id: string) => {
    const key = type === 'previous' ? 'previousBooks' : 'currentBooks';
    setFormData(prev => ({ 
      ...prev, 
      [key]: (prev[key] || []).filter(b => b.id !== id) 
    }));
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!formData.fullName || !formData.phone) {
        alert("تکایە ناوی تەواوی فەقێ و مۆبایلەکەی بنوسە");
        return;
      }
    }
    setStep(prev => prev + 1);
  };

  const handleFinalSave = () => {
    // دڵنیابوون لەوەی هەموو داتاکان بە وردی کۆکراونەتەوە
    const finalData: Student = {
      id: initialData?.id || Date.now().toString(),
      createdAt: initialData?.createdAt || new Date().toISOString(),
      fullName: formData.fullName || '',
      phone: formData.phone || '',
      address: formData.address || '',
      guardianName: formData.guardianName || '',
      guardianPhone: formData.guardianPhone || '',
      educationLevel: formData.educationLevel || '',
      previousFinancialAid: formData.previousFinancialAid || '',
      aidSource: formData.aidSource || '',
      aidDuration: formData.aidDuration || '',
      familyFinancialStatus: formData.familyFinancialStatus || '',
      incomeSource: formData.incomeSource || '',
      familyStatus: formData.familyStatus || '',
      healthStatus: formData.healthStatus || '',
      chronicDiseases: formData.chronicDiseases || '',
      previousMosque: formData.previousMosque || '',
      previousTeacher: formData.previousTeacher || '',
      previousBooks: formData.previousBooks || [],
      currentMosque: formData.currentMosque || '',
      currentTeacher: formData.currentTeacher || '',
      currentBooks: formData.currentBooks || [],
      photo: formData.photo || ''
    };
    
    onSave(finalData);
  };

  const steps = [
    { title: 'کەسی', icon: User },
    { title: 'دارایی', icon: Wallet },
    { title: 'ڕابردوو', icon: BookOpen },
    { title: 'ئێستا', icon: School },
  ];

  const inputClasses = "w-full bg-white border-2 border-gray-100 rounded-2xl p-4 focus:border-emerald-500 focus:ring-0 outline-none transition-all text-base text-right text-gray-950 font-bold placeholder:text-gray-300";
  const labelClasses = "block text-xs font-black text-emerald-800 mb-2 mr-2 text-right uppercase tracking-wider";

  return (
    <div className="pb-10">
      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header with Progress Steps */}
        <div className="bg-emerald-900 kurdish-pattern p-6 pt-8 text-white">
          <h2 className="text-xl font-bold text-center mb-6">
            {initialData ? 'دەستکاریکردنی زانیارییەکان' : 'تۆمارکردنی فەقێی نوێ'}
          </h2>
          <div className="flex justify-between items-center max-w-xs mx-auto relative">
             <div className="absolute top-5 left-0 right-0 h-0.5 bg-emerald-800 -z-0"></div>
            {steps.map((s, i) => (
              <div key={i} className="flex flex-col items-center relative z-10">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${step >= i + 1 ? 'bg-amber-500 text-emerald-950 scale-110 shadow-lg' : 'bg-emerald-800 text-emerald-200'}`}>
                  <s.icon size={18} />
                </div>
                <span className={`text-[10px] mt-2 font-bold ${step >= i + 1 ? 'text-white' : 'text-emerald-400 opacity-50'}`}>{s.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Form Content - Using div instead of form to prevent auto-submission */}
        <div className="p-6 space-y-6">
          {/* Step 1: Personal Info */}
          {step === 1 && (
            <div className="space-y-4 animate-in slide-in-from-left-4 duration-300 text-right">
              <div className="flex flex-col items-center mb-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center">
                    {formData.photo ? (
                      <img src={formData.photo} alt="Student" className="w-full h-full object-cover" />
                    ) : (
                      <Camera size={32} className="text-gray-200" />
                    )}
                  </div>
                  <label className="absolute -bottom-2 -right-2 bg-amber-500 text-emerald-950 p-2 rounded-xl shadow-lg cursor-pointer active:scale-90 transition-transform">
                    <Plus size={16} />
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                  </label>
                  {formData.photo && (
                    <button type="button" onClick={() => setFormData(p => ({ ...p, photo: '' }))} className="absolute -top-2 -left-2 bg-red-500 text-white p-1 rounded-full shadow-md">
                      <X size={12} />
                    </button>
                  )}
                </div>
                <span className="text-[10px] text-gray-400 mt-2 font-bold">وێنەی فەقێ</span>
              </div>

              <div>
                <label className={labelClasses}>ناوی سیانی فەقێ</label>
                <input required name="fullName" value={formData.fullName} onChange={handleInputChange} className={inputClasses} placeholder="ناوی تەواوی فەقێ..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClasses}>مۆبایلی فەقێ</label>
                  <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className={inputClasses} placeholder="07XX..." />
                </div>
                <div>
                  <label className={labelClasses}>ناونیشانی نیشتەجێبوون</label>
                  <input name="address" value={formData.address} onChange={handleInputChange} className={inputClasses} placeholder="شار/گەڕەک..." />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClasses}>ناوی سەرپەرشتیار</label>
                  <input name="guardianName" value={formData.guardianName} onChange={handleInputChange} className={inputClasses} placeholder="ناوی باوک یان نزیکێک" />
                </div>
                <div>
                  <label className={labelClasses}>مۆبایلی سەرپەرشتیار</label>
                  <input name="guardianPhone" value={formData.guardianPhone} onChange={handleInputChange} className={inputClasses} placeholder="بۆ پەیوەندی خێزان" />
                </div>
              </div>

              <div>
                <label className={labelClasses}>ئاستی خوێندنی ئایینی</label>
                <select name="educationLevel" value={formData.educationLevel} onChange={handleInputChange} className={inputClasses}>
                  <option value="">هەڵبژێرە...</option>
                  <option value="سەرەتایی">سەرەتایی</option>
                  <option value="ناوەند">ناوەند</option>
                  <option value="پێشکەوتوو">پێشکەوتوو</option>
                  <option value="موجاز">موجاز</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Financial Info */}
          {step === 2 && (
            <div className="space-y-4 animate-in slide-in-from-left-4 duration-300 text-right">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClasses}>باری دارایی خێزان</label>
                  <select name="familyFinancialStatus" value={formData.familyFinancialStatus} onChange={handleInputChange} className={inputClasses}>
                    <option value="">هەڵبژێرە...</option>
                    <option value="باش">باش</option>
                    <option value="مامناوەند">مامناوەند</option>
                    <option value="هەژار">هەژار</option>
                    <option value="زۆر هەژار">زۆر هەژار</option>
                  </select>
                </div>
                <div>
                  <label className={labelClasses}>سەرچاوەی داهاتی خێزان</label>
                  <input name="incomeSource" value={formData.incomeSource} onChange={handleInputChange} className={inputClasses} placeholder="وەک: مووچە، کاسبی..." />
                </div>
              </div>

              <div className="bg-amber-50 p-5 rounded-[2rem] border border-amber-100">
                <h4 className="text-xs font-black text-amber-800 mb-4 mr-2">زانیاری دارایی و هاوکاری پێشوو</h4>
                <div className="grid grid-cols-2 gap-4">
                   <input name="previousFinancialAid" placeholder="بڕی هاوکاری پێشوو" value={formData.previousFinancialAid} onChange={handleInputChange} className={inputClasses} />
                   <input name="aidSource" placeholder="سەرچاوەی هاوکارییەکە" value={formData.aidSource} onChange={handleInputChange} className={inputClasses} />
                </div>
              </div>

              <div>
                <label className={labelClasses}>باری تەندروستی و نەخۆشی درێژخایەن</label>
                <textarea name="healthStatus" value={formData.healthStatus} onChange={handleInputChange} className={`${inputClasses} h-24`} placeholder="ئەگەر تێبینییەکی تەندروستی یان نەخۆشییەکی هەیە لێرە بینوسە..." />
              </div>
            </div>
          )}

          {/* Step 3: Past Study */}
          {step === 3 && (
            <div className="space-y-6 animate-in slide-in-from-left-4 duration-300 text-right">
              <div className="bg-gray-50 p-5 rounded-[2rem] border border-gray-100 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClasses}>مزگەوتی پێشوو</label>
                    <input name="previousMosque" value={formData.previousMosque} onChange={handleInputChange} className={inputClasses} placeholder="لە کوێ دەیخوێند؟" />
                  </div>
                  <div>
                    <label className={labelClasses}>مامۆستای پێشوو</label>
                    <input name="previousTeacher" value={formData.previousTeacher} onChange={handleInputChange} className={inputClasses} placeholder="لای کێ دەیخوێند؟" />
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <h4 className="text-sm font-black text-gray-700">کتێبە تەواوکراوەکان لە ڕابردوو</h4>
                  <button type="button" onClick={() => addBook('previous')} className="text-emerald-700 bg-emerald-50 px-4 py-2 rounded-xl text-xs font-black active:scale-95 shadow-sm">+ زیادکردنی کتێب</button>
                </div>
                <div className="max-h-[300px] overflow-y-auto space-y-3 pr-1">
                  {(formData.previousBooks || []).length > 0 ? (formData.previousBooks || []).map((book) => (
                    <div key={book.id} className="bg-white p-4 rounded-3xl border-2 border-gray-100 shadow-sm space-y-3 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-1 h-full bg-gray-300"></div>
                      <div className="flex gap-2">
                        <input placeholder="ناوی کتێب" className="flex-1 bg-gray-50 rounded-xl p-3 outline-none text-sm font-bold border-none text-right text-gray-950" value={book.name} onChange={(e) => updateBook('previous', book.id, 'name', e.target.value)} />
                        <button type="button" onClick={() => removeBook('previous', book.id)} className="text-red-400 p-2 hover:bg-red-50 rounded-lg"><Trash size={18} /></button>
                      </div>
                      <div className="flex gap-2">
                        <input placeholder="ناوی مامۆستا" className="flex-[2] bg-gray-50 rounded-xl p-2 outline-none text-xs font-bold border-none text-right text-gray-950" value={book.teacherName} onChange={(e) => updateBook('previous', book.id, 'teacherName', e.target.value)} />
                        <input placeholder="لاپەڕە" className="flex-1 bg-gray-50 rounded-xl p-2 outline-none text-xs font-bold border-none text-center text-gray-950" value={book.pageCount} onChange={(e) => updateBook('previous', book.id, 'pageCount', e.target.value)} />
                      </div>
                    </div>
                  )) : (
                    <p className="text-center py-6 text-gray-300 text-xs font-bold italic">هیچ کتێبێک نییە</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Current Study */}
          {step === 4 && (
            <div className="space-y-6 animate-in slide-in-from-left-4 duration-300 text-right">
              <div className="bg-emerald-50 p-6 rounded-[2.5rem] border-2 border-emerald-100 space-y-4 shadow-sm">
                <h3 className="font-black text-emerald-800 text-sm flex items-center gap-2 justify-end">خوێندنی ئێستا لەم حوجرەیە <School size={16}/></h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClasses}>مزگەوتی ئێستا</label>
                    <input name="currentMosque" value={formData.currentMosque || ''} onChange={handleInputChange} className={inputClasses} placeholder="ناوی مزگەوتی ئێستا..." />
                  </div>
                  <div>
                    <label className={labelClasses}>مامۆستای ئێستا</label>
                    <input name="currentTeacher" value={formData.currentTeacher || ''} onChange={handleInputChange} className={inputClasses} placeholder="ناوی مامۆستای ئێستا..." />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <h4 className="text-sm font-black text-emerald-950">کتێبەکان و دەرسەکانی ئێستا</h4>
                  <button type="button" onClick={() => addBook('current')} className="text-emerald-700 bg-emerald-100/50 px-4 py-2 rounded-xl text-xs font-black active:scale-95 shadow-sm border border-emerald-100">+ زیادکردنی کتێب</button>
                </div>
                
                <div className="max-h-[350px] overflow-y-auto space-y-3 pr-1">
                  {(formData.currentBooks || []).length > 0 ? (formData.currentBooks || []).map((book) => (
                    <div key={book.id} className="bg-white p-5 rounded-[2rem] border-2 border-emerald-100 shadow-sm space-y-4 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-2 h-full bg-emerald-500"></div>
                      <div className="flex gap-2">
                        <input placeholder="ناوی کتێب" className="flex-1 bg-gray-50 rounded-xl p-3 outline-none text-sm font-black border-none text-right text-emerald-950" value={book.name} onChange={(e) => updateBook('current', book.id, 'name', e.target.value)} />
                        <button type="button" onClick={() => removeBook('current', book.id)} className="text-red-400 p-2 hover:bg-red-50 rounded-lg transition-colors"><Trash size={20} /></button>
                      </div>
                      <div className="flex gap-3">
                        <div className="flex-[2]">
                           <span className="text-[9px] font-black text-gray-400 mr-2 uppercase">مامۆستا</span>
                           <input placeholder="ناوی مامۆستا" className="w-full bg-gray-50 rounded-xl p-3 outline-none text-xs font-bold border-none text-right text-gray-950" value={book.teacherName} onChange={(e) => updateBook('current', book.id, 'teacherName', e.target.value)} />
                        </div>
                        <div className="flex-1">
                           <span className="text-[9px] font-black text-gray-400 mr-2 uppercase">لاپەڕە</span>
                           <input placeholder="ل:" className="w-full bg-gray-50 rounded-xl p-3 outline-none text-xs font-bold border-none text-center text-gray-950" value={book.pageCount} onChange={(e) => updateBook('current', book.id, 'pageCount', e.target.value)} />
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="py-12 text-center border-2 border-dashed border-gray-100 rounded-[2.5rem] text-gray-300">
                      <BookOpen size={48} className="mx-auto opacity-10 mb-3" />
                      <p className="text-xs font-bold">بۆ دەستپێکردن، کتێبێک زیاد بکە</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Fixed Action Buttons - Manual Navigation */}
          <div className="flex gap-3 pt-6 border-t border-gray-100">
            {step > 1 ? (
              <button 
                type="button" 
                onClick={() => setStep(step - 1)} 
                className="flex-1 h-14 bg-gray-100 rounded-2xl font-bold text-gray-600 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <ChevronRight size={20} /> گەڕانەوە
              </button>
            ) : (
              <button 
                type="button" 
                onClick={onCancel} 
                className="flex-1 h-14 bg-gray-50 rounded-2xl font-bold text-gray-400 active:scale-95 transition-all flex items-center justify-center"
              >
                داخستن
              </button>
            )}

            {step < 4 ? (
              <button 
                type="button" 
                onClick={handleNextStep} 
                className="flex-[2] h-14 bg-emerald-900 text-white rounded-2xl font-bold shadow-lg shadow-emerald-900/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                هەنگاوی دواتر <ChevronLeft size={20} />
              </button>
            ) : (
              <button 
                type="button"
                onClick={handleFinalSave}
                className="flex-[2] h-14 bg-amber-500 text-emerald-950 rounded-2xl font-black shadow-xl shadow-amber-500/30 flex items-center justify-center active:scale-95 transition-all"
              >
                <Save className="w-5 h-5 ml-2" /> {initialData ? 'نوێکردنەوە' : 'تەواوکردنی تۆمارکردن'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentForm;
