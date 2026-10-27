import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { GraduationCap, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      if (result.user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    }
  };

  // Helper for quick demonstration
  const handleQuickFill = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-navy-900 text-white mx-auto flex items-center justify-center shadow-md">
            <GraduationCap className="w-7 h-7 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Sign In to PlacementPrep
          </h2>
          <p className="text-xs text-slate-500">
            Access verified placement experiences and preparation tools
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              College Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@college.edu"
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand-blue hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Accounts Quick-Fill Box (for effortless professor / examiner evaluation) */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5 text-xs">
          <div className="font-bold text-slate-700 flex items-center justify-between">
            <span>Quick Demo Credentials</span>
            <span className="text-[10px] text-slate-400 font-normal">Click to auto-fill</span>
          </div>

          <div className="grid grid-cols-1 gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickFill('student1@college.edu', 'StudentPass@2026')}
              className="text-left px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-blue-400 transition flex items-center justify-between"
            >
              <div>
                <span className="font-bold text-slate-800">Placed Student 1 (Google Selected)</span>
                <span className="block text-[10px] text-slate-500">student1@college.edu</span>
              </div>
              <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                Eligible
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('student4@college.edu', 'StudentPass@2026')}
              className="text-left px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-blue-400 transition flex items-center justify-between"
            >
              <div>
                <span className="font-bold text-slate-800">Student 4 (Not Placed Yet)</span>
                <span className="block text-[10px] text-slate-500">student4@college.edu</span>
              </div>
              <span className="text-[10px] text-slate-500 font-bold bg-slate-100 px-1.5 py-0.5 rounded">
                Unplaced
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('admin@college.edu', 'AdminPass@2026')}
              className="text-left px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-blue-400 transition flex items-center justify-between"
            >
              <div>
                <span className="font-bold text-slate-800">Placement Administrator</span>
                <span className="block text-[10px] text-slate-500">admin@college.edu</span>
              </div>
              <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded">
                Admin
              </span>
            </button>
          </div>
        </div>

        {/* Footer Link */}
        <div className="text-center text-xs text-slate-500">
          New to the portal?{' '}
          <Link to="/register" className="font-bold text-brand-blue hover:text-blue-700">
            Register student account
          </Link>
        </div>
      </div>
    </div>
  );
};
