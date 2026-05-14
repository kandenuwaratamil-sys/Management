import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, Users, BookOpen, UserCheck, Calendar, 
  BarChart3, LogOut, Menu, X, GraduationCap 
} from 'lucide-react';
import { cn } from '../lib/utils';

// View Components (to be created)
import HomeView from '../components/dashboard/HomeView';
import StudentsView from '../components/dashboard/StudentsView';
import TeachersView from '../components/dashboard/TeachersView';
import SubjectsView from '../components/dashboard/SubjectsView';
import AttendanceView from '../components/dashboard/AttendanceView';
import TermsView from '../components/dashboard/TermsView';

type View = 'home' | 'students' | 'teachers' | 'subjects' | 'attendance' | 'terms';

export default function Dashboard() {
  const { logout, profile } = useAuth();
  const [activeView, setActiveView] = useState<View>('home');
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const navigation = [
    { id: 'home', name: 'Home', icon: Home },
    { id: 'students', name: 'Students', icon: GraduationCap },
    { id: 'teachers', name: 'Teachers List', icon: Users },
    { id: 'subjects', name: 'Subjects', icon: BookOpen },
    { id: 'attendance', name: 'Attendance', icon: UserCheck },
    { id: 'terms', name: 'Term Progress', icon: BarChart3 },
  ];

  const renderView = () => {
    switch (activeView) {
      case 'home': return <HomeView />;
      case 'students': return <StudentsView />;
      case 'teachers': return <TeachersView />;
      case 'subjects': return <SubjectsView />;
      case 'attendance': return <AttendanceView />;
      case 'terms': return <TermsView />;
      default: return <HomeView />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="bg-sky-900 text-white flex flex-col shadow-xl z-20 relative"
      >
        <div className="p-4 flex items-center gap-3 border-b border-sky-800">
          <div className="w-10 h-10 rounded-full bg-white p-1 overflow-hidden flex-shrink-0">
             <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          {isSidebarOpen && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="overflow-hidden whitespace-nowrap"
            >
              <h1 className="font-bold text-sm leading-tight">Kandenuwara Tamil</h1>
              <p className="text-sky-300 text-[10px]">Maha Vidyalayam</p>
            </motion.div>
          )}
        </div>

        <nav className="flex-1 mt-6 px-3 space-y-1">
          {navigation.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as View)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all group",
                activeView === item.id 
                  ? "bg-sky-600 text-white shadow-lg" 
                  : "hover:bg-sky-800 text-sky-100 hover:text-white"
              )}
            >
              <item.icon className={cn("w-5 h-5", activeView === item.id ? "scale-110" : "group-hover:scale-110 transition-transform")} />
              {isSidebarOpen && <span className="font-medium">{item.name}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-sky-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-sky-700 flex items-center justify-center font-bold text-xs">
              {profile?.name?.charAt(0)}
            </div>
            {isSidebarOpen && (
              <div className="overflow-hidden">
                <p className="text-xs font-bold truncate">{profile?.name}</p>
                <p className="text-[10px] text-sky-300 capitalize">{profile?.role}</p>
              </div>
            )}
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-rose-300 hover:bg-rose-900/30 hover:text-rose-100 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            {isSidebarOpen && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>

        <button 
          onClick={() => setSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3 top-20 bg-sky-600 text-white p-1 rounded-full shadow-lg border border-white hover:bg-sky-500 transition-colors"
        >
          {isSidebarOpen ? <X size={12} /> : <Menu size={12} />}
        </button>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 h-full overflow-y-auto relative p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
