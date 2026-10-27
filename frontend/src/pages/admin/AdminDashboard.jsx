import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Building2,
  Briefcase,
  Award,
  CheckCircle2,
  HelpCircle,
  BookOpen,
  History,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import api from '../../services/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      setLoading(true);
      try {
        const res = await api.get('/admin/dashboard');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load admin dashboard', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading administration metrics..." size="lg" />;
  }

  const metrics = data?.metrics || {};
  const pendingSubmissions = data?.recentPendingSubmissions || [];
  const recentLogs = data?.recentAuditLogs || [];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Placement Administration Dashboard
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Monitor campus recruitment activities, verified placement offers, experience moderation,
          and student management.
        </p>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        <Link
          to="/admin/students"
          className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-card transition"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
            <span>Students</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{metrics.studentsCount || 0}</div>
          <span className="text-[11px] text-slate-400">Registered Students</span>
        </Link>

        <Link
          to="/admin/companies"
          className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-card transition"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
            <span>Companies</span>
            <Building2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{metrics.companiesCount || 0}</div>
          <span className="text-[11px] text-slate-400">Active Recruiters</span>
        </Link>

        <Link
          to="/admin/placement-drives"
          className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-card transition"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
            <span>Drives</span>
            <Briefcase className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{metrics.activeDrivesCount || 0}</div>
          <span className="text-[11px] text-slate-400">Campus Drives</span>
        </Link>

        <Link
          to="/admin/placement-offers"
          className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-card transition"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
            <span>Offers</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600">
            {metrics.verifiedOffersCount || 0}
          </div>
          <span className="text-[11px] text-slate-400">Verified Selected Offers</span>
        </Link>

        <Link
          to="/admin/experiences"
          className="bg-white rounded-2xl border border-amber-200 bg-amber-50/20 p-5 hover:shadow-card transition"
        >
          <div className="flex items-center justify-between text-xs text-amber-700 font-semibold mb-2">
            <span>Pending Review</span>
            <ShieldAlert className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-600">{metrics.pendingExpCount || 0}</div>
          <span className="text-[11px] text-amber-800">Awaiting Moderation</span>
        </Link>

        <Link
          to="/admin/experiences"
          className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-card transition"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
            <span>Approved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{metrics.approvedExpCount || 0}</div>
          <span className="text-[11px] text-slate-400">Live Experiences</span>
        </Link>

        <Link
          to="/admin/questions"
          className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-card transition"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
            <span>Questions</span>
            <HelpCircle className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{metrics.questionsCount || 0}</div>
          <span className="text-[11px] text-slate-400">Question Bank Items</span>
        </Link>

        <Link
          to="/admin/resources"
          className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-card transition"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
            <span>Resources</span>
            <BookOpen className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{metrics.resourcesCount || 0}</div>
          <span className="text-[11px] text-slate-400">Published Guides</span>
        </Link>
      </div>

      {/* Moderation Queue Alert Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold text-slate-900">
              Recent Submissions Awaiting Moderation ({pendingSubmissions.length})
            </h2>
          </div>
          <Link
            to="/admin/experiences"
            className="text-xs font-bold text-brand-blue hover:text-blue-700 flex items-center space-x-1"
          >
            <span>Open Moderation Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {pendingSubmissions.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-400 font-medium">
            ✓ All student interview submissions have been moderated. Moderation queue is clear!
          </div>
        ) : (
          <div className="space-y-3">
            {pendingSubmissions.map((sub) => (
              <div
                key={sub._id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 gap-3"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 text-sm">
                      {sub.companyId?.name} — {sub.jobRole}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                      Pending Review
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Submitted by {sub.studentId?.name} ({sub.studentId?.registerNumber}) •{' '}
                    {sub.studentId?.department}
                  </p>
                </div>

                <Link
                  to="/admin/experiences"
                  className="px-4 py-2 bg-brand-blue hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition text-center shrink-0"
                >
                  Review & Moderate
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Audit Activities */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-2">
            <History className="w-5 h-5 text-slate-600" />
            <h2 className="text-base font-bold text-slate-900">Recent Administrative Audit Logs</h2>
          </div>
          <Link
            to="/admin/audit-logs"
            className="text-xs font-bold text-brand-blue hover:text-blue-700 flex items-center space-x-1"
          >
            <span>View All Logs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-2.5">
          {recentLogs.map((log) => (
            <div
              key={log._id}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 border border-slate-100 text-xs"
            >
              <div className="flex items-center space-x-2.5">
                <span className="font-mono font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {log.action}
                </span>
                <span className="text-slate-600">
                  by <span className="font-semibold">{log.actorEmail}</span> on{' '}
                  <span className="font-semibold">{log.entityType}</span>
                </span>
              </div>
              <span className="text-[10px] text-slate-400">
                {new Date(log.timestamp).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
