import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FileText,
  ShieldCheck,
  Plus,
  Trash2,
  Send,
  Building2,
  Calendar,
  Award,
  ArrowRight,
  Eye,
  CheckCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import api from '../../services/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Modal } from '../../components/common/Modal';
import toast from 'react-hot-toast';

export const SubmitExperience = () => {
  const [companies, setCompanies] = useState([]);
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const navigate = useNavigate();

  // Form state
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [selectedDriveId, setSelectedDriveId] = useState('');
  const [jobRole, setJobRole] = useState('Software Engineer');
  const [interviewDate, setInterviewDate] = useState(new Date().toISOString().split('T')[0]);
  const [interviewMode, setInterviewMode] = useState('virtual');
  const [difficulty, setDifficulty] = useState('Medium');
  const [selectionOutcome, setSelectionOutcome] = useState('Selected');
  const [preparationStrategy, setPreparationStrategy] = useState('');
  const [resourcesRecommended, setResourcesRecommended] = useState('');
  const [advice, setAdvice] = useState('');

  // Rounds state
  const [rounds, setRounds] = useState([
    {
      roundNumber: 1,
      roundName: 'Online Assessment',
      roundType: 'Online Assessment',
      description: '',
      questionsAsked: '',
      topicsCovered: '',
    },
    {
      roundNumber: 2,
      roundName: 'Technical Round 1',
      roundType: 'Technical Round',
      description: '',
      questionsAsked: '',
      topicsCovered: '',
    },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [cRes, dRes] = await Promise.all([
          api.get('/companies?limit=100'),
          api.get('/placement-drives?limit=100'),
        ]);

        if (cRes.data.success && cRes.data.data?.length > 0) {
          setCompanies(cRes.data.data);
          setSelectedCompanyId(cRes.data.data[0]._id);
          if (cRes.data.data[0].jobRoles?.length > 0) {
            setJobRole(cRes.data.data[0].jobRoles[0]);
          }
        }

        if (dRes.data.success) {
          setDrives(dRes.data.data || []);
        }
      } catch (err) {
        console.error('Failed to load companies or drives', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // When company changes, update available drives & suggested role
  const handleCompanyChange = (compId) => {
    setSelectedCompanyId(compId);
    const selectedComp = companies.find((c) => c._id === compId);
    if (selectedComp && selectedComp.jobRoles?.length > 0) {
      setJobRole(selectedComp.jobRoles[0]);
    }

    // Check if there is a drive for this company
    const compDrives = drives.filter(
      (d) => (d.companyId?._id || d.companyId) === compId
    );
    if (compDrives.length > 0) {
      setSelectedDriveId(compDrives[0]._id);
    } else {
      setSelectedDriveId('');
    }
  };

  const handleAddRound = () => {
    setRounds([
      ...rounds,
      {
        roundNumber: rounds.length + 1,
        roundName: `Technical Round ${rounds.length}`,
        roundType: 'Technical Round',
        description: '',
        questionsAsked: '',
        topicsCovered: '',
      },
    ]);
  };

  const handleRemoveRound = (idx) => {
    if (rounds.length <= 1) {
      toast.error('At least one interview round is required.');
      return;
    }
    const filtered = rounds.filter((_, i) => i !== idx);
    // Renumber
    setRounds(filtered.map((r, i) => ({ ...r, roundNumber: i + 1 })));
  };

  const handleRoundChange = (idx, field, value) => {
    const updated = [...rounds];
    updated[idx][field] = value;
    setRounds(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCompanyId) {
      toast.error('Please select a company.');
      return;
    }

    if (!jobRole.trim()) {
      toast.error('Please enter the job role.');
      return;
    }

    // Validate rounds
    for (let i = 0; i < rounds.length; i++) {
      if (!rounds[i].roundName.trim() || !rounds[i].description.trim()) {
        toast.error(`Please complete the round name and description for Round ${i + 1}.`);
        return;
      }
    }

    if (preparationStrategy.trim().length < 10) {
      toast.error('Please provide a detailed preparation strategy (min 10 characters).');
      return;
    }

    // Format rounds for backend
    const formattedRounds = rounds.map((r) => ({
      roundNumber: r.roundNumber,
      roundName: r.roundName.trim(),
      roundType: r.roundType,
      description: r.description.trim(),
      questionsAsked: r.questionsAsked
        ? r.questionsAsked
            .split('\n')
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
      topicsCovered: r.topicsCovered
        ? r.topicsCovered
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
    }));

    setSubmitting(true);
    try {
      const payload = {
        companyId: selectedCompanyId,
        placementDriveId: selectedDriveId || null,
        jobRole: jobRole.trim(),
        interviewDate,
        interviewMode,
        difficulty,
        selectionOutcome,
        rounds: formattedRounds,
        preparationStrategy: preparationStrategy.trim(),
        resourcesRecommended: resourcesRecommended.trim(),
        advice: advice.trim(),
      };

      const res = await api.post('/experiences', payload);
      if (res.data.success) {
        toast.success(
          'Interview experience submitted successfully! It has entered administrative moderation review.'
        );
        navigate('/my-experiences');
      }
    } catch (err) {
      toast.error(err.friendlyMessage || 'Failed to submit interview experience.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading companies and recruitment drives..." size="lg" />;
  }

  const selectedCompany = companies.find((c) => c._id === selectedCompanyId);
  const companyDrives = drives.filter(
    (d) => (d.companyId?._id || d.companyId) === selectedCompanyId
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-50 text-brand-blue text-xs font-semibold border border-blue-200 mb-2">
          <Sparkles className="w-4 h-4 text-brand-blue" />
          <span>Student Interview Experience Submission</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Submit Interview Experience
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Share your recruitment journey and interview questions with college juniors. Submissions are reviewed and verified by the Placement Cell administration.
        </p>
      </div>

      {/* Info notice banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5 flex items-start space-x-4 shadow-xs">
        <div className="p-2 rounded-xl bg-blue-100 text-brand-blue shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="text-xs text-slate-700 space-y-1">
          <div className="font-bold text-slate-900 text-sm">
            Administrative Verification & Placement Badge
          </div>
          <p className="leading-relaxed">
            Your report will be reviewed by the admin for quality and confidentiality. Once approved, it will be published to help your peers, and if your outcome was <strong>Selected</strong>, you will receive the official <strong>Placement Verified</strong> student badge!
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Step 1: Target Company & Selection Details */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-slate-900 flex items-center">
            <Building2 className="w-5 h-5 mr-2 text-brand-blue" />
            1. Company & Recruitment Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Target Company <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedCompanyId}
                onChange={(e) => handleCompanyChange(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                required
              >
                {companies.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} ({c.industry || 'Technology'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Placement Drive (Optional)
              </label>
              <select
                value={selectedDriveId}
                onChange={(e) => setSelectedDriveId(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">General / Off-Campus / Other Drive</option>
                {companyDrives.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.title} ({d.driveYear})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Job Role <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={jobRole}
                onChange={(e) => setJobRole(e.target.value)}
                placeholder="e.g. Software Development Engineer, Analyst"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              {selectedCompany?.jobRoles?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="text-[11px] text-slate-400">Suggested:</span>
                  {selectedCompany.jobRoles.slice(0, 4).map((r, i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => setJobRole(r)}
                      className="text-[11px] px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 font-medium"
                    >
                      {r}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Selection Outcome <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectionOutcome}
                onChange={(e) => setSelectionOutcome(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="Selected">Selected / Offer Received</option>
                <option value="Rejected">Rejected</option>
                <option value="Waiting">Waiting for Results</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Interview Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={interviewDate}
                onChange={(e) => setInterviewDate(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Interview Mode
              </label>
              <select
                value={interviewMode}
                onChange={(e) => setInterviewMode(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 bg-white"
              >
                <option value="virtual">Virtual / Online</option>
                <option value="on-campus">On-Campus In-Person</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Overall Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 bg-white"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>
        </div>

        {/* Step 2: Dynamic Round-By-Round Builder */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-indigo-600" />
                2. Round-By-Round Breakdown ({rounds.length} Rounds)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Document each interview stage (OA, Technical, HR) with questions asked.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddRound}
              className="inline-flex items-center px-3.5 py-1.5 bg-blue-50 text-brand-blue hover:bg-blue-100 text-xs font-bold rounded-xl transition shadow-xs"
            >
              <Plus className="w-4 h-4 mr-1" />
              <span>Add Round</span>
            </button>
          </div>

          <div className="space-y-6">
            {rounds.map((round, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4 relative"
              >
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-lg bg-navy-900 text-white font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-sm font-bold text-slate-800">
                      Round {idx + 1} Details
                    </span>
                  </div>
                  {rounds.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveRound(idx)}
                      className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center space-x-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      Round Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={round.roundName}
                      onChange={(e) => handleRoundChange(idx, 'roundName', e.target.value)}
                      placeholder="e.g. Technical Round 1, System Design"
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      Round Type
                    </label>
                    <select
                      value={round.roundType}
                      onChange={(e) => handleRoundChange(idx, 'roundType', e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium bg-white"
                    >
                      <option value="Online Assessment">Online Assessment</option>
                      <option value="Technical Round">Technical Round</option>
                      <option value="System Design">System Design</option>
                      <option value="Managerial">Managerial</option>
                      <option value="HR">HR Interview</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Round Experience Description <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={round.description}
                    onChange={(e) => handleRoundChange(idx, 'description', e.target.value)}
                    placeholder="Describe how the round was conducted, duration, environment, interviewer focus..."
                    className="w-full border border-slate-200 rounded-xl p-3 text-xs leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      Specific Questions Asked (One per line)
                    </label>
                    <textarea
                      rows={2}
                      value={round.questionsAsked}
                      onChange={(e) => handleRoundChange(idx, 'questionsAsked', e.target.value)}
                      placeholder="e.g. Reverse a Linked List&#10;Explain ACID properties&#10;Tell me about yourself"
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      Topics Covered (Comma separated)
                    </label>
                    <textarea
                      rows={2}
                      value={round.topicsCovered}
                      onChange={(e) => handleRoundChange(idx, 'topicsCovered', e.target.value)}
                      placeholder="e.g. DSA, Trees, DBMS, SQL, OOP, System Architecture"
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step 3: Preparation Strategy & Advice */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-slate-900 flex items-center">
            <Award className="w-5 h-5 mr-2 text-emerald-600" />
            3. Preparation Strategy & Advice
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Preparation Strategy & Approach (Min 10 chars) <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              required
              value={preparationStrategy}
              onChange={(e) => setPreparationStrategy(e.target.value)}
              placeholder="How many months did you prepare? Which topics did you emphasize? How did you practice coding and mock interviews?"
              className="w-full border border-slate-200 rounded-2xl p-4 text-xs sm:text-sm leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Recommended Resources / Books / Sheets
              </label>
              <textarea
                rows={3}
                value={resourcesRecommended}
                onChange={(e) => setResourcesRecommended(e.target.value)}
                placeholder="e.g. Striver SDE Sheet, NeetCode 150, Gate Smashers OS, LeetCode, GeekForGeeks"
                className="w-full border border-slate-200 rounded-xl p-3 text-xs leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Advice For Future Candidates
              </label>
              <textarea
                rows={3}
                value={advice}
                onChange={(e) => setAdvice(e.target.value)}
                placeholder="What mistakes should juniors avoid during the recruitment drive?"
                className="w-full border border-slate-200 rounded-xl p-3 text-xs leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="px-5 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition flex items-center space-x-1.5"
          >
            <Eye className="w-4 h-4" />
            <span>Preview Submission</span>
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-brand-blue hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition disabled:opacity-50 flex items-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span>{submitting ? 'Submitting...' : 'Submit For Admin Moderation'}</span>
          </button>
        </div>
      </form>

      {/* Preview Modal */}
      <Modal isOpen={previewOpen} onClose={() => setPreviewOpen(false)} title="Submission Preview">
        <div className="space-y-4 text-xs text-slate-700">
          <div className="p-3 bg-slate-50 rounded-xl space-y-1">
            <span className="font-bold text-slate-900 block text-sm">
              {selectedCompany?.name} — {jobRole}
            </span>
            <span>
              Date: {interviewDate} • Mode: {interviewMode} • Difficulty: {difficulty} • Outcome: {selectionOutcome}
            </span>
          </div>

          <div className="space-y-2">
            <span className="font-bold text-slate-900 block">Rounds Preview:</span>
            {rounds.map((r, i) => (
              <div key={i} className="p-2.5 border border-slate-200 rounded-lg">
                <span className="font-bold">
                  Round {i + 1}: {r.roundName} ({r.roundType})
                </span>
                <p className="mt-1 text-slate-600">{r.description || 'No description provided.'}</p>
              </div>
            ))}
          </div>

          <div className="space-y-1 pt-2">
            <span className="font-bold text-slate-900 block">Strategy:</span>
            <p className="text-slate-600">{preparationStrategy || 'None'}</p>
          </div>
        </div>
      </Modal>
    </div>
  );
};
