import React, { useState, useEffect } from 'react';
import { Search, Building2, HelpCircle, BookOpen, FileText, ArrowRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export const GlobalSearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ companies: [], questions: [], resources: [], experiences: [] });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Listen for Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        onClose(false); // toggle
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Search when query changes
  useEffect(() => {
    if (!query.trim()) {
      setResults({ companies: [], questions: [], resources: [], experiences: [] });
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setLoading(true);
      try {
        const [cRes, qRes, rRes, eRes] = await Promise.all([
          api.get(`/companies?search=${encodeURIComponent(query)}&limit=3`),
          api.get(`/questions?search=${encodeURIComponent(query)}&limit=3`),
          api.get(`/resources?search=${encodeURIComponent(query)}&limit=3`),
          api.get(`/experiences?search=${encodeURIComponent(query)}&limit=3`),
        ]);

        setResults({
          companies: cRes.data.data || [],
          questions: qRes.data.data || [],
          resources: rRes.data.data || [],
          experiences: eRes.data.data || [],
        });
      } catch (err) {
        // search error
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  if (!isOpen) return null;

  const handleSelect = (url) => {
    onClose();
    navigate(url);
  };

  const hasAnyResults =
    results.companies.length > 0 ||
    results.questions.length > 0 ||
    results.resources.length > 0 ||
    results.experiences.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden transform transition-all">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-slate-100 bg-white">
          <Search className="w-5 h-5 text-slate-400 mr-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search companies, technical questions, study resources, experiences..."
            className="w-full text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none text-base"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block ml-2 px-2 py-0.5 text-xs text-slate-400 bg-slate-100 border border-slate-200 rounded">
            ESC
          </kbd>
        </div>

        {/* Search Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {loading && (
            <div className="text-center py-6 text-sm text-slate-400">Searching portal index...</div>
          )}

          {!loading && query.trim() && !hasAnyResults && (
            <div className="text-center py-8 text-sm text-slate-500">
              No matching companies, questions, or resources found for "{query}".
            </div>
          )}

          {/* Companies Section */}
          {results.companies.length > 0 && (
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-3 py-1 flex items-center">
                <Building2 className="w-3.5 h-3.5 mr-1.5" /> Companies
              </div>
              <div className="mt-1 space-y-1">
                {results.companies.map((c) => (
                  <button
                    key={c._id}
                    onClick={() => handleSelect(`/companies/${c.slug || c._id}`)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 flex items-center justify-between group transition"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-700">
                        {c.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-800 group-hover:text-brand-blue">
                          {c.name}
                        </div>
                        <div className="text-xs text-slate-500">{c.industry}</div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-brand-blue transition" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Questions Section */}
          {results.questions.length > 0 && (
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-3 py-1 flex items-center">
                <HelpCircle className="w-3.5 h-3.5 mr-1.5" /> Practice Questions
              </div>
              <div className="mt-1 space-y-1">
                {results.questions.map((q) => (
                  <button
                    key={q._id}
                    onClick={() => handleSelect(`/questions/${q._id}`)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 flex items-center justify-between group transition"
                  >
                    <div>
                      <div className="text-sm font-semibold text-slate-800 group-hover:text-brand-blue line-clamp-1">
                        {q.title}
                      </div>
                      <div className="text-xs text-slate-500">
                        {q.category} • <span className="font-medium">{q.difficulty}</span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-brand-blue transition" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Resources Section */}
          {results.resources.length > 0 && (
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-3 py-1 flex items-center">
                <BookOpen className="w-3.5 h-3.5 mr-1.5" /> Study Resources
              </div>
              <div className="mt-1 space-y-1">
                {results.resources.map((r) => (
                  <button
                    key={r._id}
                    onClick={() => handleSelect(`/resources`)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 flex items-center justify-between group transition"
                  >
                    <div>
                      <div className="text-sm font-semibold text-slate-800 group-hover:text-brand-blue line-clamp-1">
                        {r.title}
                      </div>
                      <div className="text-xs text-slate-500">{r.category}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-brand-blue transition" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Experiences Section */}
          {results.experiences.length > 0 && (
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-3 py-1 flex items-center">
                <FileText className="w-3.5 h-3.5 mr-1.5" /> Approved Interview Experiences
              </div>
              <div className="mt-1 space-y-1">
                {results.experiences.map((e) => (
                  <button
                    key={e._id}
                    onClick={() => handleSelect(`/experiences/${e._id}`)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 flex items-center justify-between group transition"
                  >
                    <div>
                      <div className="text-sm font-semibold text-slate-800 group-hover:text-brand-blue">
                        {e.companyId?.name} — {e.jobRole}
                      </div>
                      <div className="text-xs text-slate-500">{e.difficulty} Difficulty</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-brand-blue transition" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="bg-slate-50 px-4 py-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span>Search verified experiences, questions & companies</span>
          <div className="flex items-center space-x-2">
            <span>Press</span>
            <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-600 font-mono">
              ESC
            </kbd>
            <span>to close</span>
          </div>
        </div>
      </div>
    </div>
  );
};
