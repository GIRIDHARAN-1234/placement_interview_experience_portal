import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapPin, CheckCircle2, Circle, Building2, Sparkles, ArrowRight } from 'lucide-react';
import api from '../../services/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export const Roadmap = () => {
  const [searchParams] = useSearchParams();
  const initialCompanyId = searchParams.get('companyId');

  const [companies, setCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState(initialCompanyId || '');
  const [roadmap, setRoadmap] = useState([]);
  const [companyInfo, setCompanyInfo] = useState(null);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [loading, setLoading] = useState(true);

  // Load companies
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await api.get('/companies?limit=50');
        if (res.data.success && res.data.data?.length > 0) {
          setCompanies(res.data.data);
          if (!selectedCompanyId) {
            setSelectedCompanyId(res.data.data[0]._id);
          }
        }
      } catch (err) {
        console.error('Failed to load companies for roadmap', err);
      }
    };
    fetchCompanies();
  }, []);

  // Fetch roadmap for selected company
  useEffect(() => {
    if (!selectedCompanyId) return;

    const fetchRoadmapData = async () => {
      setLoading(true);
      try {
        const [rRes, pRes] = await Promise.all([
          api.get(`/companies/${selectedCompanyId}/roadmap`),
          api.get(`/progress?companyId=${selectedCompanyId}`),
        ]);

        if (rRes.data.success) {
          setRoadmap(rRes.data.roadmap || []);
          setCompanyInfo(rRes.data.company);
        }

        if (pRes.data.success && pRes.data.data?.roadmapItems) {
          const completed = new Set(
            pRes.data.data.roadmapItems.filter((i) => i.completed).map((i) => i.stepId)
          );
          setCompletedSteps(completed);
        } else {
          setCompletedSteps(new Set());
        }
      } catch (err) {
        console.error('Failed to load roadmap', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoadmapData();
  }, [selectedCompanyId]);

  const handleToggleStep = async (stepId, title) => {
    const isCompleted = completedSteps.has(stepId);
    const nextCompleted = !isCompleted;

    try {
      const res = await api.put('/progress/roadmap-step', {
        companyId: selectedCompanyId,
        stepId,
        title,
        completed: nextCompleted,
      });

      if (res.data.success) {
        const updated = new Set(completedSteps);
        if (nextCompleted) {
          updated.add(stepId);
          toast.success(`Milestone completed: ${title}`);
        } else {
          updated.delete(stepId);
        }
        setCompletedSteps(updated);
      }
    } catch (err) {
      toast.error('Failed to update roadmap milestone');
    }
  };

  const progressPercent =
    roadmap.length > 0 ? Math.round((completedSteps.size / roadmap.length) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-50 text-brand-blue text-xs font-semibold border border-blue-200 mb-2">
          <MapPin className="w-4 h-4" />
          <span>Milestone-Driven Company Preparation</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Company Preparation Roadmap
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Follow a structured, phased recruitment preparation checklist and track your progress in
          real time.
        </p>
      </div>

      {/* Company Selector & Progress Ribbon */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Select Company Checklist
            </label>
            <select
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
              className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {companies.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} Preparation Roadmap
                </option>
              ))}
            </select>
          </div>

          <div className="text-right">
            <span className="text-2xl font-black text-navy-900">{progressPercent}%</span>
            <span className="block text-xs text-slate-400">
              {completedSteps.size} of {roadmap.length} steps completed
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Interactive Roadmap Step List */}
      {loading ? (
        <LoadingSpinner text="Loading roadmap..." size="lg" />
      ) : (
        <div className="space-y-4">
          {roadmap.map((step, idx) => {
            const isDone = completedSteps.has(step.stepId);
            return (
              <div
                key={step.stepId}
                onClick={() => handleToggleStep(step.stepId, step.title)}
                className={`bg-white rounded-2xl border p-6 transition cursor-pointer select-none flex items-start space-x-4 ${
                  isDone
                    ? 'border-emerald-300 bg-emerald-50/20 shadow-sm'
                    : 'border-slate-200 hover:border-blue-300'
                }`}
              >
                {/* Step Checkbox Icon */}
                <div className="mt-0.5 shrink-0">
                  {isDone ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 fill-emerald-100" />
                  ) : (
                    <Circle className="w-6 h-6 text-slate-300 hover:text-blue-500 transition" />
                  )}
                </div>

                {/* Step Body */}
                <div className="space-y-1 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Phase {step.order} • {step.category}
                    </span>
                  </div>

                  <h3
                    className={`text-base font-bold ${
                      isDone ? 'line-through text-slate-400' : 'text-slate-900'
                    }`}
                  >
                    {step.title}
                  </h3>

                  <p className="text-xs text-slate-500 leading-relaxed">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
