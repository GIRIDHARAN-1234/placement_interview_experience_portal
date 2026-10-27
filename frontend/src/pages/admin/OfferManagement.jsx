import React, { useState, useEffect } from 'react';
import {
  Award,
  Plus,
  Upload,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  ShieldCheck,
  Edit2,
} from 'lucide-react';
import api from '../../services/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Modal } from '../../components/common/Modal';
import { StatusBadge } from '../../components/common/Badge';
import toast from 'react-hot-toast';

export const OfferManagement = () => {
  const [offers, setOffers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedCompany, setSelectedCompany] = useState('All');

  // Single Offer Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [studentRegisterNumber, setStudentRegisterNumber] = useState('');
  const [formCompanyId, setFormCompanyId] = useState('');
  const [formDriveId, setFormDriveId] = useState('');
  const [formStatus, setFormStatus] = useState('selected');
  const [formJobRole, setFormJobRole] = useState('Software Engineer');
  const [formNotes, setFormNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Status Change Modal
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [updateStatusVal, setUpdateStatusVal] = useState('selected');
  const [updateNotesVal, setUpdateNotesVal] = useState('');

  // Bulk Import Modal
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkJsonText, setBulkJsonText] = useState('');

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (selectedStatus !== 'All') params.append('status', selectedStatus);
      if (selectedCompany !== 'All') params.append('companyId', selectedCompany);

      const res = await api.get(`/placement-offers?${params.toString()}`);
      if (res.data.success) {
        setOffers(res.data.data);
        setTotalPages(res.data.pages || 1);
        setTotalCount(res.data.total || 0);
      }
    } catch (err) {
      console.error('Failed to load offers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [cRes, dRes] = await Promise.all([
          api.get('/companies?limit=50'),
          api.get('/placement-drives?limit=50'),
        ]);
        if (cRes.data.success) {
          setCompanies(cRes.data.data || []);
          if (cRes.data.data?.length > 0 && !formCompanyId) {
            setFormCompanyId(cRes.data.data[0]._id);
          }
        }
        if (dRes.data.success) {
          setDrives(dRes.data.data || []);
          if (dRes.data.data?.length > 0 && !formDriveId) {
            setFormDriveId(dRes.data.data[0]._id);
          }
        }
      } catch (err) {
        console.error('Failed to load metadata', err);
      }
    };
    fetchMetadata();
  }, []);

  useEffect(() => {
    fetchOffers();
  }, [page, selectedStatus, selectedCompany]);

  // Create single offer
  const handleCreateOffer = async (e) => {
    e.preventDefault();
    if (!studentRegisterNumber.trim()) return;

    setSubmitting(true);
    try {
      // Find student by register number first
      const studentRes = await api.get(
        `/admin/students?search=${encodeURIComponent(studentRegisterNumber.trim())}`
      );
      const student = studentRes.data.data?.find(
        (s) => s.registerNumber.toUpperCase() === studentRegisterNumber.trim().toUpperCase()
      );

      if (!student) {
        toast.error(`No student found with register number: ${studentRegisterNumber}`);
        setSubmitting(false);
        return;
      }

      const res = await api.post('/placement-offers', {
        studentId: student._id,
        companyId: formCompanyId,
        placementDriveId: formDriveId,
        status: formStatus,
        jobRole: formJobRole,
        notes: formNotes,
      });

      if (res.data.success) {
        toast.success('Placement offer recorded and verified!');
        fetchOffers();
        setCreateModalOpen(false);
        setStudentRegisterNumber('');
        setFormNotes('');
      }
    } catch (err) {
      toast.error(err.friendlyMessage || 'Failed to create placement offer.');
    } finally {
      setSubmitting(false);
    }
  };

  // Open status modal
  const handleOpenStatusModal = (offer) => {
    setSelectedOffer(offer);
    setUpdateStatusVal(offer.status);
    setUpdateNotesVal(offer.notes || '');
    setStatusModalOpen(true);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedOffer) return;

    setSubmitting(true);
    try {
      const res = await api.put(`/placement-offers/${selectedOffer._id}/status`, {
        status: updateStatusVal,
        notes: updateNotesVal,
      });

      if (res.data.success) {
        toast.success(res.data.message);
        fetchOffers();
        setStatusModalOpen(false);
      }
    } catch (err) {
      toast.error(err.friendlyMessage || 'Failed to update offer status.');
    } finally {
      setSubmitting(false);
    }
  };

  // Bulk import
  const handleBulkImport = async (e) => {
    e.preventDefault();
    try {
      const parsed = JSON.parse(bulkJsonText);
      if (!Array.isArray(parsed)) {
        toast.error('Input must be a JSON array of placement offer objects.');
        return;
      }

      setSubmitting(true);
      const res = await api.post('/placement-offers/bulk', { offers: parsed });
      if (res.data.success) {
        toast.success(res.data.message);
        fetchOffers();
        setBulkModalOpen(false);
        setBulkJsonText('');
      }
    } catch (err) {
      toast.error(err.friendlyMessage || 'Invalid JSON format.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200 mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Experience Submission Verification Controller</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Placement Offer Records
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage verified student selection outcomes. Marking an offer as "Selected" grants that
            student the authorization to submit an interview experience for the company.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => setBulkModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition"
          >
            <Upload className="w-4 h-4" />
            <span>Bulk Import</span>
          </button>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-brand-blue hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Record Placement Offer</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-wrap items-center gap-3">
        <div className="flex items-center space-x-2 text-xs font-medium text-slate-600">
          <Filter className="w-4 h-4 text-slate-400" />
          <span>Filter:</span>
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => {
            setSelectedStatus(e.target.value);
            setPage(1);
          }}
          className="border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium bg-white"
        >
          <option value="All">All Offer Statuses</option>
          <option value="selected">Selected (Authorized)</option>
          <option value="rejected">Rejected (Not Authorized)</option>
          <option value="pending">Pending Evaluation</option>
        </select>

        <select
          value={selectedCompany}
          onChange={(e) => {
            setSelectedCompany(e.target.value);
            setPage(1);
          }}
          className="border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium bg-white"
        >
          <option value="All">All Companies</option>
          {companies.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Offers Table */}
      {loading ? (
        <LoadingSpinner text="Loading placement offers..." size="lg" />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
              <thead className="bg-slate-50/75 text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Company</th>
                  <th className="px-6 py-4">Drive</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Outcome Status</th>
                  <th className="px-6 py-4">Verification Notes</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {offers.map((offer) => (
                  <tr key={offer._id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{offer.studentId?.name}</div>
                      <div className="text-[11px] font-mono text-slate-500">
                        {offer.studentId?.registerNumber} ({offer.studentId?.department})
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {offer.companyId?.name}
                    </td>
                    <td className="px-6 py-4">{offer.placementDriveId?.title}</td>
                    <td className="px-6 py-4 font-semibold text-slate-800">{offer.jobRole}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={offer.status} />
                    </td>
                    <td className="px-6 py-4 max-w-xs text-slate-500 truncate">
                      {offer.notes || '—'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleOpenStatusModal(offer)}
                        className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-700 text-xs font-bold transition inline-flex items-center space-x-1"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Update</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 pt-4">
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

      {/* Record Offer Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Record Placement Offer"
      >
        <form onSubmit={handleCreateOffer} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Student Register Number
            </label>
            <input
              type="text"
              required
              value={studentRegisterNumber}
              onChange={(e) => setStudentRegisterNumber(e.target.value)}
              placeholder="e.g. 710021104001"
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm uppercase font-mono font-bold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Company
              </label>
              <select
                value={formCompanyId}
                onChange={(e) => setFormCompanyId(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold bg-white"
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
                Placement Drive
              </label>
              <select
                value={formDriveId}
                onChange={(e) => setFormDriveId(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold bg-white"
              >
                {drives.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.title} ({d.driveYear})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Selection Status
              </label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold bg-white"
              >
                <option value="selected">Selected (Authorizes Experience Submission)</option>
                <option value="rejected">Rejected (Not Selected)</option>
                <option value="pending">Pending Evaluation</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Job Role
              </label>
              <input
                type="text"
                required
                value={formJobRole}
                onChange={(e) => setFormJobRole(e.target.value)}
                placeholder="Software Engineer"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Verification Notes
            </label>
            <textarea
              rows={2}
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              placeholder="e.g. Offer letter verified by placement directorate."
              className="w-full border border-slate-200 rounded-xl p-2.5 text-xs"
            />
          </div>

          <div className="pt-2 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-brand-blue hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
            >
              {submitting ? 'Recording...' : 'Record Offer'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Update Status Modal */}
      <Modal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title="Update Offer Status"
      >
        <form onSubmit={handleUpdateStatus} className="space-y-4">
          <p className="text-xs text-slate-600">
            Updating offer status for{' '}
            <span className="font-bold text-slate-900">{selectedOffer?.studentId?.name}</span> (
            {selectedOffer?.companyId?.name}).
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Status
            </label>
            <select
              value={updateStatusVal}
              onChange={(e) => setUpdateStatusVal(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold bg-white"
            >
              <option value="selected">Selected (Authorizes Experience Submission)</option>
              <option value="rejected">Rejected (Not Selected)</option>
              <option value="pending">Pending Evaluation</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Audit Notes
            </label>
            <textarea
              rows={2}
              value={updateNotesVal}
              onChange={(e) => setUpdateNotesVal(e.target.value)}
              placeholder="Add reason for status modification..."
              className="w-full border border-slate-200 rounded-xl p-2.5 text-xs"
            />
          </div>

          <div className="pt-2 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setStatusModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-brand-blue hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
            >
              {submitting ? 'Updating...' : 'Save Status'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Bulk Import Modal */}
      <Modal
        isOpen={bulkModalOpen}
        onClose={() => setBulkModalOpen(false)}
        title="Bulk Import Placement Offers"
      >
        <form onSubmit={handleBulkImport} className="space-y-4">
          <p className="text-xs text-slate-500">
            Paste a JSON array of placement offer objects. Each row must contain{' '}
            <code className="text-brand-blue">registerNumber</code>,{' '}
            <code className="text-brand-blue">companyId</code>,{' '}
            <code className="text-brand-blue">placementDriveId</code>, and{' '}
            <code className="text-brand-blue">status</code>.
          </p>

          <textarea
            rows={8}
            required
            value={bulkJsonText}
            onChange={(e) => setBulkJsonText(e.target.value)}
            placeholder={`[\n  {\n    "registerNumber": "710021104001",\n    "companyId": "${companies[0]?._id || ''}",\n    "placementDriveId": "${drives[0]?._id || ''}",\n    "status": "selected",\n    "jobRole": "Software Engineer"\n  }\n]`}
            className="w-full border border-slate-200 rounded-xl p-3 text-xs font-mono"
          />

          <div className="pt-2 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setBulkModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-brand-blue hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
            >
              {submitting ? 'Importing...' : 'Execute Import'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
