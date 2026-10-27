import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Building2,
  Calendar,
  ThumbsUp,
  Bookmark,
  Share2,
  CheckCircle,
  HelpCircle,
  ShieldCheck,
  Award,
  ArrowLeft,
  ChevronRight,
  BookOpen,
  AlertCircle,
  Lightbulb,
  Sparkles,
} from 'lucide-react';
import api from '../../services/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { DifficultyBadge, StatusBadge, PlacementVerifiedBadge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export const ExperienceDetail = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const [experience, setExperience] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voted, setVoted] = useState(false);
  const [helpfulCount, setHelpfulCount] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    const fetchExperience = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/experiences/${id}`);
        if (res.data.success) {
          setExperience(res.data.data);
          setVoted(res.data.hasVotedHelpful || false);
          setHelpfulCount(res.data.data.helpfulCount || 0);

          // Check bookmark status if authenticated
          if (isAuthenticated) {
            const bRes = await api.get(`/bookmarks/check?itemType=experience&itemId=${id}`);
            if (bRes.data.success) {
              setBookmarked(bRes.data.bookmarked);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load experience', err);
      } finally {
        setLoading(false);
      }
    };

    fetchExperience();
  }, [id, isAuthenticated]);

  const handleVoteHelpful = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to vote on interview experiences.');
      return;
    }

    try {
      const res = await api.post(`/experiences/${id}/helpful`);
      if (res.data.success) {
        setVoted(res.data.voted);
        setHelpfulCount(res.data.helpfulCount);
        toast.success(res.data.message);
      }
    } catch (err) {
      toast.error(err.friendlyMessage || 'Failed to update helpful vote.');
    }
  };

  const handleToggleBookmark = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to bookmark this experience.');
      return;
    }

    try {
      const res = await api.post('/bookmarks/toggle', {
        itemType: 'experience',
        itemId: id,
      });
      if (res.data.success) {
        setBookmarked(res.data.bookmarked);
        toast.success(res.data.message);
      }
    } catch (err) {
      toast.error(err.friendlyMessage || 'Failed to bookmark.');
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading interview experience..." size="lg" />;
  }

  if (!experience) {
    return (
      <EmptyState
        icon={HelpCircle}
        title="Experience Not Found"
        description="This interview experience does not exist or may still be pending review."
        actionText="Back to Experiences"
        actionLink="/experiences"
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <div>
        <Link
          to="/experiences"
          className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-brand-blue transition space-x-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Experiences</span>
        </Link>
      </div>

      {/* Main Experience Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-extrabold text-navy-900 bg-slate-100 px-3 py-1 rounded-xl">
                {experience.companyId?.name}
              </span>
              <DifficultyBadge difficulty={experience.difficulty} />
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center">
                <CheckCircle className="w-3.5 h-3.5 mr-1" />
                {experience.selectionOutcome}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {experience.jobRole} Placement Experience
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
              <span>
                Department of {experience.studentId?.department} (
                {experience.studentId?.graduationYear} Batch)
              </span>
              <PlacementVerifiedBadge verified={experience.studentId?.isPlacementVerified} />
              <span>•</span>
              <span className="flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1" />
                {new Date(experience.interviewDate).toLocaleDateString()}
              </span>
              <span>•</span>
              <span className="capitalize">{experience.interviewMode} Mode</span>
            </div>
          </div>

          {/* Action buttons (Helpful & Bookmark) */}
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handleVoteHelpful}
              className={`inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-bold transition border ${
                voted
                  ? 'bg-blue-50 text-brand-blue border-blue-200'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <ThumbsUp className={`w-4 h-4 mr-1.5 ${voted ? 'fill-current' : ''}`} />
              <span>{helpfulCount} Helpful</span>
            </button>

            <button
              onClick={handleToggleBookmark}
              className={`p-2 rounded-xl text-xs font-bold transition border ${
                bookmarked
                  ? 'bg-amber-50 text-amber-600 border-amber-200'
                  : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
              }`}
              title="Bookmark Experience"
            >
              <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Verification badge note */}
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 flex items-start space-x-3 text-xs text-emerald-900">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Verified Placement Selection:</span> This candidate was
            officially verified by the College Placement Directorate as having received a confirmed
            job offer from {experience.companyId?.name} during the {experience.placementDriveId?.title}.
          </div>
        </div>
      </div>

      {/* Round-By-Round Breakdown */}
      <div className="space-y-6">
        <h2 className="text-xl font-extrabold text-slate-900">
          Round-By-Round Interview Breakdown ({experience.rounds?.length} Rounds)
        </h2>

        <div className="space-y-6">
          {experience.rounds?.map((round, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm"
            >
              {/* Round Title & Type */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-7 h-7 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                    {round.roundNumber || idx + 1}
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{round.roundName}</h3>
                </div>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {round.roundType}
                </span>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {round.description}
              </p>

              {/* Questions Asked */}
              {round.questionsAsked?.length > 0 && (
                <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Questions Asked
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-xs text-slate-800">
                    {round.questionsAsked.map((q, qIdx) => (
                      <li key={qIdx} className="leading-relaxed">
                        {q}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Topics Covered */}
              {round.topicsCovered?.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-2">
                  <span className="text-[11px] font-bold text-slate-400 mr-1">Topics:</span>
                  {round.topicsCovered.map((topic, tIdx) => (
                    <span
                      key={tIdx}
                      className="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-brand-blue"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Preparation Strategy & Resources */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 flex items-center">
            <Award className="w-4 h-4 mr-2 text-brand-blue" />
            Preparation Strategy
          </h3>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {experience.preparationStrategy}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 flex items-center">
            <BookOpen className="w-4 h-4 mr-2 text-emerald-600" />
            Recommended Resources
          </h3>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {experience.resourcesRecommended || 'No specific links mentioned.'}
          </p>
        </div>
      </div>

      {/* Advice for Yet-to-be-Placed Students */}
      {experience.advice && (
        <div className="bg-gradient-to-br from-amber-50 via-orange-50/50 to-amber-50 rounded-3xl border border-amber-200/90 p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200">
              <Lightbulb className="w-4 h-4 text-amber-600" />
              <span>Verified Senior Advice for Yet-to-be-Placed Students</span>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              From {experience.studentId?.name || 'Placed Senior'} ({experience.studentId?.department})
            </span>
          </div>

          <div className="space-y-3">
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-amber-600" />
              How to Crack {experience.companyId?.name || 'This Company'} & Recruitment Advice
            </h3>
            <div className="bg-white/80 rounded-2xl border border-amber-200/80 p-5 sm:p-6 text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line font-medium shadow-xs">
              {experience.advice}
            </div>
          </div>

          {/* Quick Actionable Checklist for Placement Aspirants */}
          <div className="pt-2 border-t border-amber-200/60">
            <div className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-3">
              Key Takeaways for Students Preparing for Upcoming Drives
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-start space-x-2 bg-white/60 p-3 rounded-xl border border-amber-100">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-slate-700">
                  <strong>Master Fundamentals:</strong> Review core subjects (OOPS, DBMS, OS) and practice questions asked in earlier rounds.
                </span>
              </div>
              <div className="flex items-start space-x-2 bg-white/60 p-3 rounded-xl border border-amber-100">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-slate-700">
                  <strong>Think & Speak Aloud:</strong> Interviewers prioritize your problem-solving thought process over instantaneous code.
                </span>
              </div>
              <div className="flex items-start space-x-2 bg-white/60 p-3 rounded-xl border border-amber-100">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-slate-700">
                  <strong>Resume Integrity:</strong> Be prepared to explain architecture, decisions, and challenges in every project on your resume.
                </span>
              </div>
              <div className="flex items-start space-x-2 bg-white/60 p-3 rounded-xl border border-amber-100">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-slate-700">
                  <strong>Maintain Momentum:</strong> Treat every interview as a stepping stone; learn from missed questions and stay confident.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
