import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { useAuth } from '../../hooks/useAuth';
import { Plus, Trash2, Search, UserPlus } from 'lucide-react';

interface Teacher {
  id: string;
  name: string;
  subject: string;
  employeeId: string;
}

export default function TeachersView() {
  const { isAdmin, user } = useAuth();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newTeacher, setNewTeacher] = useState({ name: '', subject: '', employeeId: '' });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'teachers'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTeachers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Teacher)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'teachers');
    });
    return () => unsubscribe();
  }, []);

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    try {
      await addDoc(collection(db, 'teachers'), {
        ...newTeacher,
        addedBy: user?.uid,
        createdAt: serverTimestamp()
      });
      setNewTeacher({ name: '', subject: '', employeeId: '' });
      setIsAdding(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'teachers');
    }
  };

  const handleDeleteTeacher = async (id: string) => {
    if (!isAdmin) return;
    if (!confirm('Are you sure you want to delete this teacher?')) return;
    try {
      await deleteDoc(doc(db, 'teachers', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `teachers/${id}`);
    }
  };

  const filteredTeachers = teachers.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Teachers List</h2>
          <p className="text-slate-500">Dedicated staff of Kandenuwara Tamil Maha Vidyalayam.</p>
        </div>
        
        {isAdmin && (
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors font-medium shadow-sm"
          >
            <Plus size={20} /> Add Teacher
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-2xl shadow-md border border-sky-100">
          <h3 className="font-bold text-slate-800 mb-4">Register New Teacher</h3>
          <form onSubmit={handleAddTeacher} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input 
              required
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2"
              placeholder="Name with Initials"
              value={newTeacher.name}
              onChange={e => setNewTeacher({...newTeacher, name: e.target.value})}
            />
            <input 
              required
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2"
              placeholder="Primary Subject"
              value={newTeacher.subject}
              onChange={e => setNewTeacher({...newTeacher, subject: e.target.value})}
            />
            <input 
              required
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2"
              placeholder="Employee ID"
              value={newTeacher.employeeId}
              onChange={e => setNewTeacher({...newTeacher, employeeId: e.target.value})}
            />
            <div className="md:col-span-3 flex justify-end gap-3">
              <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-slate-500">Cancel</button>
              <button type="submit" className="bg-sky-600 text-white px-6 py-2 rounded-lg font-bold">Add Teacher</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeachers.map((teacher) => (
          <div key={teacher.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm group hover:border-sky-200 transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center text-sky-600 font-bold text-xl uppercase">
                {teacher.name.charAt(0)}
              </div>
              {isAdmin && (
                <button onClick={() => handleDeleteTeacher(teacher.id)} className="text-slate-300 hover:text-rose-500 transition-colors">
                  <Trash2 size={16} />
                </button>
              )}
            </div>
            <h3 className="font-bold text-slate-800 text-lg">{teacher.name}</h3>
            <p className="text-sky-600 text-sm font-medium mb-3">{teacher.subject}</p>
            <div className="flex items-center gap-2 text-xs text-slate-400 border-t border-slate-50 pt-3">
              <span className="bg-slate-100 px-2 py-1 rounded">ID: {teacher.employeeId}</span>
            </div>
          </div>
        ))}
        {filteredTeachers.length === 0 && (
          <div className="md:col-span-3 py-12 text-center text-slate-400">No teachers found.</div>
        )}
      </div>
    </div>
  );
}
