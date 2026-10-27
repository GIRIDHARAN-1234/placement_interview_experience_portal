import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  BookOpen,
  Search,
  ExternalLink,
  Bookmark,
  FileText,
  Video,
  Download,
  Filter,
  X,
  Building2,
} from 'lucide-react';
import api from '../../services/api';
import { LoadingSpinner, CardSkeleton } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export const ResourceList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCompany = searchParams.get('companyId') || 'All';

  const { isAuthenticated } = useAuth();
  const [resources, setResources] = useState([]);
  const [categories, setCategories] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCompany, setSelectedCompany] = useState(initialCompany);
  const [selectedType, setSelectedType] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const resourceTypes = ['All', 'article', 'guide', 'pdf', 'video', 'link'];

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catRes, compRes] = await Promise.all([
          api.get('/resources/categories'),
          api.get('/companies?limit=100'),
        ]);
        if (catRes.data.success) {
          setCategories(catRes.data.data || []);
        }
        if (compRes.data.success) {
          setCompanies(compRes.data.data || []);
        }
      } catch (err) {
        console.error('Failed to load categories or companies', err);
      }
    };
    fetchMetadata();
  }, []);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 12 });
      if (search.trim()) params.append('search', search.trim());
      if (selectedCategory !== 'All') params.append('category', selectedCategory);
      if (selectedCompany !== 'All') params.append('companyId', selectedCompany);
      if (selectedType !== 'All') params.append('resourceType', selectedType);

      const res = await api.get(`/resources?${params.toString()}`);
      if (res.data.success) {
        setResources(res.data.data);
        setTotalPages(res.data.pages || 1);
        setTotalCount(res.data.total || 0);
      }
    } catch (err) {
      console.error('Failed to load resources', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [page, selectedCategory, selectedCompany, selectedType]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchResources();
  };

  const handleBookmark = async (resourceId) => {
    if (!isAuthenticated) {
      toast.error('Log in to bookmark study resources!');
      return;
    }

    try {
      const res = await api.post('/bookmarks/toggle', {
        itemType: 'resource',
        itemId: resourceId,
      });
      if (res.data.success) {
        toast.success(res.data.message);
      }
    } catch (err) {
      toast.error('Failed to bookmark resource');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Study Resources Library
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          High-yield placement notes, aptitude formula sheets, company interview roadmaps, and resume templates.
        </p>
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
          All Categories ({totalCount})
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

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-4 md:space-y-0 md:flex md:items-center md:justify-between md:space-x-4">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search study guides, notes, formulas, cheat sheets..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2">
          {/* Company Filter Selector */}
          <select
            value={selectedCompany}
            onChange={(e) => {
              setSelectedCompany(e.target.value);
              setPage(1);
            }}
            className="border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 bg-white"
          >
            <option value="All">All Companies</option>
            {companies.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Resource Format Selector */}
          <select
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value);
              setPage(1);
            }}
            className="border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 bg-white"
          >
            {resourceTypes.map((t) => (
              <option key={t} value={t}>
                {t === 'All' ? 'All Formats' : t.toUpperCase()}
              </option>
            ))}
          </select>

          {(search || selectedCategory !== 'All' || selectedCompany !== 'All' || selectedType !== 'All') && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedCategory('All');
                setSelectedCompany('All');
                setSelectedType('All');
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

      {/* Grid List */}
      {loading ? (
        <CardSkeleton count={6} />
      ) : resources.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No study resources found"
          description="Try broadening your search keywords or resetting company and category filters."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((res) => (
            <div
              key={res._id}
              className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-card-hover hover:border-blue-300 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md">
                    {res.category}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-50 text-brand-blue border border-blue-100">
                    {res.resourceType}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-2">
                  {res.title}
                </h3>

                <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                  {res.description}
                </p>

                {res.companyId?.name && (
                  <div className="mt-3">
                    <Link
                      to={`/companies/${res.companyId.slug || res.companyId._id}`}
                      className="inline-flex items-center space-x-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition"
                    >
                      <Building2 className="w-3.5 h-3.5 text-blue-500" />
                      <span>Company: {res.companyId.name}</span>
                    </Link>
                  </div>
                )}

                {res.topicTags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {res.topicTags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => handleBookmark(res._id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-slate-50 transition"
                  title="Bookmark Resource"
                >
                  <Bookmark className="w-4 h-4" />
                </button>

                {res.resourceUrl ? (
                  <a
                    href={res.resourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1.5 text-xs font-bold text-brand-blue hover:text-blue-700 transition"
                  >
                    <span>Open Resource</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <span className="text-xs text-slate-400 font-medium">Library Material</span>
                )}
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
