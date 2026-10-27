import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  FileText,
  HelpCircle,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  TrendingUp,
  Award,
  Users,
  Compass,
  Star,
  Zap,
} from 'lucide-react';
import api from '../../services/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { DifficultyBadge } from '../../components/common/Badge';

export const Home = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/analytics/public-stats');
        if (res.data.success) {
          setStats(res.data);
        }
      } catch (err) {
        console.error('Failed to load public stats', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-20 pb-16">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-navy-950 via-slate-900 to-navy-900 text-white pt-20 pb-28 px-4 sm:px-6 lg:px-8">
        {/* Subtle grid backdrop */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30"></div>

        <div className="relative max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs font-semibold text-emerald-400 shadow-inner">
            <ShieldCheck className="w-4 h-4" />
            <span>Official Placement Drive Verification Enabled</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
            Prepare Smarter. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-teal-300">
              Crack Your Dream Company.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            Explore verified placement interview experiences, practise company-specific questions,
            access curated study resources, and track your preparation journey in one place.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/companies"
              className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center justify-center space-x-2"
            >
              <span>Explore Companies</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/questions"
              className="w-full sm:w-auto px-8 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-sm rounded-xl transition flex items-center justify-center space-x-2"
            >
              <span>Start Preparing</span>
              <Zap className="w-4 h-4 text-amber-400" />
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Real Database Statistics Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 p-6 sm:p-8 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          <div className="p-4 border-r border-slate-100 last:border-none">
            <div className="text-3xl sm:text-4xl font-extrabold text-navy-900 tracking-tight">
              {loading ? '...' : stats?.stats?.studentsCount ?? 0}
            </div>
            <div className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">
              Registered Students
            </div>
          </div>
          <div className="p-4 border-r border-slate-100 last:border-none">
            <div className="text-3xl sm:text-4xl font-extrabold text-brand-blue tracking-tight">
              {loading ? '...' : stats?.stats?.companiesCount ?? 0}
            </div>
            <div className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">
              Listed Companies
            </div>
          </div>
          <div className="p-4 border-r border-slate-100 last:border-none">
            <div className="text-3xl sm:text-4xl font-extrabold text-emerald-600 tracking-tight">
              {loading ? '...' : stats?.stats?.approvedExperiencesCount ?? 0}
            </div>
            <div className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">
              Approved Experiences
            </div>
          </div>
          <div className="p-4">
            <div className="text-3xl sm:text-4xl font-extrabold text-indigo-600 tracking-tight">
              {loading ? '...' : stats?.stats?.questionsCount ?? 0}
            </div>
            <div className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">
              Practice Questions
            </div>
          </div>
        </div>
      </section>

      {/* 3. Featured Companies */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Featured Placement Recruiters</h2>
            <p className="text-sm text-slate-500 mt-1">
              Explore companies actively hiring from campus with proven question patterns.
            </p>
          </div>
          <Link
            to="/companies"
            className="mt-3 sm:mt-0 text-sm font-bold text-brand-blue hover:text-blue-700 flex items-center space-x-1"
          >
            <span>View All Companies</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats?.featuredCompanies?.map((comp) => (
            <Link
              key={comp._id}
              to={`/companies/${comp.slug || comp._id}`}
              className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-card-hover hover:border-blue-300 transition group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center font-bold text-slate-800 text-sm group-hover:scale-105 transition">
                    {comp.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-blue transition">
                      {comp.name}
                    </h3>
                    <span className="text-xs text-slate-500">{comp.industry}</span>
                  </div>
                </div>

                <div className="space-y-2 mt-3">
                  <div className="text-xs text-slate-600 line-clamp-2">
                    <span className="font-semibold text-slate-700">Roles:</span>{' '}
                    {comp.jobRoles?.join(', ')}
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-brand-blue">
                <span>View Experiences & Questions</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Recently Approved Interview Experiences */}
      <section className="bg-slate-100/60 py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
            <div>
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-emerald-700 mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span>Officially Moderated & Approved</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Recent Interview Experiences</h2>
              <p className="text-sm text-slate-500 mt-1">
                Authentic round-wise accounts from verified placed students.
              </p>
            </div>
            <Link
              to="/experiences"
              className="mt-3 sm:mt-0 text-sm font-bold text-brand-blue hover:text-blue-700 flex items-center space-x-1"
            >
              <span>Explore All Experiences</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stats?.recentApprovedExperiences?.map((exp) => (
              <div
                key={exp._id}
                className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-card transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-brand-blue bg-blue-50 px-2.5 py-1 rounded-md">
                      {exp.companyId?.name}
                    </span>
                    <DifficultyBadge difficulty={exp.difficulty} />
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{exp.jobRole}</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Shared by {exp.studentId?.department} ({exp.studentId?.graduationYear} Batch)
                  </p>

                  <p className="text-xs text-slate-600 mt-4 line-clamp-3 leading-relaxed">
                    {exp.preparationStrategy}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    {exp.rounds?.length || 0} Interview Rounds
                  </span>
                  <Link
                    to={`/experiences/${exp._id}`}
                    className="text-xs font-bold text-brand-blue hover:text-blue-700 flex items-center space-x-1"
                  >
                    <span>Read Full Experience</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Popular Practice Questions */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Popular Technical Questions</h2>
            <p className="text-sm text-slate-500 mt-1">
              Top interview questions across Data Structures, DBMS, Operating Systems, and Networks.
            </p>
          </div>
          <Link
            to="/questions"
            className="mt-3 sm:mt-0 text-sm font-bold text-brand-blue hover:text-blue-700 flex items-center space-x-1"
          >
            <span>Open Question Bank</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats?.popularQuestions?.map((q) => (
            <div
              key={q._id}
              className="bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    {q.category}
                  </span>
                  <DifficultyBadge difficulty={q.difficulty} />
                </div>
                <h3 className="text-sm font-bold text-slate-900 line-clamp-2">{q.title}</h3>
                <p className="text-xs text-slate-500 mt-2 line-clamp-2">{q.questionText}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                {q.companyId?.name ? (
                  <span className="text-slate-500 font-medium">{q.companyId.name}</span>
                ) : (
                  <span className="text-slate-400">Core Subject</span>
                )}
                <Link
                  to={`/questions/${q._id}`}
                  className="font-bold text-brand-blue hover:text-blue-700"
                >
                  View Solution →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. How the Portal Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            How The Portal Works
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            A reliable, verified ecosystem designed to elevate college campus placements.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-brand-blue mx-auto flex items-center justify-center font-bold text-lg">
              1
            </div>
            <h3 className="text-base font-bold text-slate-900">Verified Selection Rule</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Only students with officially verified placement offers can submit interview
              experiences, eliminating fake rumors and fabricated interview reports.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center font-bold text-lg">
              2
            </div>
            <h3 className="text-base font-bold text-slate-900">Administrative Moderation</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Submissions undergo thorough administrative review by the placement cell before being
              published to maintain highest standards and protect confidential student data.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center font-bold text-lg">
              3
            </div>
            <h3 className="text-base font-bold text-slate-900">Smart Preparation Tracking</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Track your Placement Readiness Score, check off company roadmaps, practise targeted
              questions with instant timers, and organize bookmarks.
            </p>
          </div>
        </div>
      </section>

      {/* 7. Call To Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-navy-950 via-slate-900 to-indigo-950 text-white p-8 sm:p-12 text-center space-y-6 shadow-xl relative overflow-hidden">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Begin Your Placement Preparation?
          </h2>
          <p className="text-slate-300 text-sm max-w-xl mx-auto">
            Join your college peers, study verified company experiences, and maximize your chances in
            the upcoming recruitment drive.
          </p>
          <div className="pt-2 flex justify-center space-x-4">
            <Link
              to="/register"
              className="px-6 py-3 bg-brand-blue hover:bg-blue-500 text-white text-sm font-bold rounded-xl shadow-md transition"
            >
              Register Student Account
            </Link>
            <Link
              to="/login"
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold rounded-xl border border-slate-700 transition"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
