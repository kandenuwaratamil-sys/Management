import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, updateDoc, doc, serverTimestamp, addDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { useAuth } from '../../hooks/useAuth';
import { Edit2, Save, TrendingUp, Plus } from 'lucide-react';
import { motion } from 'motion/react';

interface Term {
  id: string;
  name: string;
  progress: number;
  details: string;
}

export default function TermsView() {
  const { isAdmin } = useAuth();
  const [terms, setTerms] = useState<Term[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({ progress: 0, details: '' });

  useEffect(() => {
    const q = query(collection(db, 'terms'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTerms(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Term)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'terms');
    });
    return () => unsubscribe();
  }, []);

  const handleUpdate = async (id: string) => {
    if (!isAdmin) return;
    try {
      await updateDoc(doc(db, 'terms', id), {
        ...editValues,
        updatedAt: serverTimestamp()
      });
      setEditingId(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `terms/${id}`);
    }
  };

  const startEditing = (term: Term) => {
    setEditingId(term.id);
    setEditValues({ progress: term.progress, details: term.details || '' });
  };

  const handleAddTerm = async () => {
    if (!isAdmin) return;
    const name = prompt('Enter term name:');
    if (!name) return;
    try {
      await addDoc(collection(db, 'terms'), {
        name,
        progress: 0,
        details: '',
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'terms');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Academic Terms</h2>
          <p className="text-slate-500">Track and update syllabus coverage and term progress.</p>
        </div>
        {isAdmin && (
          <button onClick={handleAddTerm} className="bg-sky-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold shadow-sm hover:bg-sky-700 transition-colors">
            <Plus size={20} /> Create New Term
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {terms.map((term) => (
          <div key={term.id} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-50 rounded-full -mr-16 -mt-16 group-hover:bg-sky-100 transition-colors" />
            
            <div className="relative">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-sky-600 rounded-2xl flex items-center justify-center text-white">
                    <TrendingUp size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">{term.name}</h3>
                </div>
                {isAdmin && (
                  editingId === term.id ? (
                    <button onClick={() => handleUpdate(term.id)} className="text-emerald-600 hover:bg-emerald-50 p-2 rounded-xl border border-emerald-100 flex items-center gap-2">
                      <Save size={20} /> Save Changes
                    </button>
                  ) : (
                    <button onClick={() => startEditing(term)} className="text-sky-600 hover:bg-sky-50 p-2 rounded-xl transition-colors">
                      <Edit2 size={20} />
                    </button>
                  )
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-end mb-4">
                      <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Overall Progress</span>
                      <span className="text-4xl font-black text-sky-600">{editingId === term.id ? (
                        <input 
                          type="number" 
                          className="w-20 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-2xl" 
                          value={editValues.progress} 
                          onChange={e => setEditValues({...editValues, progress: Number(e.target.value)})}
                        />
                      ) : term.progress}%</span>
                    </div>
                    <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${editingId === term.id ? editValues.progress : term.progress}%` }}
                        className="h-full bg-gradient-to-r from-sky-500 to-sky-400 rounded-full shadow-[0_0_10px_rgba(14,165,233,0.3)]"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Term Details</span>
                  {editingId === term.id ? (
                    <textarea 
                      className="w-full h-32 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-700 outline-none focus:ring-2 focus:ring-sky-500"
                      value={editValues.details}
                      onChange={e => setEditValues({...editValues, details: e.target.value})}
                      placeholder="Enter term updates..."
                    />
                  ) : (
                    <p className="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl min-h-[8rem]">
                      {term.details || "No details provided for this term yet."}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
