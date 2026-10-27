import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react';

export const Unauthorized = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-16 px-4 text-center">
      <div className="max-w-md space-y-5 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 mx-auto flex items-center justify-center shadow-inner">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900">Access Restricted</h1>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          You do not have the required administrative permissions to access this portal page.
        </p>
        <div className="pt-2 flex justify-center space-x-3">
          <Link
            to="/dashboard"
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-brand-blue hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
          >
            <span>Go to Dashboard</span>
          </Link>
          <Link
            to="/"
            className="inline-flex items-center space-x-2 px-5 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition"
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
