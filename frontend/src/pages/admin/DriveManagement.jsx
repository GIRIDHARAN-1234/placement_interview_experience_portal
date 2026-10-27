import React, { useState, useEffect } from 'react';
import { Briefcase, Plus, Edit2, Calendar, Building2 } from 'lucide-react';
import api from '../../services/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Modal } from '../../components/common/Modal';
import { StatusBadge } from '../../components/common/Badge';
import toast from 'react-hot-toast';

export const DriveManagement = () => {
  const [drives, setDrives] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDrive, setEditingDrive] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const [companyId, setCompanyId] = useState('');
  const [title, setTitle] = useState('');
  const [driveYear, setDriveYear] = useState(2026);
  const [jobRoles, setJobRoles] = useState('Software Engineer');
  const [eligibleDepartments, setEligibleDepartments] = useState(
    'Computer Science & Engineering, Information Technology'
  );
  const [status, setStatus] = useState('ongoing');

  const fetchDrivesAndCompanies = async () => {
    setLoading(true);
    try {
      const [dRes, cRes] = await Promise.all([
        api.get('/placement-drives'),
        api.get('/companies?limit=100'),
      ]);
      if (dRes.data.success) setDrives(dRes.data.data || []);
      if (cRes.data.success) {
        setCompanies(cRes.data.data || []);
        if (cRes.data.data?.length > 0 && !companyId) {
          setCompanyId(cRes.data.data[0]._id);
        }
      }
    } catch (err) {
      console.error('Failed to load placement drives', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivesAndCompanies();
  }, []);

  const handleOpenAdd = () => {
    setEditingDrive(null);
    setTitle('');
    setDriveYear(2026);
    setJobRoles('Software Engineer');
    setStatus('ongoing');
    if (companies.length > 0) setCompanyId(companies[0]._id);
    setModalOpen(true);
  };

  const handleOpenEdit = (drive) => {
    setEditingDrive(drive);
    setCompanyId(drive.companyId?._id || drive.companyId);
    setTitle(drive.title);
    setDriveYear(drive.driveYear);
    setJobRoles(drive.jobRoles?.join(', ') || '');
    setEligibleDepartments(drive.eligibleDepartments?.join(', ') || '');
    setStatus(drive.status);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      companyId,
      title: title.trim(),
      driveYear: Number(driveYear),
      jobRoles: jobRoles.split(',').map((s) => s.trim()).filter(Boolean),
      eligibleDepartments: eligibleDepartments.split(',').map((s) => s.trim()).filter(Boolean),
      status,
    };

    try {
      if (editingDrive) {
        const res = await api.put(`/admin/placement-drives/${editingDrive._id}`, payload);
        if (res.data.success) {
          toast.success('Placement drive updated successfully!');
          fetchDrivesAndCompanies();
          setModalOpen(false);
        }
      } else {
        const res = await api.post('/admin/placement-drives', payload);
        if (res.data.success) {
          toast.success('Placement drive created successfully!');
          fetchDrivesAndCompanies();
          setModalOpen(false);
        }
      }
    } catch (err) {
      toast.error(err.friendlyMessage || 'Failed to save placement drive');
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
            Placement Drive Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure campus recruitment drives, eligible departments, and academic batch years.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-brand-blue hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create Placement Drive</span>
        </button>
      </div>

      {/* Drives Table */}
      {loading ? (
        <LoadingSpinner text="Loading placement drives..." size="lg" />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
              <thead className="bg-slate-50/75 text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Drive Title</th>
                  <th className="px-6 py-4">Company</th>
                  <th className="px-6 py-4">Drive Year</th>
                  <th className="px-6 py-4">Eligible Departments</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {drives.map((drive) => (
                  <tr key={drive._id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4 font-bold text-slate-900">{drive.title}</td>
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      {drive.companyId?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-slate-700">
                      {drive.driveYear}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-600 max-w-xs line-clamp-1">
                        {drive.eligibleDepartments?.join(', ')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={drive.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleOpenEdit(drive)}
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

      {/* Add / Edit Drive Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingDrive ? 'Edit Placement Drive' : 'Create Placement Drive'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Associated Company
            </label>
            <select
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 bg-white"
            >
              {companies.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Drive Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Google Campus Hiring 2026"
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Drive Year
              </label>
              <input
                type="number"
                required
                min={2020}
                max={2035}
                value={driveYear}
                onChange={(e) => setDriveYear(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Drive Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium bg-white"
              >
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
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
              placeholder="Software Engineer, Cloud Resident"
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Eligible Departments (Comma separated)
            </label>
            <input
              type="text"
              required
              value={eligibleDepartments}
              onChange={(e) => setEligibleDepartments(e.target.value)}
              placeholder="Computer Science & Engineering, Information Technology"
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
              {submitting ? 'Saving...' : editingDrive ? 'Save Changes' : 'Create Drive'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
