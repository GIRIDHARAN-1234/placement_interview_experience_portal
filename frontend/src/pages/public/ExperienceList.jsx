import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Search, Filter, ThumbsUp, ArrowRight, ShieldCheck, X, Lightbulb } from 'lucide-react';
import api from '../../services/api';
import { CardSkeleton, LoadingSpinner } from '../../components/common/LoadingSpinner';
import { DifficultyBadge, PlacementVerifiedBadge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';

export const ExperienceList = () => {
  const [experiences, setExperiences] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('All');
  const [difficulty, setDifficulty] = useState('All');
  const [sort, setSort] = useState('recent');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Load companies for the filter dropdown
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await api.get('/companies?limit=50');
        if (res.data.success) {
          setCompanies(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load companies filter', err);
      }
    };
    fetchCompanies();
  }, []);

  const fetchExperiences = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10, sort });
      if (search.trim()) params.append('search', search.trim());
      if (selectedCompany !== 'All') params.append('companyId', selectedCompany);
      if (difficulty !== 'All') params.append('difficulty', difficulty);

      const res = await api.get(`/experiences?${params.toString()}`);
      if (res.data.success) {
        setExperiences(res.data.data);
        setTotalPages(res.data.pages || 1);
        setTotalCount(res.data.total || 0);
      }
    } catch (err) {
      console.error('Failed to load experiences', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiences();
  }, [page, selectedCompany, difficulty, sort]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchExperiences();
  };

  const handleClearFilters = () => {
    setSearch('');
    setSelectedCompany('All');
    setDifficulty('All');
    setSort('recent');
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200 mb-3">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Only Verified Placement Offers</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Interview Experiences
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Explore genuine, detailed interview accounts submitted by officially placed students and
          verified by the placement administration.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-4 lg:space-y-0 lg:flex lg:items-center lg:justify-between lg:space-x-4">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by job role, topics covered, or questions asked..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </form>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Company filter */}
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

          {/* Difficulty filter */}
          <select
            value={difficulty}
            onChange={(e) => {
              setDifficulty(e.target.value);
              setPage(1);
            }}
            className="border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 bg-white"
          >
            <option value="All">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
            className="border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 bg-white"
          >
            <option value="recent">Most Recent</option>
            <option value="helpful">Most Helpful</option>
          </select>

          {(search || selectedCompany !== 'All' || difficulty !== 'All') && (
            <button
              onClick={handleClearFilters}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              title="Clear filters"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Count */}
      <div className="text-xs text-slate-500 font-medium">
        Showing <span className="font-bold text-slate-800">{experiences.length}</span> of{' '}
        <span className="font-bold text-slate-800">{totalCount}</span> approved experiences
      </div>

      {/* Experience List */}
      {loading ? (
        <CardSkeleton count={4} />
      ) : experiences.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No interview experiences found"
          description="Try broadening your search keyword or clearing the company/difficulty filters."
          actionText="Clear Filters"
          onAction={handleClearFilters}
        />
      ) : (
        <div className="space-y-4">
          {experiences.map((exp) => (
            <div
              key={exp._id}
              className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-card transition flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-3 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-extrabold text-navy-900 bg-slate-100 px-3 py-1 rounded-lg">
                    {exp.companyId?.name}
                  </span>
                  <DifficultyBadge difficulty={exp.difficulty} />
                  <span className="text-xs text-slate-400">
                    {exp.rounds?.length || 0} Interview Rounds
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 leading-tight">
                    {exp.jobRole} Interview Experience
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-xs text-slate-500">
                      Shared by {exp.studentId?.department} • Class of{' '}
                      {exp.studentId?.graduationYear}
                    </span>
                    <PlacementVerifiedBadge verified={exp.studentId?.isPlacementVerified} />
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 max-w-3xl leading-relaxed">
                  <span className="font-semibold text-slate-700">Strategy:</span>{' '}
                  {exp.preparationStrategy}
                </p>

                {exp.advice && (
                  <div className="text-xs text-amber-900 bg-amber-50/80 border border-amber-200/70 p-2.5 rounded-xl line-clamp-1 max-w-3xl leading-relaxed flex items-center">
                    <Lightbulb className="w-3.5 h-3.5 mr-1.5 text-amber-600 shrink-0" />
                    <span>
                      <strong className="text-amber-800">Placed Senior Advice:</strong>{' '}
                      {exp.advice.split('\n')[0]}
                    </span>
                  </div>
                )}
              </div>

              {/* Right CTA */}
              <div className="shrink-0 flex md:flex-col items-center md:items-end justify-between gap-3 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                <div className="flex items-center text-xs text-slate-500">
                  <ThumbsUp className="w-3.5 h-3.5 mr-1 text-blue-500" />
                  <span>{exp.helpfulCount || 0} helpful votes</span>
                </div>

                <Link
                  to={`/experiences/${exp._id}`}
                  className="px-4 py-2 bg-brand-blue hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center space-x-1.5"
                >
                  <span>Read Full Rounds</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
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
