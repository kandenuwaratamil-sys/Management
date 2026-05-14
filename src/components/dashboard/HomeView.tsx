import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, getCountFromServer } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Calendar as CalendarIcon, Users, GraduationCap, BookOpen, Clock } from 'lucide-react';

export default function HomeView() {
  const [counts, setCounts] = useState({ students: 0, teachers: 0, subjects: 0 });

  useEffect(() => {
    const fetchCounts = async () => {
      const studentSnap = await getCountFromServer(collection(db, 'students'));
      const teacherSnap = await getCountFromServer(collection(db, 'teachers'));
      const subjectSnap = await getCountFromServer(collection(db, 'subjects'));
      setCounts({
        students: studentSnap.data().count,
        teachers: teacherSnap.data().count,
        subjects: subjectSnap.data().count
      });
    };
    fetchCounts();
  }, []);

  const stats = [
    { name: 'Total Students', value: counts.students.toString(), icon: GraduationCap, color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'Total Teachers', value: counts.teachers.toString(), icon: Users, color: 'text-purple-600', bg: 'bg-purple-100' },
    { name: 'Active Subjects', value: counts.subjects.toString(), icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { name: 'Attendance Today', value: '94%', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-100' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Welcome back!</h2>
        <p className="text-slate-500">Here's what's happening at Kandenuwara Tamil Maha Vidyalayam today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className={`p-3 rounded-xl ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.name}</p>
              <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800">Ongoing Term Progress</h3>
            <span className="text-sm text-sky-600 font-medium">Second Term 2024</span>
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-slate-600">Syllabus Coverage</span>
                <span className="font-bold text-sky-600">65%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-sky-500 rounded-full w-[65%]" />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-slate-600">Attendance Rate</span>
                <span className="font-bold text-emerald-600">88%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full w-[88%]" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-4">Notice Board</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer">
                <div className="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center flex-shrink-0 text-sky-600 font-bold text-xs p-1 text-center leading-tight">
                  MAY <br /> 15
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Parents Meeting</h4>
                  <p className="text-xs text-slate-500">Grade 10 & 11 parents special meeting at school hall.</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
