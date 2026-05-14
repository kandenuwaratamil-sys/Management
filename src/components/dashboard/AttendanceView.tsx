import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { collection, query, where, onSnapshot, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { useAuth } from '../../hooks/useAuth';
import { UserCheck, UserX, Search, Calendar as CalendarIcon } from 'lucide-react';
import { formatDate, cn } from '../../lib/utils';

interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  userType: 'student' | 'teacher';
  status: 'present' | 'absent';
  date: string;
}

export default function AttendanceView() {
  const { isTeacher, user } = useAuth();
  const [date, setDate] = useState(new Date());
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [type, setType] = useState<'student' | 'teacher'>('student');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch users to mark attendance
  useEffect(() => {
    const q = query(collection(db, type === 'student' ? 'students' : 'teachers'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [type]);

  // Fetch records for the selected date
  useEffect(() => {
    const formattedDate = formatDate(date);
    const q = query(collection(db, 'attendance'), where('date', '==', formattedDate), where('userType', '==', type));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRecords(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AttendanceRecord)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'attendance');
    });
    return () => unsubscribe();
  }, [date, type]);

  const markAttendance = async (userId: string, userName: string, status: 'present' | 'absent') => {
    if (!isTeacher) return;
    const formattedDate = formatDate(date);
    
    // Check if record exists
    const existing = records.find(r => r.userId === userId);
    if (existing) {
      alert('Attendance already marked for this user today.');
      return;
    }

    try {
      await addDoc(collection(db, 'attendance'), {
        userId,
        userName,
        userType: type,
        status,
        date: formattedDate,
        markedBy: user?.uid,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'attendance');
    }
  };

  const getStatus = (userId: string) => {
    return records.find(r => r.userId === userId)?.status;
  };

  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <CalendarIcon size={18} className="text-sky-600" /> Select Date
          </h3>
          <Calendar 
            onChange={(val) => setDate(val as Date)} 
            value={date} 
            className="w-full border-none font-sans"
          />
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-4">Summary: {formatDate(date)}</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl">
              <span className="text-sm font-medium text-emerald-700">Present</span>
              <span className="text-xl font-bold text-emerald-700">{records.filter(r => r.status === 'present').length}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-rose-50 rounded-xl">
              <span className="text-sm font-medium text-rose-700">Absent</span>
              <span className="text-xl font-bold text-rose-700">{records.filter(r => r.status === 'absent').length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button 
                onClick={() => setType('student')}
                className={cn("px-4 py-1.5 rounded-lg text-sm font-bold transition-all", type === 'student' ? "bg-white text-sky-600 shadow-sm" : "text-slate-500")}
              >
                Students
              </button>
              <button 
                onClick={() => setType('teacher')}
                className={cn("px-4 py-1.5 rounded-lg text-sm font-bold transition-all", type === 'teacher' ? "bg-white text-sky-600 shadow-sm" : "text-slate-500")}
              >
                Teachers
              </button>
            </div>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                className="bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                placeholder="Search..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            {filteredUsers.map((item) => {
              const status = getStatus(item.id);
              return (
                <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">
                  <div>
                    <p className="font-bold text-slate-800">{item.name}</p>
                    <p className="text-xs text-slate-500">{type === 'student' ? `Grade ${item.grade}` : item.subject}</p>
                  </div>
                  <div className="flex gap-2">
                    {status ? (
                      <span className={cn(
                        "px-4 py-1.5 rounded-xl text-xs font-bold uppercase",
                        status === 'present' ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                      )}>
                        {status}
                      </span>
                    ) : (
                      <>
                        <button 
                          disabled={!isTeacher}
                          onClick={() => markAttendance(item.id, item.name, 'present')}
                          className="p-2 bg-white text-emerald-600 rounded-xl shadow-sm border border-emerald-100 hover:bg-emerald-50 disabled:opacity-50"
                        >
                          <UserCheck size={20} />
                        </button>
                        <button 
                          disabled={!isTeacher}
                          onClick={() => markAttendance(item.id, item.name, 'absent')}
                          className="p-2 bg-white text-rose-600 rounded-xl shadow-sm border border-rose-100 hover:bg-rose-50 disabled:opacity-50"
                        >
                          <UserX size={20} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
