import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Zap,
  Timer,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Lightbulb,
  Building2,
  Code2,
  Copy,
  Check,
} from 'lucide-react';
import api from '../../services/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { DifficultyBadge } from '../../components/common/Badge';
import toast from 'react-hot-toast';

export const SmartPractice = () => {
  const [searchParams] = useSearchParams();
  const initialCompany = searchParams.get('companyId') || 'All';

  const [sessionActive, setSessionActive] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [sessionMeta, setSessionMeta] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealedSolutions, setRevealedSolutions] = useState({});
  const [completedMap, setCompletedMap] = useState({});
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Form config
  const [category, setCategory] = useState('All');
  const [companyId, setCompanyId] = useState(initialCompany);
  const [difficulty, setDifficulty] = useState('All');
  const [count, setCount] = useState(5);
  const [timeLimit, setTimeLimit] = useState(15);

  const [categories, setCategories] = useState([]);
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [cRes, compRes] = await Promise.all([
          api.get('/questions/categories'),
          api.get('/companies?limit=50'),
        ]);
        if (cRes.data.success) setCategories(cRes.data.data || []);
        if (compRes.data.success) setCompanies(compRes.data.data || []);
      } catch (err) {
        console.error('Failed to load practice filters', err);
      }
    };
    fetchFilters();
  }, []);

  // Timer countdown
  useEffect(() => {
    let interval = null;
    if (sessionActive && isTimerRunning && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((sec) => sec - 1);
      }, 1000);
    } else if (secondsRemaining === 0 && sessionActive) {
      toast.error("Time's up for this practice session!");
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [sessionActive, isTimerRunning, secondsRemaining]);

  const handleStartSession = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post('/questions/smart-practice', {
        category,
        companyId,
        difficulty,
        count: Number(count),
        timeLimitMinutes: Number(timeLimit),
      });

      if (res.data.success && res.data.questions?.length > 0) {
        setQuestions(res.data.questions);
        setSessionMeta(res.data.sessionMeta);
        setCurrentIndex(0);
        setRevealedSolutions({});
        setCompletedMap({});
        setSecondsRemaining(Number(timeLimit) * 60);
        setIsTimerRunning(true);
        setSessionActive(true);
        toast.success(`Practice session started with ${res.data.questions.length} questions!`);
      }
    } catch (err) {
      toast.error(err.friendlyMessage || 'Failed to start practice session.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleReveal = (idx) => {
    setRevealedSolutions((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const handleToggleComplete = async (qId) => {
    try {
      const res = await api.post('/progress/toggle-question', { questionId: qId });
      if (res.data.success) {
        setCompletedMap((prev) => ({
          ...prev,
          [qId]: res.data.completed,
        }));
        toast.success(res.data.completed ? 'Question completed!' : 'Mark removed.');
      }
    } catch (err) {
      toast.error('Failed to update progress');
    }
  };

  const formatTimer = (sec) => {
    const mins = Math.floor(sec / 60);
    const remainingSec = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSec.toString().padStart(2, '0')}`;
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Code copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return <LoadingSpinner text="Generating your personalized practice session..." size="lg" />;
  }

  // 1. Practice Setup Screen
  if (!sessionActive) {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-50 text-brand-blue text-xs font-semibold border border-blue-200 mb-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Interactive Interview Simulation</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Smart Practice Mode
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Simulate actual campus tests by customizing questions by company, technical subject,
            difficulty, and time limits.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <form onSubmit={handleStartSession} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Target Company
              </label>
              <select
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 bg-white"
              >
                <option value="All">All Companies (General Placement Prep)</option>
                {companies.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Technical Subject / Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 bg-white"
              >
                <option value="All">All Categories (Comprehensive Mix)</option>
                {categories.map((c) => (
                  <option key={c.category} value={c.category}>
                    {c.category} ({c.count} available)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Difficulty
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 bg-white"
                >
                  <option value="All">Mixed</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Questions
                </label>
                <select
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 bg-white"
                >
                  <option value={5}>5 Questions</option>
                  <option value={10}>10 Questions</option>
                  <option value={15}>15 Questions</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Time Limit
                </label>
                <select
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 bg-white"
                >
                  <option value={10}>10 Minutes</option>
                  <option value={15}>15 Minutes</option>
                  <option value={20}>20 Minutes</option>
                  <option value={30}>30 Minutes</option>
                </select>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full py-3 bg-brand-blue hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center space-x-2"
              >
                <Zap className="w-4 h-4 text-amber-300" />
                <span>Start Practice Session</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // 2. Live Practice Interface Screen
  const currentQ = questions[currentIndex];
  const isRevealed = !!revealedSolutions[currentIndex];
  const isMarked = !!completedMap[currentQ?._id];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Practice Header Bar with Countdown Timer */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Question {currentIndex + 1} of {questions.length}
          </span>
          <div className="h-4 w-px bg-slate-200"></div>
          <span className="text-xs font-bold text-brand-blue">{currentQ?.category}</span>
          <DifficultyBadge difficulty={currentQ?.difficulty} />
        </div>

        {/* Live Timer */}
        <div className="flex items-center space-x-3">
          <div
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-mono font-bold ${
              secondsRemaining < 180
                ? 'bg-rose-50 text-rose-700 animate-pulse border border-rose-200'
                : 'bg-slate-100 text-slate-800'
            }`}
          >
            <Timer className="w-4 h-4 text-slate-500" />
            <span>{formatTimer(secondsRemaining)}</span>
          </div>

          <button
            onClick={() => setSessionActive(false)}
            className="text-xs text-slate-500 hover:text-slate-800 font-semibold p-1"
            title="End Session"
          >
            Exit Session
          </button>
        </div>
      </div>

      {/* Main Question Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
            {currentQ?.title}
          </h2>

          {currentQ?.companyInfo?.name && (
            <div className="flex items-center space-x-1.5 text-xs text-brand-blue font-semibold mt-1">
              <Building2 className="w-3.5 h-3.5" />
              <span>Asked in {currentQ.companyInfo.name}</span>
            </div>
          )}
        </div>

        {/* Question Statement */}
        <div className="bg-slate-50/90 rounded-2xl p-6 border border-slate-100">
          <p className="text-sm sm:text-base text-slate-800 leading-relaxed whitespace-pre-line">
            {currentQ?.questionText}
          </p>
        </div>

        {/* Action Toggle (Reveal Solution & Complete) */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <button
            onClick={() => handleToggleReveal(currentIndex)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-50 text-brand-blue hover:bg-blue-100 transition"
          >
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <span>{isRevealed ? 'Hide Explanation' : 'Reveal Solution & Explanation'}</span>
          </button>

          <button
            onClick={() => handleToggleComplete(currentQ._id)}
            className={`inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition border ${
              isMarked
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <CheckCircle className={`w-4 h-4 ${isMarked ? 'fill-current' : ''}`} />
            <span>{isMarked ? 'Marked Completed' : 'Mark Completed'}</span>
          </button>
        </div>

        {/* Revealed Solution Area */}
        {isRevealed && (
          <div className="space-y-4 pt-4 border-t border-slate-100 animate-fade-in">
            {currentQ?.answer && (
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1">
                <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                  Summary Answer:
                </span>
                <p className="text-sm font-semibold text-emerald-950">{currentQ.answer}</p>
              </div>
            )}

            {currentQ?.explanation && (
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  In-Depth Explanation:
                </span>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {currentQ.explanation}
                </p>
              </div>
            )}

            {currentQ?.codeSnippet && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center">
                    <Code2 className="w-4 h-4 mr-1" /> Code Solution:
                  </span>
                  <button
                    onClick={() => handleCopyCode(currentQ.codeSnippet)}
                    className="flex items-center space-x-1 text-xs text-slate-500 hover:text-slate-800"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="bg-slate-950 text-slate-200 rounded-xl p-4 font-mono text-xs overflow-x-auto border border-slate-800">
                  <pre>{currentQ.codeSnippet}</pre>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentIndex((idx) => Math.max(0, idx - 1))}
          disabled={currentIndex === 0}
          className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-white disabled:opacity-40 transition flex items-center space-x-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        {currentIndex < questions.length - 1 ? (
          <button
            onClick={() => setCurrentIndex((idx) => Math.min(questions.length - 1, idx + 1))}
            className="px-5 py-2 bg-brand-blue hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center space-x-1"
          >
            <span>Next Question</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => {
              toast.success('Congratulations! Practice session completed.');
              setSessionActive(false);
            }}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center space-x-1"
          >
            <span>Finish Session</span>
            <CheckCircle className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
