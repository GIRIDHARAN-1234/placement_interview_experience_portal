import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  FileText,
  HelpCircle,
  Bookmark,
  CheckSquare,
  Award,
  Zap,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  PlusCircle,
  TrendingUp,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [readiness, setReadiness] = useState(null);
  const [eligibility, setEligibility] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [recentQuestions, setRecentQuestions] = useState([]);
  const [stats, setStats] = useState({ companiesCount: 0, experiencesCount: 0, bookmarksCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [readinessRes, eligRes, tasksRes, qRes, bRes, statRes] = await Promise.all([
          api.get('/progress/readiness-score'),
          api.get('/placement-offers/my-eligibility'),
          api.get('/study-tasks'),
          api.get('/questions?limit=4'),
          api.get('/bookmarks'),
          api.get('/analytics/public-stats'),
        ]);

        if (readinessRes.data.success) setReadiness(readinessRes.data.data);
        if (eligRes.data.success) setEligibility(eligRes.data.data || []);
        if (tasksRes.data.success) setTasks(tasksRes.data.data || []);
        if (qRes.data.success) setRecentQuestions(qRes.data.data || []);
        if (statRes.data.success) {
          setStats({
            companiesCount: statRes.data.stats?.companiesCount || 0,
            experiencesCount: statRes.data.stats?.approvedExperiencesCount || 0,
            bookmarksCount: bRes.data.count || 0,
          });
        }
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading your dashboard..." size="lg" />;
  }

  const score = readiness?.readinessScore || 0;

  return (
    <div className="space-y-8">
      {/* 1. Welcome & Greeting Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-navy-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 shadow-lg relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-800 text-xs font-semibold text-emerald-400 border border-slate-700">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Campus Placement Preparation Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              {user?.department} • Class of {user?.graduationYear}. Track your milestones and
              practice company patterns.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/practice"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center space-x-2"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>Smart Practice Mode</span>
            </Link>
            <Link
              to="/submit-experience"
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl border border-slate-700 transition flex items-center space-x-2"
            >
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              <span>Submit Experience</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Readiness Score & Placement Verification Alert */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Placement Readiness Score Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-brand-blue" />
              <h2 className="text-sm font-bold text-slate-900">Placement Readiness Score</h2>
            </div>
            <Link
              to="/analytics"
              className="text-[11px] font-bold text-brand-blue hover:text-blue-700"
            >
              View Analytics →
            </Link>
          </div>

          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-4xl font-black text-navy-900">{score}%</span>
              <span className="text-xs font-semibold text-slate-500">
                {score >= 70
                  ? 'Strong Preparation'
                  : score >= 40
                  ? 'Progressing Well'
                  : 'Getting Started'}
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  score >= 70
                    ? 'bg-emerald-500'
                    : score >= 40
                    ? 'bg-blue-600'
                    : 'bg-amber-500'
                }`}
                style={{ width: `${score}%` }}
              ></div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Based on your question practice, roadmap milestones, and study task completion.
            </p>
          </div>
        </div>

        {/* Official Placement Verification Status */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h2 className="text-sm font-bold text-slate-900">
                Official Placement Offer Verification Status
              </h2>
            </div>

            {eligibility.length > 0 ? (
              <div className="space-y-3 mt-3">
                <p className="text-xs text-slate-600">
                  You are officially verified by the Placement Directorate as selected for:
                </p>
                <div className="flex flex-wrap gap-2">
                  {eligibility.map((item) => (
                    <div
                      key={item.offerId}
                      className="px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-900 flex items-center space-x-2"
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                      <span>
                        {item.company?.name} — {item.jobRole} ({item.placementDrive?.driveYear})
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-emerald-700 mt-1">
                  ✓ You are eligible to submit your interview experience for these companies!
                </p>
              </div>
            ) : (
              <div className="space-y-2 mt-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-700">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  <span>No Confirmed Placement Offers on Record Yet</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Only students officially placed through administrator-verified recruitment drives
                  can submit interview experiences. Once the placement cell verifies your offer
                  letter, you will be able to share your experience to help juniors.
                </p>
              </div>
            )}
          </div>

          <div className="pt-4 flex justify-end">
            <Link
              to="/submit-experience"
              className="text-xs font-bold text-brand-blue hover:text-blue-700 flex items-center space-x-1"
            >
              <span>Check Eligibility & Submit</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Metric Quick Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link
          to="/experiences"
          className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-card transition flex items-center space-x-4"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center font-bold">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900">{stats.experiencesCount}</div>
            <div className="text-xs text-slate-500">Approved Experiences</div>
          </div>
        </Link>

        <Link
          to="/companies"
          className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-card transition flex items-center space-x-4"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900">{stats.companiesCount}</div>
            <div className="text-xs text-slate-500">Listed Companies</div>
          </div>
        </Link>

        <Link
          to="/bookmarks"
          className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-card transition flex items-center space-x-4"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Bookmark className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900">{stats.bookmarksCount}</div>
            <div className="text-xs text-slate-500">Saved Bookmarks</div>
          </div>
        </Link>

        <Link
          to="/tasks"
          className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-card transition flex items-center space-x-4"
        >
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900">{tasks.length}</div>
            <div className="text-xs text-slate-500">Study Tasks</div>
          </div>
        </Link>
      </div>

      {/* 4. Tasks and Recommended Questions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Study Tasks Preview */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <CheckSquare className="w-5 h-5 text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-900">Upcoming Study Tasks</h2>
            </div>
            <Link to="/tasks" className="text-xs font-bold text-brand-blue hover:text-blue-700">
              Manage Tasks →
            </Link>
          </div>

          {tasks.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              No tasks scheduled yet. Create your first preparation goal!
            </div>
          ) : (
            <div className="space-y-2.5">
              {tasks.slice(0, 4).map((task) => (
                <div
                  key={task._id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 text-xs font-medium"
                >
                  <div className="flex items-center space-x-2.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        task.status === 'completed' ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                    ></span>
                    <span
                      className={
                        task.status === 'completed'
                          ? 'line-through text-slate-400'
                          : 'text-slate-800 font-semibold'
                      }
                    >
                      {task.title}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recommended Practice Questions */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <HelpCircle className="w-5 h-5 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900">Recommended Questions</h2>
            </div>
            <Link to="/questions" className="text-xs font-bold text-brand-blue hover:text-blue-700">
              All Questions →
            </Link>
          </div>

          <div className="space-y-3">
            {recentQuestions.map((q) => (
              <Link
                key={q._id}
                to={`/questions/${q._id}`}
                className="block p-3 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-200"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 line-clamp-1">{q.title}</span>
                  <span className="text-[11px] font-semibold text-slate-400 shrink-0 ml-2">
                    {q.category}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
