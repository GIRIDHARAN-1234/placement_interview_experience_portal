import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  HelpCircle,
  Search,
  Filter,
  CheckCircle,
  Bookmark,
  Zap,
  ArrowRight,
  Code2,
  X,
} from 'lucide-react';
import api from '../../services/api';
import { LoadingSpinner, CardSkeleton } from '../../components/common/LoadingSpinner';
import { DifficultyBadge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export const QuestionBank = () => {
  const { isAuthenticated } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedCompany, setSelectedCompany] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [completedIds, setCompletedIds] = useState(new Set());

  // Load categories and companies
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catRes, compRes] = await Promise.all([
          api.get('/questions/categories'),
          api.get('/companies?limit=50'),
        ]);

        if (catRes.data.success) setCategories(catRes.data.data || []);
        if (compRes.data.success) setCompanies(compRes.data.data || []);

        if (isAuthenticated) {
          const progRes = await api.get('/progress');
          if (progRes.data.success && progRes.data.data?.completedQuestions) {
            setCompletedIds(
              new Set(progRes.data.data.completedQuestions.map((q) => q._id || q))
            );
          }
        }
      } catch (err) {
        console.error('Failed to load question metadata', err);
      }
    };
    fetchMetadata();
  }, [isAuthenticated]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 12 });
      if (search.trim()) params.append('search', search.trim());
      if (selectedCategory !== 'All') params.append('category', selectedCategory);
      if (selectedDifficulty !== 'All') params.append('difficulty', selectedDifficulty);
      if (selectedCompany !== 'All') params.append('companyId', selectedCompany);

      const res = await api.get(`/questions?${params.toString()}`);
      if (res.data.success) {
        setQuestions(res.data.data);
        setTotalPages(res.data.pages || 1);
        setTotalCount(res.data.total || 0);
      }
    } catch (err) {
      console.error('Failed to load questions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [page, selectedCategory, selectedDifficulty, selectedCompany]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchQuestions();
  };

  const handleToggleComplete = async (questionId) => {
    if (!isAuthenticated) {
      toast.error('Log in to track your completed questions!');
      return;
    }

    try {
      const res = await api.post('/progress/toggle-question', { questionId });
      if (res.data.success) {
        const next = new Set(completedIds);
        if (res.data.completed) {
          next.add(questionId);
        } else {
          next.delete(questionId);
        }
        setCompletedIds(next);
        toast.success(res.data.message);
      }
    } catch (err) {
      toast.error('Failed to update question progress');
    }
  };

  const handleBookmark = async (questionId) => {
    if (!isAuthenticated) {
      toast.error('Log in to bookmark questions!');
      return;
    }

    try {
      const res = await api.post('/bookmarks/toggle', {
        itemType: 'question',
        itemId: questionId,
      });
      if (res.data.success) {
        toast.success(res.data.message);
      }
    } catch (err) {
      toast.error('Failed to bookmark question');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header and Smart Practice CTA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Technical Question Bank
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Curated coding and theory interview questions across Data Structures, DBMS, OS, Networks,
            and HR.
          </p>
        </div>

        <Link
          to="/practice"
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition shrink-0"
        >
          <Zap className="w-4 h-4 text-amber-300" />
          <span>Launch Smart Practice Mode</span>
        </Link>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => {
            setSelectedCategory('All');
            setPage(1);
          }}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
            selectedCategory === 'All'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          All Topics ({totalCount})
        </button>
        {categories.map((c) => (
          <button
            key={c.category}
            onClick={() => {
              setSelectedCategory(c.category);
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${
              selectedCategory === c.category
                ? 'bg-brand-blue text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {c.category} ({c.count})
          </button>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-4 md:space-y-0 md:flex md:items-center md:justify-between md:space-x-4">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions by title, keywords, or topics..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2">
          {/* Difficulty */}
          <select
            value={selectedDifficulty}
            onChange={(e) => {
              setSelectedDifficulty(e.target.value);
              setPage(1);
            }}
            className="border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 bg-white"
          >
            <option value="All">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          {/* Company */}
          <select
            value={selectedCompany}
            onChange={(e) => {
              setSelectedCompany(e.target.value);
              setPage(1);
            }}
            className="border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 bg-white"
          >
            <option value="All">All Companies</option>
            {companies.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          {(search || selectedCategory !== 'All' || selectedDifficulty !== 'All') && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedCategory('All');
                setSelectedDifficulty('All');
                setSelectedCompany('All');
                setPage(1);
              }}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              title="Clear filters"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Grid of Questions */}
      {loading ? (
        <CardSkeleton count={6} />
      ) : questions.length === 0 ? (
        <EmptyState
          icon={HelpCircle}
          title="No questions found"
          description="Try modifying your keyword search or selected filters."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {questions.map((q) => {
            const isCompleted = completedIds.has(q._id);
            return (
              <div
                key={q._id}
                className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-card-hover hover:border-blue-300 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md">
                      {q.category}
                    </span>
                    <DifficultyBadge difficulty={q.difficulty} />
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                    {q.title}
                  </h3>

                  <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                    {q.questionText}
                  </p>

                  {/* Topic tags */}
                  {q.topicTags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {q.topicTags.slice(0, 3).map((tag, i) => (
                        <span
                          key={i}
                          className="px-1.5 py-0.5 rounded text-[10px] bg-slate-50 text-slate-600 border border-slate-100"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {/* Complete toggle */}
                    <button
                      onClick={() => handleToggleComplete(q._id)}
                      className={`p-1.5 rounded-lg text-xs font-semibold transition ${
                        isCompleted
                          ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                          : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                      }`}
                      title={isCompleted ? 'Marked Completed' : 'Mark as Completed'}
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>

                    {/* Bookmark */}
                    <button
                      onClick={() => handleBookmark(q._id)}
                      className="p-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-amber-500 hover:bg-slate-50 transition"
                      title="Bookmark Question"
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>
                  </div>

                  <Link
                    to={`/questions/${q._id}`}
                    className="text-xs font-bold text-brand-blue hover:text-blue-700 flex items-center space-x-1"
                  >
                    <span>View Solution</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 pt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-xs text-slate-500 px-2">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
