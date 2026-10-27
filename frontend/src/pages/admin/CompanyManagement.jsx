import React, { useState, useEffect } from 'react';
import { Building2, Plus, Edit2, Search, ExternalLink } from 'lucide-react';
import api from '../../services/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Modal } from '../../components/common/Modal';
import { StatusBadge } from '../../components/common/Badge';
import toast from 'react-hot-toast';

export const CompanyManagement = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [industry, setIndustry] = useState('Software / IT');
  const [jobRoles, setJobRoles] = useState('');
  const [skills, setSkills] = useState('');
  const [website, setWebsite] = useState('');

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await api.get('/companies?limit=100');
      if (res.data.success) {
        setCompanies(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load companies', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleOpenAdd = () => {
    setEditingCompany(null);
    setName('');
    setDescription('');
    setIndustry('Software / IT');
    setJobRoles('');
    setSkills('');
    setWebsite('');
    setModalOpen(true);
  };

  const handleOpenEdit = (comp) => {
    setEditingCompany(comp);
    setName(comp.name);
    setDescription(comp.description);
    setIndustry(comp.industry);
    setJobRoles(comp.jobRoles?.join(', ') || '');
    setSkills(comp.skills?.join(', ') || '');
    setWebsite(comp.website || '');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      name: name.trim(),
      description: description.trim(),
      industry: industry.trim(),
      jobRoles: jobRoles.split(',').map((s) => s.trim()).filter(Boolean),
      skills: skills.split(',').map((s) => s.trim()).filter(Boolean),
      website: website.trim(),
    };

    try {
      if (editingCompany) {
        const res = await api.put(`/admin/companies/${editingCompany._id}`, payload);
        if (res.data.success) {
          toast.success('Company updated successfully!');
          fetchCompanies();
          setModalOpen(false);
        }
      } else {
        const res = await api.post('/admin/companies', payload);
        if (res.data.success) {
          toast.success('Company created successfully!');
          fetchCompanies();
          setModalOpen(false);
        }
      }
    } catch (err) {
      toast.error(err.friendlyMessage || 'Failed to save company');
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
            Company Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Maintain campus recruitment partner profiles, eligible roles, and expected skills.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-brand-blue hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Company</span>
        </button>
      </div>

      {/* Companies Table */}
      {loading ? (
        <LoadingSpinner text="Loading companies..." size="lg" />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
              <thead className="bg-slate-50/75 text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Company</th>
                  <th className="px-6 py-4">Industry</th>
                  <th className="px-6 py-4">Job Roles</th>
                  <th className="px-6 py-4">Skills</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {companies.map((comp) => (
                  <tr key={comp._id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{comp.name}</div>
                      {comp.website && (
                        <a
                          href={comp.website}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-brand-blue hover:underline flex items-center mt-0.5"
                        >
                          <span>{comp.website.replace('https://', '')}</span>
                          <ExternalLink className="w-2.5 h-2.5 ml-1" />
                        </a>
                      )}
                    </td>
                    <td className="px-6 py-4">{comp.industry}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {comp.jobRoles?.map((r, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px]"
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {comp.skills?.slice(0, 3).map((s, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded bg-blue-50 text-brand-blue text-[10px]"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={comp.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleOpenEdit(comp)}
                        className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-700 text-xs font-bold transition inline-flex items-center space-x-1"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Company Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCompany ? 'Edit Company Profile' : 'Add New Company'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Company Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Google, Microsoft, Zoho"
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Industry
            </label>
            <input
              type="text"
              required
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="e.g. Software / IT, FinTech, E-commerce"
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
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
              placeholder="Overview of company technology domain and recruitment highlights..."
              className="w-full border border-slate-200 rounded-xl p-3 text-xs leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Job Roles (Comma separated)
            </label>
            <input
              type="text"
              required
              value={jobRoles}
              onChange={(e) => setJobRoles(e.target.value)}
              placeholder="e.g. Software Engineer, SDE 1, Data Analyst"
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Skills (Comma separated)
            </label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="e.g. Data Structures, Java, Python, SQL"
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Careers Website URL
            </label>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://careers.google.com"
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs"
            />
          </div>

          <div className="pt-2 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-brand-blue hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
            >
              {submitting ? 'Saving...' : editingCompany ? 'Save Changes' : 'Create Company'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
