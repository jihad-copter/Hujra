
import React from 'react';
import { Home, Users, UserPlus, History, BarChart3, WifiOff, Settings } from 'lucide-react';
import { ViewState } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewState;
  onViewChange: (view: ViewState) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, onViewChange }) => {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const navItems = [
    { id: 'DASHBOARD' as ViewState, label: 'سەرەکی', icon: Home },
    { id: 'STUDENT_LIST' as ViewState, label: 'فەقێکان', icon: Users },
    { id: 'ADD_STUDENT' as ViewState, label: 'تۆمار', icon: UserPlus },
    { id: 'REPORTS' as ViewState, label: 'ڕاپۆرت', icon: BarChart3 },
    { id: 'VISIT_HISTORY' as ViewState, label: 'سەردان', icon: History },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#fdfbf7] text-right pb-24 md:pb-0 md:pr-64">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-emerald-900 text-white p-4 shadow-md kurdish-pattern flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center shadow-inner border-2 border-amber-200 overflow-hidden">
             <img src="https://img.icons8.com/color/48/mosque.png" alt="mosque" className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight">بەڕێوەبەری حوجرە</h1>
            {!isOnline && (
              <div className="flex items-center text-[10px] text-amber-200 font-bold">
                <WifiOff className="w-3 h-3 ml-1" /> دۆخی ئۆفلاین
              </div>
            )}
          </div>
        </div>
        <button onClick={() => onViewChange('SETTINGS')} className="p-2 hover:bg-emerald-800 rounded-full relative active:scale-90 transition-transform">
          <Settings className="w-6 h-6" />
        </button>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-emerald-900 text-white p-6 shadow-xl h-screen fixed top-0 right-0 kurdish-pattern">
        <div className="mb-10 text-center border-b border-emerald-800 pb-6">
          <h1 className="text-2xl font-bold tracking-tight">سیستەمی حوجرە</h1>
          <p className="text-emerald-200 text-sm mt-2 font-bold">خزمەتی زانایانی ئایندە</p>
        </div>
        <nav className="space-y-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
                currentView === item.id 
                ? 'bg-amber-500 text-emerald-950 shadow-lg scale-105 font-black' 
                : 'hover:bg-emerald-800 text-emerald-100 font-bold'
              }`}
            >
              <item.icon className="w-6 h-6" />
              <span className="mr-3 flex-1 text-right">{item.label}</span>
            </button>
          ))}
          <button
            onClick={() => onViewChange('SETTINGS')}
            className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
              currentView === 'SETTINGS' 
              ? 'bg-emerald-700 text-white shadow-lg font-black' 
              : 'hover:bg-emerald-800 text-emerald-100 font-bold'
            }`}
          >
            <Settings className="w-6 h-6" />
            <span className="mr-3 flex-1 text-right">ڕێنمایی</span>
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="max-w-4xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 shadow-[0_-8px_30px_rgb(0,0,0,0.08)] flex justify-around items-center h-20 px-2 safe-area-bottom z-50">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-all active:scale-90 ${
              currentView === item.id ? 'text-emerald-800' : 'text-gray-400'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${currentView === item.id ? 'bg-emerald-50' : ''}`}>
              <item.icon className={`w-6 h-6 ${currentView === item.id ? 'stroke-[2.5px]' : 'stroke-[1.5px]'}`} />
            </div>
            <span className={`text-[9px] mt-1 font-black ${currentView === item.id ? 'opacity-100' : 'opacity-70'}`}>
              {item.label}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
