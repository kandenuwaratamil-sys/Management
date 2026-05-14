import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'motion/react';
import { GraduationCap, LogIn } from 'lucide-react';

// Placeholder for the school logo provided by the user
const LOGO_URL = "/logo.png"; 

export default function LoginPage() {
  const { login } = useAuth();

  return (
    <div className="min-h-screen bg-sky-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center border border-sky-100"
      >
        <div className="mb-6 flex justify-center">
          <div className="w-40 h-40 rounded-full border-4 border-sky-500 p-1 bg-white overflow-hidden flex items-center justify-center">
             {/* If logo.png exists, it will show, otherwise it shows a fallback cap icon */}
             <img 
               src={LOGO_URL} 
               alt="School Logo" 
               className="w-full h-full object-contain"
               onError={(e) => {
                 (e.target as HTMLImageElement).src = 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png';
               }}
             />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-sky-900 mb-2 leading-tight">
          MT/Kandenuwara <br />
          <span className="text-sky-600">Tamil Maha Vidyalayam</span>
        </h1>
        <p className="text-slate-500 mb-8 font-medium">
          "Practice In Order to Knowledge"
        </p>

        <button
          onClick={login}
          className="w-full flex items-center justify-center gap-3 bg-sky-600 hover:bg-sky-700 text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-lg hover:shadow-sky-200 group"
        >
          <LogIn className="w-5 h-5 group-hover:scale-110 transition-transform" />
          Sign in with Google
        </button>

        <p className="mt-8 text-xs text-slate-400">
          Management System v1.0 <br />
          Unauthorized access is prohibited
        </p>
      </motion.div>
    </div>
  );
}
