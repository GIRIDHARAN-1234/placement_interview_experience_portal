import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Search, Filter, ArrowRight, FileText, HelpCircle, X } from 'lucide-react';
import api from '../../services/api';
import { CardSkeleton, LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';

export const CompanyDirectory = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [industry, setIndustry] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const industries = [
    'All',
    'Software / IT',
    'E-commerce & Cloud',
    'IT Services & Consulting',
    'AI & Data Analytics',
    'FinTech',
  ];

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 9 });
      if (search.trim()) params.append('search', search.trim());
      if (industry !== 'All') params.append('industry', industry);

      const res = await api.get(`/companies?${params.toString()}`);
      if (res.data.success) {
        setCompanies(res.data.data);
        setTotalPages(res.data.pages || 1);
        setTotalCount(res.data.total || 0);
      }
    } catch (err) {
      console.error('Failed to load companies', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [page, industry]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCompanies();
  };

  const handleClearFilters = () => {
    setSearch('');
    setIndustry('All');
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Company Directory</h1>
        <p className="text-sm text-slate-500 mt-1">
          Explore campus recruiters, their hiring workflows, interview experiences, and practice questions.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:space-x-4">
        {/* Search input */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by company name, job roles, or technologies..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </form>

        {/* Industry Filter dropdown */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 shrink-0 font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span>Industry:</span>
          </div>
          <select
            value={industry}
            onChange={(e) => {
              setIndustry(e.target.value);
              setPage(1);
            }}
            className="border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            {industries.map((ind) => (
              <option key={ind} value={ind}>
                {ind}
              </option>
            ))}
          </select>

          {(search || industry !== 'All') && (
            <button
              onClick={handleClearFilters}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
              title="Clear filters"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="text-xs text-slate-500 font-medium">
        Showing <span className="font-bold text-slate-800">{companies.length}</span> of{' '}
        <span className="font-bold text-slate-800">{totalCount}</span> companies
      </div>

      {/* Grid List */}
      {loading ? (
        <CardSkeleton count={6} />
      ) : companies.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No companies match your filters"
          description="Try modifying your keyword search or resetting the industry dropdown filter."
          actionText="Clear All Filters"
          onAction={handleClearFilters}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => (
            <div
              key={company._id}
              className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-card-hover hover:border-blue-300 transition flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3.5">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center font-bold text-slate-800 text-sm shadow-inner">
                      {company.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 leading-tight">
                        {company.name}
                      </h3>
                      <span className="text-xs text-slate-500">{company.industry}</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 mt-4 line-clamp-3 leading-relaxed">
                  {company.description}
                </p>

                {/* Job Roles */}
                <div className="mt-4">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Job Roles
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {company.jobRoles?.slice(0, 3).map((role, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700"
                      >
                        {role}
                      </span>
                    ))}
                    {company.jobRoles?.length > 3 && (
                      <span className="text-[11px] text-slate-400 self-center">
                        +{company.jobRoles.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Skills tags */}
                {company.skills?.length > 0 && (
                  <div className="mt-3">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Key Skills
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {company.skills?.slice(0, 4).map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-blue-50 text-brand-blue"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom stats & link */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-3 text-xs text-slate-500">
                  <span className="flex items-center" title="Approved Experiences">
                    <FileText className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                    {company.approvedExperiencesCount || 0}
                  </span>
                  <span className="flex items-center" title="Practice Questions">
                    <HelpCircle className="w-3.5 h-3.5 mr-1 text-blue-500" />
                    {company.questionsCount || 0}
                  </span>
                </div>

                <Link
                  to={`/companies/${company.slug || company._id}`}
                  className="inline-flex items-center text-xs font-bold text-brand-blue hover:text-blue-700 transition space-x-1"
                >
                  <span>View Details</span>
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
