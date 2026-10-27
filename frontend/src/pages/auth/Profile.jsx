import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Hash, Building, Calendar, ShieldCheck, Check, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [graduationYear, setGraduationYear] = useState(user?.graduationYear || 2026);
  const [loading, setLoading] = useState(false);

  const departments = [
    'Computer Science & Engineering',
    'Information Technology',
    'Electronics & Communication Engineering',
    'Electrical & Electronics Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Artificial Intelligence & Data Science',
  ];

  const years = [2024, 2025, 2026, 2027, 2028];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await updateProfile({
      name,
      department,
      graduationYear: Number(graduationYear),
    });
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Account Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage your personal details and academic department information.
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-navy-900 text-white font-extrabold text-2xl flex items-center justify-center shadow-md">
            {user?.name?.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{user?.name}</h2>
            <div className="flex flex-wrap items-center gap-2 mt-1 text-xs">
              <span className="font-semibold text-slate-500">{user?.email}</span>
              <span>•</span>
              <span className="px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-[10px] bg-blue-50 text-brand-blue border border-blue-200">
                {user?.role}
              </span>
              <span className="px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                {user?.accountStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Readonly Academic Identity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
          <div>
            <span className="font-bold text-slate-400 block mb-0.5">Register Number</span>
            <span className="font-mono font-bold text-slate-800 text-sm">
              {user?.registerNumber}
            </span>
          </div>
          <div>
            <span className="font-bold text-slate-400 block mb-0.5">Institutional Email</span>
            <span className="font-medium text-slate-800 text-sm">{user?.email}</span>
          </div>
        </div>

        {/* Editable Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Department
              </label>
              <div className="relative">
                <Building className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 bg-white"
                >
                  {departments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Graduation Year
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <select
                  value={graduationYear}
                  onChange={(e) => setGraduationYear(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 bg-white"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y} Batch
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-brand-blue hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center space-x-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
