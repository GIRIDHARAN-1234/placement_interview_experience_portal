import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  Eye,
  Filter,
  ShieldCheck,
  Building2,
  Calendar,
  AlertTriangle,
  Search,
  Sparkles,
  Award,
} from 'lucide-react';
import api from '../../services/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Modal } from '../../components/common/Modal';
import { StatusBadge, DifficultyBadge, PlacementVerifiedBadge } from '../../components/common/Badge';
import toast from 'react-hot-toast';

export const ExperienceModeration = () => {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('Pending Review');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Detail & Moderation Modal
  const [activeExp, setActiveExp] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchModerationList = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 12 });
      if (statusFilter !== 'All') params.append('status', statusFilter);

      const res = await api.get(`/admin/experiences?${params.toString()}`);
      if (res.data.success) {
        let list = res.data.data || [];
        if (search.trim()) {
          const s = search.toLowerCase();
          list = list.filter(
            (e) =>
              e.companyId?.name?.toLowerCase().includes(s) ||
              e.studentId?.name?.toLowerCase().includes(s) ||
              e.studentId?.registerNumber?.toLowerCase().includes(s) ||
              e.jobRole?.toLowerCase().includes(s)
          );
        }
        setExperiences(list);
        setTotalPages(res.data.pages || 1);
        setTotalCount(res.data.total || 0);
      }
    } catch (err) {
      console.error('Failed to load moderation list', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModerationList();
  }, [page, statusFilter, search]);

  const handleOpenReview = (exp) => {
    setActiveExp(exp);
    setFeedback(exp.moderationFeedback || '');
  };

  const handleModerate = async (actionType) => {
    if (!activeExp) return;

    if (actionType === 'Rejected' && !feedback.trim()) {
      toast.error('Please enter a feedback reason for rejecting this submission.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.put(`/admin/experiences/${activeExp._id}/moderate`, {
        status: actionType,
        moderationFeedback: feedback.trim(),
      });

      if (res.data.success) {
        toast.success(
          actionType === 'Approved'
            ? `Experience approved! ${
                activeExp.selectionOutcome === 'Selected'
                  ? 'Student granted official Placement Verified badge.'
                  : ''
              }`
            : 'Experience marked as Rejected.'
        );
        fetchModerationList();
        setActiveExp(null);
      }
    } catch (err) {
      toast.error(err.friendlyMessage || 'Failed to moderate experience.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Interview Experience Moderation
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review, verify, and approve student interview submissions. Approved experiences are published, and selected students receive the official Placement Verified badge.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-4 md:space-y-0 md:flex md:items-center md:justify-between md:space-x-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by company, student name, register number, or role..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
          {['Pending Review', 'Approved', 'Rejected', 'All'].map((s) => (
            <button
              key={s}
              onClick={() => {
                setStatusFilter(s);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                statusFilter === s
                  ? 'bg-white text-navy-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Moderation List */}
      {loading ? (
        <LoadingSpinner text="Loading moderation items..." size="lg" />
      ) : experiences.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-xs text-slate-400">
          No interview experiences found in "{statusFilter}".
        </div>
      ) : (
        <div className="space-y-4">
          {experiences.map((exp) => (
            <div
              key={exp._id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:border-slate-300 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-extrabold text-slate-900 text-sm bg-slate-100 px-3 py-0.5 rounded-lg">
                    {exp.companyId?.name}
                  </span>
                  <StatusBadge status={exp.status} />
                  <DifficultyBadge difficulty={exp.difficulty} />
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                      exp.selectionOutcome === 'Selected'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : exp.selectionOutcome === 'Rejected'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    Outcome: {exp.selectionOutcome || 'Selected'}
                  </span>
                  <PlacementVerifiedBadge verified={exp.studentId?.isPlacementVerified} />
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">{exp.jobRole}</h3>
                  <p className="text-xs text-slate-500">
                    Student: <span className="font-bold text-slate-700">{exp.studentId?.name}</span> ({exp.studentId?.registerNumber}) • {exp.studentId?.department} ({exp.studentId?.graduationYear} Batch) • {exp.rounds?.length || 0} Rounds Detailed
                  </p>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 max-w-3xl">
                  {exp.preparationStrategy}
                </p>

                {exp.moderationFeedback && (
                  <div className="text-xs p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
                    <span className="font-bold">Moderator Feedback:</span> {exp.moderationFeedback}
                  </div>
                )}
              </div>

              <div className="shrink-0 flex items-center space-x-2">
                <button
                  onClick={() => handleOpenReview(exp)}
                  className="px-4 py-2 bg-brand-blue hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center space-x-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect & Moderate</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review & Moderation Modal */}
      <Modal
        isOpen={!!activeExp}
        onClose={() => setActiveExp(null)}
        title="Inspect & Verify Interview Experience"
        maxWidth="max-w-3xl"
      >
        {activeExp && (
          <div className="space-y-6 text-xs text-slate-700">
            {/* Meta Card */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
              <div className="flex flex-wrap justify-between items-center gap-2">
                <span className="text-base font-bold text-slate-900">
                  {activeExp.companyId?.name} — {activeExp.jobRole}
                </span>
                <div className="flex items-center space-x-2">
                  <StatusBadge status={activeExp.status} />
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                    Outcome: {activeExp.selectionOutcome}
                  </span>
                </div>
              </div>
              <p className="text-slate-600">
                Submitted by: <span className="font-bold text-slate-900">{activeExp.studentId?.name}</span> (
                Reg: <span className="font-mono font-bold text-slate-800">{activeExp.studentId?.registerNumber}</span>, Dept: {activeExp.studentId?.department}, Batch: {activeExp.studentId?.graduationYear})
              </p>
              <div className="flex items-center space-x-2 pt-1">
                <span className="text-slate-500">Current Student Status:</span>
                <PlacementVerifiedBadge verified={activeExp.studentId?.isPlacementVerified} />
              </div>
            </div>

            {/* Verification Impact Notice */}
            {activeExp.selectionOutcome === 'Selected' && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-2.5 text-emerald-900 text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Placement Verification Impact:</strong> Approving this experience will automatically grant this student the official <strong>Placement Verified</strong> badge and link {activeExp.companyId?.name} to their record!
                </span>
              </div>
            )}

            {/* Rounds */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                Reported Rounds ({activeExp.rounds?.length}):
              </h4>
              {activeExp.rounds?.map((r, i) => (
                <div key={i} className="p-3.5 border border-slate-200 rounded-xl space-y-2 bg-white shadow-xs">
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-900">
                      Round {r.roundNumber || i + 1}: {r.roundName}
                    </span>
                    <span className="text-brand-blue font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-[11px]">
                      {r.roundType}
                    </span>
                  </div>
                  <p className="text-slate-600 whitespace-pre-line leading-relaxed">{r.description}</p>
                  {r.questionsAsked?.length > 0 && (
                    <div className="bg-slate-50 p-2.5 rounded-lg text-[11px] font-mono text-slate-800 border border-slate-200/60">
                      <strong className="text-slate-900">Questions Asked:</strong>
                      <ul className="list-disc list-inside mt-1 space-y-0.5">
                        {r.questionsAsked.map((q, qIdx) => (
                          <li key={qIdx}>{q}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {r.topicsCovered?.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {r.topicsCovered.map((t, tIdx) => (
                        <span key={tIdx} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Strategy */}
            <div className="space-y-1">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                Preparation Strategy:
              </h4>
              <p className="text-slate-700 p-3 bg-slate-50 rounded-xl whitespace-pre-line border border-slate-100">
                {activeExp.preparationStrategy}
              </p>
            </div>

            {/* Recommended Resources */}
            {activeExp.resourcesRecommended && (
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  Recommended Resources:
                </h4>
                <p className="text-slate-700 p-3 bg-slate-50 rounded-xl whitespace-pre-line border border-slate-100">
                  {activeExp.resourcesRecommended}
                </p>
              </div>
            )}

            {/* Advice */}
            {activeExp.advice && (
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  Advice For Juniors:
                </h4>
                <p className="text-slate-700 p-3 bg-slate-50 rounded-xl whitespace-pre-line border border-slate-100">
                  {activeExp.advice}
                </p>
              </div>
            )}

            {/* Moderation Feedback Input */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <label className="block font-bold text-slate-800">
                Moderator Feedback / Reason (Required if Rejecting)
              </label>
              <textarea
                rows={2}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="e.g. Excellent comprehensive report! Approved. Or: Questions incomplete, please specify technical questions."
                className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleModerate('Rejected')}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition flex items-center space-x-1.5 shadow-xs"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject Experience</span>
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={() => handleModerate('Approved')}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition flex items-center space-x-1.5 shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve & Verify Student</span>
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
