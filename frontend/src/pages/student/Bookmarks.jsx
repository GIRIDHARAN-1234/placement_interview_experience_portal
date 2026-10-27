import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bookmark,
  HelpCircle,
  FileText,
  BookOpen,
  Building2,
  Trash2,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import api from '../../services/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import toast from 'react-hot-toast';

export const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');

  const fetchBookmarks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/bookmarks');
      if (res.data.success) {
        setBookmarks(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load bookmarks', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const handleRemove = async (itemType, itemId) => {
    try {
      const res = await api.post('/bookmarks/toggle', { itemType, itemId });
      if (res.data.success) {
        setBookmarks((prev) =>
          prev.filter((b) => !(b.itemType === itemType && b.itemId.toString() === itemId.toString()))
        );
        toast.success('Removed from bookmarks');
      }
    } catch (err) {
      toast.error('Failed to remove bookmark');
    }
  };

  const filteredBookmarks =
    activeTab === 'All' ? bookmarks : bookmarks.filter((b) => b.itemType === activeTab);

  if (loading) {
    return <LoadingSpinner text="Loading your saved bookmarks..." size="lg" />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Bookmarks</h1>
        <p className="text-sm text-slate-500 mt-1">
          Quickly review challenging questions, top interview reports, and revision guides.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
        {['All', 'question', 'experience', 'resource', 'company'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition capitalize ${
              activeTab === tab
                ? 'bg-navy-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab === 'All' ? 'All Items' : `${tab}s`}
          </button>
        ))}
      </div>

      {/* Bookmarks List */}
      {filteredBookmarks.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No bookmarks saved yet"
          description="Bookmark important questions, company guides, and senior experiences while exploring."
          actionText="Browse Questions"
          actionLink="/questions"
        />
      ) : (
        <div className="space-y-4">
          {filteredBookmarks.map((b) => {
            const item = b.item;
            if (!item) return null;

            return (
              <div
                key={b._id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-slate-300 transition flex items-center justify-between gap-4"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center space-x-2 text-xs">
                    <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] bg-slate-100 px-2 py-0.5 rounded">
                      {b.itemType}
                    </span>
                    {item.category && (
                      <span className="text-slate-400 font-medium">{item.category}</span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 line-clamp-1">
                    {item.title || item.name || `${item.companyId?.name} — ${item.jobRole}`}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-1">
                    {item.questionText || item.description || item.preparationStrategy}
                  </p>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => handleRemove(b.itemType, b.itemId)}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-50 transition"
                    title="Remove Bookmark"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  {/* Direct Link based on item type */}
                  {b.itemType === 'question' && (
                    <Link
                      to={`/questions/${item._id}`}
                      className="p-2 text-brand-blue hover:bg-blue-50 rounded-lg transition"
                      title="Open Question"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                  {b.itemType === 'experience' && (
                    <Link
                      to={`/experiences/${item._id}`}
                      className="p-2 text-brand-blue hover:bg-blue-50 rounded-lg transition"
                      title="Open Experience"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                  {b.itemType === 'company' && (
                    <Link
                      to={`/companies/${item.slug || item._id}`}
                      className="p-2 text-brand-blue hover:bg-blue-50 rounded-lg transition"
                      title="Open Company Profile"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                  {b.itemType === 'resource' && item.resourceUrl && (
                    <a
                      href={item.resourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 text-brand-blue hover:bg-blue-50 rounded-lg transition"
                      title="Open Resource URL"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
