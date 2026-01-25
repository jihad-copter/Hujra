
import React from 'react';
import { TeacherVisit, Student } from '../types';
import { Save, X, MapPin, User, FileText, Lightbulb } from 'lucide-react';

interface VisitFormProps {
  students: Student[];
  initialData?: TeacherVisit | null;
  onSave: (visit: TeacherVisit) => void;
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

  React.useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ 
      ...formData, 
      id: initialData?.id || Date.now().toString() 
    } as TeacherVisit);
  };

  const inputClasses = "w-full border-2 border-gray-100 bg-white p-4 rounded-2xl outline-none focus:border-emerald-500 text-right text-gray-950 font-bold shadow-sm transition-all";
  const labelClasses = "flex items-center justify-end gap-2 text-xs font-black text-emerald-800 mb-2 mr-1 uppercase";

  return (
    <div className="bg-white p-6 rounded-[2.5rem] shadow-2xl border border-gray-100 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
      <h2 className="text-xl font-black text-emerald-900 mb-8 text-center">
        {initialData ? 'دەستکاریکردنی سەردان' : 'تۆمارکردنی سەردانی نوێ'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClasses}>هەڵبژاردنی فەقێ <User size={14}/></label>
            <select 
              required 
              value={formData.studentId} 
              onChange={e => setFormData({...formData, studentId: e.target.value})} 
              className={inputClasses}
            >
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
          <div>
            <label className={labelClasses}>شوێنی سەردان (حوجرە) <MapPin size={14}/></label>
            <input required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className={inputClasses} placeholder="ناوی حوجرە یان مزگەوت" />
          </div>
          <div>
            <label className={labelClasses}>کاتی سەردان</label>
            <input type="date" required value={formData.visitDate} onChange={e => setFormData({...formData, visitDate: e.target.value})} className={`${inputClasses} text-left`} />
          </div>
        </div>

        <div>
          <label className={labelClasses}>تێبینی لەسەر خوێندکار (فەقێ) <FileText size={14}/></label>
          <textarea value={formData.studentNotes} onChange={e => setFormData({...formData, studentNotes: e.target.value})} className={inputClasses} rows={2} placeholder="بارودۆخی خوێندکار..." />
        </div>

        <div>
          <label className={labelClasses}>تێبینی لەسەر حوجرە <MapPin size={14}/></label>
          <textarea value={formData.hujraNotes} onChange={e => setFormData({...formData, hujraNotes: e.target.value})} className={inputClasses} rows={2} placeholder="بارودۆخی حوجرەکە..." />
        </div>

        <div>
          <label className={labelClasses}>پێشنیار و ڕاسپاردەکان <Lightbulb size={14}/></label>
          <textarea value={formData.suggestions} onChange={e => setFormData({...formData, suggestions: e.target.value})} className={inputClasses} rows={2} placeholder="چی بکرێت باشترە؟" />
        </div>

        <div className="flex gap-4 pt-6">
          <button type="submit" className="flex-[2] bg-emerald-900 text-white h-14 rounded-2xl font-bold shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2">
            <Save size={20} /> پاشەکەوتکردن
          </button>
          <button type="button" onClick={onCancel} className="flex-1 bg-gray-100 h-14 rounded-2xl font-bold text-gray-500 active:scale-95 transition-all flex items-center justify-center gap-2">
            <X size={20} /> هەڵوەشاندنەوە
          </button>
        </div>
      </form>
    </div>
  );
};

export default VisitForm;
