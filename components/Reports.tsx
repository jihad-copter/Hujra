
import React from 'react';
import { Student, TeacherVisit, FinancialLog } from '../types';
import { FileText, TrendingUp, Heart, Wallet, BookOpen, AlertCircle, AlertTriangle, Calendar, User, DollarSign } from 'lucide-react';

interface ReportsProps {
  students: Student[];
  visits: TeacherVisit[];
}

interface GlobalFinancialLog extends FinancialLog {
  studentName: string;
}

const Reports: React.FC<ReportsProps> = ({ students, visits }) => {
  const totalStudents = students.length;
  
  // Health: Count anyone NOT 'تەندروستە' and having non-empty status
  const sickStudents = students.filter(s => 
    s.healthStatus && 
    s.healthStatus.trim() !== 'تەندروستە' && 
    s.healthStatus.trim() !== ''
  );

  // Financial: Count poor/bad status
  const financialAlerts = students.filter(s => 
    s.familyFinancialStatus === 'خراپ' || s.familyFinancialStatus === 'هەژار'
  );

  // کۆکردنەوەی هەموو مێژووە داراییەکان لە هەموو فەقێکانەوە
  const allFinancialLogs: GlobalFinancialLog[] = students.reduce((acc, student) => {
    const studentLogs = (student.financialHistory || []).map(log => ({
      ...log,
      studentName: student.fullName
    }));
    return [...acc, ...studentLogs];
  }, [] as GlobalFinancialLog[]).sort((a, b) => b.date.localeCompare(a.date));

  const totalAid = allFinancialLogs.reduce((sum, log) => sum + (parseInt(log.amount) || 0), 0);

  const completedBooksCount = students.reduce((acc, s) => acc + (s.previousBooks?.length || 0), 0);

  return (
    <div className="space-y-6 pb-20 text-right" dir="rtl">
      <div className="flex items-center gap-3 px-1">
        <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl"><FileText size={24} /></div>
        <h2 className="text-2xl font-black text-emerald-900">ڕاپۆرتی گشتی حوجرە</h2>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-emerald-50 text-center">
          <TrendingUp className="mx-auto text-emerald-600 mb-2" size={24} />
          <p className="text-2xl font-black text-emerald-950">{totalStudents}</p>
          <p className="text-[10px] font-bold text-gray-400 uppercase">کۆی فەقێ</p>
        </div>
        <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-blue-50 text-center">
          <BookOpen className="mx-auto text-blue-600 mb-2" size={24} />
          <p className="text-2xl font-black text-blue-950">{completedBooksCount}</p>
          <p className="text-[10px] font-bold text-gray-400 uppercase">کتێبی تەواوبوو</p>
        </div>
        <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-red-50 text-center">
          <Heart className="mx-auto text-red-600 mb-2" size={24} />
          <p className="text-2xl font-black text-red-950">{sickStudents.length}</p>
          <p className="text-[10px] font-bold text-gray-400 uppercase">نەخۆش/پێویست</p>
        </div>
        <div className="bg-amber-500 p-5 rounded-[2rem] shadow-xl text-center text-emerald-950">
          <Wallet className="mx-auto mb-2" size={24} />
          <p className="text-xl font-black">{totalAid.toLocaleString()} د.ع</p>
          <p className="text-[10px] font-black uppercase opacity-70">کۆی هاوکارییەکان</p>
        </div>
      </div>

      {/* Financial History Table Section */}
      <section className="bg-white p-6 rounded-[2.5rem] shadow-lg border-2 border-amber-50 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex justify-between items-center mb-6 border-b border-amber-50 pb-4">
           <div className="bg-amber-100 text-amber-800 px-4 py-2 rounded-xl font-black text-sm">
             کۆی گشتی: {totalAid.toLocaleString()} دینار
           </div>
           <h3 className="font-black text-lg flex items-center text-amber-900">
             <DollarSign className="ml-2" size={22} /> ڕاپۆرتی وردی هاوکارییە داراییەکان
           </h3>
        </div>
        
        <div className="overflow-x-auto rounded-2xl">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-amber-50">
                <th className="p-4 text-xs font-black text-amber-900 border-b">بەروار</th>
                <th className="p-4 text-xs font-black text-amber-900 border-b">ناوی فەقێ</th>
                <th className="p-4 text-xs font-black text-amber-900 border-b">بڕ (دینار)</th>
                <th className="p-4 text-xs font-black text-amber-900 border-b">سەرچاوە</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-50">
              {allFinancialLogs.length > 0 ? (
                allFinancialLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-amber-50/30 transition-colors">
                    <td className="p-4 font-mono text-[11px] text-gray-400">{log.date}</td>
                    <td className="p-4 font-black text-gray-900 text-sm">{log.studentName}</td>
                    <td className="p-4 font-black text-emerald-700 text-sm">{parseInt(log.amount).toLocaleString()}</td>
                    <td className="p-4 text-xs font-bold text-amber-700">{log.source}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-10 text-center text-gray-400 font-bold italic">
                    هیچ تۆمارێکی دارایی نییە بۆ نیشاندان.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Alert Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="bg-white p-6 rounded-[2.5rem] shadow-md border-2 border-red-50 h-fit">
          <h3 className="font-black text-lg mb-4 flex items-center text-red-700">
            <AlertCircle className="ml-2" size={20} /> پێویستی تەندروستی
          </h3>
          <div className="space-y-3">
            {sickStudents.map(s => (
              <div key={s.id} className="p-4 bg-red-50 rounded-2xl flex justify-between items-center border border-red-100">
                <div className="text-right">
                  <p className="font-black text-sm text-red-950">{s.fullName}</p>
                  <p className="text-[11px] text-red-700 font-bold">{s.healthStatus}</p>
                </div>
                <div className="text-[10px] font-black bg-white px-3 py-1 rounded-lg text-red-600 shadow-sm">{s.currentMosque}</div>
              </div>
            ))}
            {sickStudents.length === 0 && <p className="text-center text-gray-400 text-sm py-4">هەمووان لە تەندروستییەکی باشدان.</p>}
          </div>
        </section>

        <section className="bg-white p-6 rounded-[2.5rem] shadow-md border-2 border-amber-50 h-fit">
          <h3 className="font-black text-lg mb-4 flex items-center text-amber-700">
            <AlertTriangle className="ml-2" size={20} /> پێویستی دارایی (خێزان)
          </h3>
          <div className="space-y-3">
            {financialAlerts.map(s => (
              <div key={s.id} className="p-4 bg-amber-50 rounded-2xl flex justify-between items-center border border-amber-100">
                <div className="text-right">
                  <p className="font-black text-sm text-amber-950">{s.fullName}</p>
                  <p className="text-[11px] text-amber-700 font-bold">باری دارایی: {s.familyFinancialStatus}</p>
                </div>
                <div className="text-[10px] font-black bg-white px-3 py-1 rounded-lg text-amber-600 shadow-sm">{s.phone}</div>
              </div>
            ))}
            {financialAlerts.length === 0 && <p className="text-center text-gray-400 text-sm py-4">هیچ بارێکی دارایی خراپ تۆمار نەکراوە.</p>}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Reports;
