import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { useAuth } from '../../hooks/useAuth';
import { Plus, Trash2, Search, UserPlus } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  grade: string;
  indexNumber: string;
}

export default function StudentsView() {
  const { isAdmin, user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: '', grade: '', indexNumber: '' });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'students'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setStudents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'students');
    });
    return () => unsubscribe();
  }, []);

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    try {
      await addDoc(collection(db, 'students'), {
        ...newStudent,
        addedBy: user?.uid,
        createdAt: serverTimestamp()
      });
      setNewStudent({ name: '', grade: '', indexNumber: '' });
      setIsAdding(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'students');
    }
  };

  const handleDeleteStudent = async (id: string) => {
    if (!isAdmin) return;
    if (!confirm('Are you sure you want to delete this student?')) return;
    try {
      await deleteDoc(doc(db, 'students', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `students/${id}`);
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.indexNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Student Directory</h2>
          <p className="text-slate-500">Manage student records and information.</p>
        </div>
        
        {isAdmin && (
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors font-medium shadow-sm"
          >
            <Plus size={20} /> Add Student
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-2xl shadow-md border border-sky-100 animate-in fade-in slide-in-from-top-4">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <UserPlus size={20} className="text-sky-600" /> New Student Registration
          </h3>
          <form onSubmit={handleAddStudent} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input 
              required
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-sky-500 outline-none transition-all"
              placeholder="Full Name"
              value={newStudent.name}
              onChange={e => setNewStudent({...newStudent, name: e.target.value})}
            />
            <input 
              required
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-sky-500 outline-none transition-all"
              placeholder="Grade (e.g. 10-A)"
              value={newStudent.grade}
              onChange={e => setNewStudent({...newStudent, grade: e.target.value})}
            />
            <input 
              required
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-sky-500 outline-none transition-all"
              placeholder="Index Number"
              value={newStudent.indexNumber}
              onChange={e => setNewStudent({...newStudent, indexNumber: e.target.value})}
            />
            <div className="md:col-span-3 flex justify-end gap-3 mt-2">
              <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
              <button type="submit" className="bg-sky-600 text-white px-6 py-2 rounded-lg hover:bg-sky-700 transition-all font-bold">Register Student</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <div className="relative max-w-sm">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 focus:ring-2 focus:ring-sky-500 outline-none transition-all text-sm"
              placeholder="Search by name or index..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-bold">Name</th>
                <th className="px-6 py-4 font-bold">Grade</th>
                <th className="px-6 py-4 font-bold">Index Num</th>
                {isAdmin && <th className="px-6 py-4 font-bold text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4 font-medium text-slate-800">{student.name}</td>
                  <td className="px-6 py-4">
                    <span className="bg-sky-50 text-sky-700 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-tighter">
                      {student.grade}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-mono text-sm uppercase">{student.indexNumber}</td>
                  {isAdmin && (
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDeleteStudent(student.id)}
                        className="text-slate-400 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">No students found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
