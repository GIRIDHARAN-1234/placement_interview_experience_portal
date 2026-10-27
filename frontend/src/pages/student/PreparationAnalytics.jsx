import React, { useState, useEffect } from 'react';
import {
  Award,
  TrendingUp,
  BarChart2,
  PieChart as PieIcon,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import api from '../../services/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const PreparationAnalytics = () => {
  const [readiness, setReadiness] = useState(null);
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const [readinessRes, trendsRes] = await Promise.all([
          api.get('/progress/readiness-score'),
          api.get('/analytics/portal-trends'),
        ]);

        if (readinessRes.data.success) setReadiness(readinessRes.data.data);
        if (trendsRes.data.success) setTrends(trendsRes.data.data);
      } catch (err) {
        console.error('Failed to load analytics', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Computing placement readiness analytics..." size="lg" />;
  }

  const score = readiness?.readinessScore || 0;
  const breakdown = readiness?.breakdown || {};
  const improvementAreas = readiness?.improvementAreas || [];

  const PIE_COLORS = ['#10b981', '#f59e0b', '#f43f5e'];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-50 text-brand-blue text-xs font-semibold border border-blue-200 mb-2">
          <Award className="w-4 h-4 text-brand-blue" />
          <span>Measurable Preparation Activity Indicator</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Placement Readiness Score & Analytics
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Transparent activity scoring based on question attempts, roadmap milestones, and study
          goal execution.
        </p>
      </div>

      {/* Main Score & Component Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm flex flex-col justify-between text-center space-y-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Overall Score
            </span>
            <div className="text-5xl font-black text-navy-900">{score}/100</div>
            <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-brand-blue border border-blue-200">
              {score >= 70
                ? 'High Placement Readiness'
                : score >= 40
                ? 'Moderate Readiness'
                : 'Initial Preparation Phase'}
            </span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Consistently solving questions, following company roadmaps, and scheduling study goals
            increases this preparation indicator.
          </p>
        </div>

        {/* Contributing Factors */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-slate-900">
            Contributing Activity Breakdown
          </h2>

          <div className="space-y-4">
            {/* Questions */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-800">
                  Question Bank Practice ({breakdown.questions?.completed || 0}/
                  {breakdown.questions?.target || 25} completed)
                </span>
                <span className="text-brand-blue font-bold">
                  {breakdown.questions?.score || 0} / {breakdown.questions?.max || 35} pts
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full"
                  style={{
                    width: `${((breakdown.questions?.score || 0) / (breakdown.questions?.max || 35)) * 100}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Roadmap */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-800">
                  Company Roadmap Milestones ({breakdown.roadmap?.completed || 0} steps checked)
                </span>
                <span className="text-indigo-600 font-bold">
                  {breakdown.roadmap?.score || 0} / {breakdown.roadmap?.max || 30} pts
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full"
                  style={{
                    width: `${((breakdown.roadmap?.score || 0) / (breakdown.roadmap?.max || 30)) * 100}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Study Tasks */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-800">
                  Personal Study Tasks ({breakdown.studyTasks?.completed || 0}/
                  {breakdown.studyTasks?.total || 0} completed)
                </span>
                <span className="text-emerald-600 font-bold">
                  {breakdown.studyTasks?.score || 0} / {breakdown.studyTasks?.max || 20} pts
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full"
                  style={{
                    width: `${((breakdown.studyTasks?.score || 0) / (breakdown.studyTasks?.max || 20)) * 100}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Engagement */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-800">
                  Saved Bookmarks & Revisions ({breakdown.engagement?.bookmarksCount || 0} items)
                </span>
                <span className="text-amber-600 font-bold">
                  {breakdown.engagement?.score || 0} / {breakdown.engagement?.max || 15} pts
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{
                    width: `${((breakdown.engagement?.score || 0) / (breakdown.engagement?.max || 15)) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Areas for Improvement */}
      {improvementAreas.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center space-x-2 text-amber-900 font-bold text-sm">
            <Lightbulb className="w-5 h-5 text-amber-600" />
            <span>Recommended Actions To Boost Your Readiness</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {improvementAreas.map((tip, i) => (
              <div
                key={i}
                className="p-3.5 bg-white rounded-xl border border-amber-200/80 text-xs text-amber-900 font-medium flex items-start space-x-2.5 shadow-xs"
              >
                <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center shrink-0 text-[10px]">
                  {i + 1}
                </span>
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Visual Analytics Charts (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution Bar Chart */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center">
            <BarChart2 className="w-4 h-4 mr-2 text-brand-blue" />
            Question Bank Distribution by Subject
          </h3>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trends?.questionCategories || []}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-25} textAnchor="end" />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Difficulty Distribution Pie Chart */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center">
            <PieIcon className="w-4 h-4 mr-2 text-emerald-600" />
            Questions by Difficulty Level
          </h3>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={trends?.difficulty || []}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {(trends?.difficulty || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500 leading-relaxed text-center">
        <span className="font-bold">Disclaimer:</span> {readiness?.disclaimer}
      </div>
    </div>
  );
};
