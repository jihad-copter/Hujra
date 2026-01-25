
import React from 'react';
import { Student, TeacherVisit } from '../types';
import { FileText, TrendingUp, Heart, Wallet, BookOpen, AlertCircle } from 'lucide-react';

interface ReportsProps {
  students: Student[];
  visits: TeacherVisit[];
}

const Reports: React.FC<ReportsProps> = ({ students, visits }) => {
  // Stats Calculation
  const totalStudents = students.length;
  const advancedStudents = students.filter(s => s.educationLevel === 'پێشکەوتوو').length;
  const healthAlerts = students.filter(s => s.healthStatus && s.healthStatus.length > 5).length;
  const financialNeeds = students.filter(s => s.familyFinancialStatus && (s.familyFinancialStatus.includes('خراپ') || s.familyFinancialStatus.includes('هەژار'))).length;
  
  const completedBooks = students.reduce((acc, s) => acc + (s.previousBooks?.length || 0), 0);
  const currentBooks = students.reduce((acc, s) => acc + (s.currentBooks?.length || 0), 0);

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center gap-3 px-1">
        <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
          <FileText size={24} />
        </div>
        <h2 className="text-2xl font-bold text-emerald-900">ڕاپۆرتە گشتییەکان</h2>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
          <TrendingUp className="text-emerald-600 mb-2" size={20} />
          <p className="text-2xl font-black text-emerald-900">{totalStudents}</p>
          <p className="text-[10px] font-bold text-gray-500">کۆی فەقێیان</p>
        </div>
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
          <BookOpen className="text-blue-600 mb-2" size={20} />
          <p className="text-2xl font-black text-blue-900">{completedBooks}</p>
          <p className="text-[10px] font-bold text-gray-500">کتێبە تەواوکراوەکان</p>
        </div>
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
          <Heart className="text-red-600 mb-2" size={20} />
          <p className="text-2xl font-black text-red-900">{healthAlerts}</p>
          <p className="text-[10px] font-bold text-gray-500">ئاگاداری تەندروستی</p>
        </div>
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
          <Wallet className="text-amber-600 mb-2" size={20} />
          <p className="text-2xl font-black text-amber-900">{financialNeeds}</p>
          <p className="text-[10px] font-bold text-gray-500">پێویستی دارایی</p>
        </div>
      </div>

      {/* Detailed Reports */}
      <div className="space-y-4">
        {/* Health Report Section */}
        <section className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-50">
          <h3 className="font-bold text-lg mb-4 flex items-center text-red-700">
            <AlertCircle className="ml-2" size={18} /> ڕاپۆرتی تەندروستی (ئەوانەی نەخۆشییان هەیە)
          </h3>
          <div className="space-y-3">
            {students.filter(s => s.healthStatus && s.healthStatus.length > 5).map(s => (
              <div key={s.id} className="p-3 bg-red-50 rounded-2xl flex justify-between items-center border border-red-100">
                <div>
                  <p className="font-bold text-sm text-red-900">{s.fullName}</p>
                  <p className="text-xs text-red-700">{s.healthStatus}</p>
                </div>
                <div className="text-xs bg-white px-2 py-1 rounded-lg font-bold text-red-600 shadow-sm">{s.phone}</div>
              </div>
            ))}
            {healthAlerts === 0 && <p className="text-sm text-gray-400 italic text-center py-4">هیچ بارێکی تەندروستی تایبەت تۆمار نەکراوە</p>}
          </div>
        </section>

        {/* Financial Report Section */}
        <section className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-50">
          <h3 className="font-bold text-lg mb-4 flex items-center text-emerald-800">
            <Wallet className="ml-2" size={18} /> ڕاپۆرتی دارایی (پێویستیان بە هاوکارییە)
          </h3>
          <div className="space-y-3">
            {students.filter(s => s.familyFinancialStatus && (s.familyFinancialStatus.includes('خراپ') || s.familyFinancialStatus.includes('هەژار'))).map(s => (
              <div key={s.id} className="p-3 bg-emerald-50 rounded-2xl flex justify-between items-center border border-emerald-100">
                <div>
                  <p className="font-bold text-sm text-emerald-900">{s.fullName}</p>
                  <p className="text-xs text-emerald-700">دۆخی خێزان: {s.familyFinancialStatus}</p>
                </div>
                <div className="text-xs bg-white px-2 py-1 rounded-lg font-bold text-emerald-600 shadow-sm">مزگەوتی {s.currentMosque}</div>
              </div>
            ))}
            {financialNeeds === 0 && <p className="text-sm text-gray-400 italic text-center py-4">هیچ فەقێیەک لە دۆخی دارایی خراپدا نییە</p>}
          </div>
        </section>

        {/* Education Progress */}
        <section className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-50">
          <h3 className="font-bold text-lg mb-4 flex items-center text-blue-800">
            <BookOpen className="ml-2" size={18} /> ڕاپۆرتی ئاستی زانستی و خوێندن
          </h3>
          <div className="grid grid-cols-1 gap-4">
             <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-blue-900">ئاستی پێشکەوتوو</span>
                  <span className="text-xs bg-white px-2 py-0.5 rounded-full font-bold text-blue-700">{advancedStudents} فەقێ</span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                   <div className="bg-blue-600 h-full" style={{ width: `${(advancedStudents / totalStudents) * 100 || 0}%` }}></div>
                </div>
             </div>
             
             <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <h4 className="text-sm font-bold text-gray-700 mb-2">تێکڕای کتێبەکان</h4>
                <div className="flex justify-around text-center">
                   <div>
                     <p className="text-xl font-black text-gray-900">{Math.round(completedBooks / totalStudents || 0)}</p>
                     <p className="text-[10px] text-gray-500 font-bold uppercase">تەواوکراو/فەقێ</p>
                   </div>
                   <div className="w-[1px] bg-gray-200 h-8 mt-2"></div>
                   <div>
                     <p className="text-xl font-black text-emerald-700">{Math.round(currentBooks / totalStudents || 0)}</p>
                     <p className="text-[10px] text-gray-500 font-bold uppercase">لەبەرخوێندن/فەقێ</p>
                   </div>
                </div>
             </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Reports;
