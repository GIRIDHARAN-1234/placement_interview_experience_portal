import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  HelpCircle,
  CheckCircle,
  Bookmark,
  ArrowLeft,
  Copy,
  Check,
  Building2,
  Code2,
  Lightbulb,
} from 'lucide-react';
import api from '../../services/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { DifficultyBadge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export const QuestionDetail = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showExplanation, setShowExplanation] = useState(true);

  useEffect(() => {
    const fetchQuestion = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/questions/${id}`);
        if (res.data.success) {
          setQuestion(res.data.data);

          if (isAuthenticated) {
            const [bRes, pRes] = await Promise.all([
              api.get(`/bookmarks/check?itemType=question&itemId=${id}`),
              api.get('/progress'),
            ]);

            if (bRes.data.success) setBookmarked(bRes.data.bookmarked);
            if (pRes.data.success && pRes.data.data?.completedQuestions) {
              const ids = pRes.data.data.completedQuestions.map((q) => q._id || q);
              setIsCompleted(ids.includes(id));
            }
          }
        }
      } catch (err) {
        console.error('Failed to load question', err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestion();
  }, [id, isAuthenticated]);

  const handleToggleBookmark = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to bookmark questions.');
      return;
    }

    try {
      const res = await api.post('/bookmarks/toggle', {
        itemType: 'question',
        itemId: id,
      });
      if (res.data.success) {
        setBookmarked(res.data.bookmarked);
        toast.success(res.data.message);
      }
    } catch (err) {
      toast.error('Failed to update bookmark');
    }
  };

  const handleToggleComplete = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to track question completion.');
      return;
    }

    try {
      const res = await api.post('/progress/toggle-question', { questionId: id });
      if (res.data.success) {
        setIsCompleted(res.data.completed);
        toast.success(res.data.message);
      }
    } catch (err) {
      toast.error('Failed to update progress');
    }
  };

  const handleCopyCode = () => {
    if (question?.codeSnippet) {
      navigator.clipboard.writeText(question.codeSnippet);
      setCopied(true);
      toast.success('Code copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading question..." size="lg" />;
  }

  if (!question) {
    return (
      <EmptyState
        icon={HelpCircle}
        title="Question Not Found"
        description="The practice question you requested does not exist."
        actionText="Back to Questions"
        actionLink="/questions"
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Back button */}
      <div>
        <Link
          to="/questions"
          className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-brand-blue transition space-x-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Question Bank</span>
        </Link>
      </div>

      {/* Main Question Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-lg">
                {question.category}
              </span>
              <DifficultyBadge difficulty={question.difficulty} />
              {question.companyId?.name && (
                <span className="text-xs font-semibold text-brand-blue bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-100">
                  {question.companyId.name} Tagged
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {question.title}
            </h1>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handleToggleComplete}
              className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                isCompleted
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <CheckCircle className={`w-4 h-4 mr-1.5 ${isCompleted ? 'fill-current' : ''}`} />
              <span>{isCompleted ? 'Completed' : 'Mark Done'}</span>
            </button>

            <button
              onClick={handleToggleBookmark}
              className={`p-2 rounded-xl text-xs font-bold transition border ${
                bookmarked
                  ? 'bg-amber-50 text-amber-600 border-amber-200'
                  : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
              }`}
              title="Bookmark Question"
            >
              <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Question Text */}
        <div className="bg-slate-50/80 rounded-2xl p-6 border border-slate-100">
          <p className="text-sm sm:text-base text-slate-800 leading-relaxed whitespace-pre-line">
            {question.questionText}
          </p>
        </div>

        {/* Tags */}
        {question.topicTags?.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2">
            <span className="text-xs font-bold text-slate-400 mr-1">Tags:</span>
            {question.topicTags.map((tag, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-600"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Answer & Explanation Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-extrabold text-slate-900">Answer & Explanation</h2>
          </div>
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="text-xs font-bold text-brand-blue hover:text-blue-700"
          >
            {showExplanation ? 'Hide Solution' : 'Reveal Solution'}
          </button>
        </div>

        {showExplanation && (
          <div className="space-y-6">
            {/* Short Answer */}
            {question.answer && (
              <div className="bg-blue-50/60 rounded-xl p-4 border border-blue-100 space-y-1">
                <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                  Quick Answer
                </span>
                <p className="text-sm font-semibold text-blue-950">{question.answer}</p>
              </div>
            )}

            {/* In-depth explanation */}
            {question.explanation && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Detailed Explanation
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {question.explanation}
                </p>
              </div>
            )}

            {/* Code Snippet if present */}
            {question.codeSnippet && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center">
                    <Code2 className="w-4 h-4 mr-1 text-slate-500" />
                    Reference Code Snippet
                  </h3>
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center space-x-1 text-xs text-slate-500 hover:text-slate-800 p-1 rounded"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="bg-slate-950 text-slate-200 rounded-xl p-4 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
                  <pre>{question.codeSnippet}</pre>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
