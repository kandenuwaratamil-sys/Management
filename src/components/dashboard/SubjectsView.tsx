import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { useAuth } from '../../hooks/useAuth';
import { Plus, Trash2, Library } from 'lucide-react';

interface Subject {
  id: string;
  name: string;
  code: string;
}

export default function SubjectsView() {
  const { isAdmin, user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newSubject, setNewSubject] = useState({ name: '', code: '' });

  useEffect(() => {
    const q = query(collection(db, 'subjects'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSubjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subject)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'subjects');
    });
    return () => unsubscribe();
  }, []);

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    try {
      await addDoc(collection(db, 'subjects'), {
        ...newSubject,
        addedBy: user?.uid
      });
      setNewSubject({ name: '', code: '' });
      setIsAdding(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'subjects');
    }
  };

  const handleDeleteSubject = async (id: string) => {
    if (!isAdmin) return;
    try {
      await deleteDoc(doc(db, 'subjects', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `subjects/${id}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Subjects</h2>
          <p className="text-slate-500">Curriculum and subject management.</p>
        </div>
        {isAdmin && (
          <button onClick={() => setIsAdding(!isAdding)} className="bg-sky-600 text-white px-4 py-2 rounded-xl flex items-center gap-2">
            <Plus size={20} /> Add Subject
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleAddSubject} className="bg-white p-6 rounded-2xl shadow-md border border-sky-100 flex gap-4 items-end">
          <div className="flex-1 space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Subject Name</label>
            <input required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2" placeholder="e.g. Mathematics" value={newSubject.name} onChange={e => setNewSubject({...newSubject, name: e.target.value})} />
          </div>
          <div className="w-40 space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Subject Code</label>
            <input required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2" placeholder="MATH101" value={newSubject.code} onChange={e => setNewSubject({...newSubject, code: e.target.value})} />
          </div>
          <button type="submit" className="bg-sky-600 text-white px-6 py-2 rounded-xl font-bold h-[42px]">Add</button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((subject) => (
          <div key={subject.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
              <Library size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-800">{subject.name}</h3>
              <p className="text-xs text-slate-400 font-mono">{subject.code}</p>
            </div>
            {isAdmin && (
              <button onClick={() => handleDeleteSubject(subject.id)} className="text-slate-300 hover:text-rose-500 transition-colors">
                <Trash2 size={18} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
