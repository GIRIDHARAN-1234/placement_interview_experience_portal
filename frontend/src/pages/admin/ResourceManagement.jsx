import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Edit2, Trash2, ExternalLink, Search, Filter } from 'lucide-react';
import api from '../../services/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import toast from 'react-hot-toast';

export const ResourceManagement = () => {
  const [resources, setResources] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCompany, setSelectedCompany] = useState('All');

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Company preparation guides');
  const [companyId, setCompanyId] = useState('');
  const [resourceType, setResourceType] = useState('guide');
  const [resourceUrl, setResourceUrl] = useState('');

  const categories = [
    'Company preparation guides',
    'Aptitude notes',
    'Coding practice',
    'Technical interview notes',
    'HR interview preparation',
    'Resume preparation',
    'Subject-wise revision notes',
  ];

  const fetchResources = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: 100 });
      if (search.trim()) params.append('search', search.trim());
      if (selectedCategory !== 'All') params.append('category', selectedCategory);
      if (selectedCompany !== 'All') params.append('companyId', selectedCompany);

      const [rRes, cRes] = await Promise.all([
        api.get(`/resources?${params.toString()}`),
        api.get('/companies?limit=100'),
      ]);
      if (rRes.data.success) setResources(rRes.data.data || []);
      if (cRes.data.success) setCompanies(cRes.data.data || []);
    } catch (err) {
      console.error('Failed to load study resources', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [selectedCategory, selectedCompany]);

  const handleOpenAdd = () => {
    setEditingResource(null);
    setTitle('');
    setDescription('');
    setCategory('Company preparation guides');
    setCompanyId('');
    setResourceType('guide');
    setResourceUrl('');
    setModalOpen(true);
  };

  const handleOpenEdit = (res) => {
    setEditingResource(res);
    setTitle(res.title);
    setDescription(res.description);
    setCategory(res.category);
    setCompanyId(res.companyId?._id || res.companyId || '');
    setResourceType(res.resourceType);
    setResourceUrl(res.resourceUrl || '');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      companyId: companyId || null,
      resourceType,
      resourceUrl: resourceUrl.trim(),
      status: 'published',
    };

    try {
      if (editingResource) {
        const res = await api.put(`/admin/resources/${editingResource._id}`, payload);
        if (res.data.success) {
          toast.success('Resource updated successfully!');
          fetchResources();
          setModalOpen(false);
        }
      } else {
        const res = await api.post('/admin/resources', payload);
        if (res.data.success) {
          toast.success('Resource added to library!');
          fetchResources();
          setModalOpen(false);
        }
      }
    } catch (err) {
      toast.error(err.friendlyMessage || 'Failed to save resource');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!resourceToDelete) return;
    setSubmitting(true);
    try {
      const res = await api.delete(`/admin/resources/${resourceToDelete._id}`);
      if (res.data.success) {
        toast.success('Resource deleted');
        fetchResources();
        setDeleteConfirmOpen(false);
      }
    } catch (err) {
      toast.error('Failed to delete resource');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Study Resource Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Publish preparation guidelines, aptitude notes, formula sheets, and resume templates.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-brand-blue hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Study Resource</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-4 md:space-y-0 md:flex md:items-center md:justify-between md:space-x-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchResources();
          }}
          className="relative flex-1"
        >
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search study resources, notes, guides..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 bg-white"
          >
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 bg-white"
          >
            <option value="All">All Companies</option>
            {companies.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          {(search || selectedCategory !== 'All' || selectedCompany !== 'All') && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedCategory('All');
                setSelectedCompany('All');
              }}
              className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 font-semibold"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner text="Loading study resources..." size="lg" />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
              <thead className="bg-slate-50/75 text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Format</th>
                  <th className="px-6 py-4">Target Company</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {resources.map((res) => (
                  <tr key={res._id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 max-w-sm truncate">{res.title}</div>
                      <div className="text-[11px] text-slate-400 max-w-xs truncate">
                        {res.description}
                      </div>
                    </td>
                    <td className="px-6 py-4">{res.category}</td>
                    <td className="px-6 py-4 uppercase font-bold text-[10px] text-brand-blue">
                      {res.resourceType}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {res.companyId?.name || 'All Companies'}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(res)}
                        className="p-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-700 transition"
                        title="Edit Resource"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setResourceToDelete(res);
                          setDeleteConfirmOpen(true);
                        }}
                        className="p-1.5 border border-slate-200 hover:bg-rose-50 text-rose-600 rounded-lg transition"
                        title="Delete Resource"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingResource ? 'Edit Study Resource' : 'Add Study Resource'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Striver SDE Sheet"
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium bg-white"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Resource Format
              </label>
              <select
                value={resourceType}
                onChange={(e) => setResourceType(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium bg-white"
              >
                <option value="guide">Guide</option>
                <option value="article">Article</option>
                <option value="pdf">PDF Document</option>
                <option value="video">Video Playlist</option>
                <option value="link">Web Link</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Target Company (Optional)
            </label>
            <select
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium bg-white"
            >
              <option value="">General Placement Prep</option>
              {companies.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Summary of contents..."
              className="w-full border border-slate-200 rounded-xl p-3 text-xs leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              External Resource URL
            </label>
            <input
              type="url"
              value={resourceUrl}
              onChange={(e) => setResourceUrl(e.target.value)}
              placeholder="https://..."
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs"
            />
          </div>

          <div className="pt-2 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-brand-blue hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
            >
              {submitting ? 'Saving...' : editingResource ? 'Save Changes' : 'Create Resource'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Study Resource"
        message={`Are you sure you want to permanently delete "${resourceToDelete?.title}"?`}
        confirmText="Delete Resource"
        danger={true}
        loading={submitting}
      />
    </div>
  );
};
