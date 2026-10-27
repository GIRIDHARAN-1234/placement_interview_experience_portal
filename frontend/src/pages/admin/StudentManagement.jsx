import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  ArrowRight,
  X,
  ShieldCheck,
  Award,
  Building2,
  Sparkles,
} from 'lucide-react';
import api from '../../services/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { StatusBadge, PlacementVerifiedBadge } from '../../components/common/Badge';
import toast from 'react-hot-toast';

export const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');
  const [graduationYear, setGraduationYear] = useState('All');
  const [status, setStatus] = useState('All');
  const [verificationFilter, setVerificationFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const departments = [
    'All',
    'Computer Science & Engineering',
    'Information Technology',
    'Electronics & Communication Engineering',
    'Electrical & Electronics Engineering',
    'Mechanical Engineering',
  ];

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (search.trim()) params.append('search', search.trim());
      if (department !== 'All') params.append('department', department);
      if (graduationYear !== 'All') params.append('graduationYear', graduationYear);
      if (status !== 'All') params.append('status', status);
      if (verificationFilter !== 'All') params.append('verificationStatus', verificationFilter);

      const res = await api.get(`/admin/students?${params.toString()}`);
      if (res.data.success) {
        setStudents(res.data.data);
        setTotalPages(res.data.pages || 1);
        setTotalCount(res.data.total || 0);
      }
    } catch (err) {
      console.error('Failed to load students', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [page, department, graduationYear, status, verificationFilter]);

  const handleToggleStatus = async (student) => {
    const nextStatus = student.accountStatus === 'active' ? 'inactive' : 'active';
    try {
      const res = await api.put(`/admin/students/${student._id}/status`, { status: nextStatus });
      if (res.data.success) {
        setStudents(students.map((s) => (s._id === student._id ? { ...s, accountStatus: nextStatus } : s)));
        toast.success(res.data.message);
      }
    } catch (err) {
      toast.error('Failed to update student status');
    }
  };

  const handleToggleVerification = async (student) => {
    try {
      const res = await api.put(`/admin/students/${student._id}/verify`);
      if (res.data.success) {
        setStudents(
          students.map((s) =>
            s._id === student._id ? { ...s, isPlacementVerified: res.data.data.isPlacementVerified } : s
          )
        );
        toast.success(res.data.message);
      }
    } catch (err) {
      toast.error('Failed to update placement verification badge');
    }
  };

  const verifiedStudentsCount = students.filter((s) => s.isPlacementVerified).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Student Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Review registered college students, verify placement achievements, and manage account statuses.
          </p>
        </div>
      </div>

      {/* Metric summary strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center space-x-3.5 shadow-xs">
          <div className="p-2.5 rounded-xl bg-blue-50 text-brand-blue">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900">{totalCount}</div>
            <div className="text-xs text-slate-500">Registered Students</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center space-x-3.5 shadow-xs">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-emerald-700">{verifiedStudentsCount} (on page)</div>
            <div className="text-xs text-slate-500">Placement Verified</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center space-x-3.5 shadow-xs">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900">
              {students.filter((s) => s.accountStatus === 'active').length} Active
            </div>
            <div className="text-xs text-slate-500">Active Accounts</div>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-4 md:space-y-0 md:flex md:items-center md:justify-between md:space-x-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            fetchStudents();
          }}
          className="relative flex-1"
        >
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name, register number, or email..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={department}
            onChange={(e) => {
              setDepartment(e.target.value);
              setPage(1);
            }}
            className="border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 bg-white"
          >
            {departments.map((d) => (
              <option key={d} value={d}>
                {d === 'All' ? 'All Departments' : d}
              </option>
            ))}
          </select>

          <select
            value={verificationFilter}
            onChange={(e) => {
              setVerificationFilter(e.target.value);
              setPage(1);
            }}
            className="border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 bg-white"
          >
            <option value="All">All Verification</option>
            <option value="verified">Verified Only</option>
            <option value="unverified">Unverified Only</option>
          </select>

          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 bg-white"
          >
            <option value="All">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Students Table */}
      {loading ? (
        <LoadingSpinner text="Loading student records..." size="lg" />
      ) : students.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-xs text-slate-400">
          No students found matching current filters.
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
              <thead className="bg-slate-50/75 text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Register Number</th>
                  <th className="px-6 py-4">Department & Batch</th>
                  <th className="px-6 py-4">Placement Status</th>
                  <th className="px-6 py-4">Account</th>
                  <th className="px-6 py-4 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {students.map((student) => (
                  <tr key={student._id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-bold text-slate-900">{student.name}</div>
                        <div className="text-[11px] text-slate-400">{student.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-slate-800">
                      {student.registerNumber}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">{student.department}</div>
                      <div className="text-[11px] text-slate-400">Class of {student.graduationYear}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <PlacementVerifiedBadge verified={student.isPlacementVerified} />
                        {student.verifiedCompanies?.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {student.verifiedCompanies.map((c) => (
                              <span
                                key={c._id || c}
                                className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-100"
                              >
                                {c.name || 'Company'}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={student.accountStatus} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {/* Toggle Placement Verification Badge */}
                        <button
                          onClick={() => handleToggleVerification(student)}
                          title="Toggle student's Placement Verified status"
                          className={`px-2.5 py-1.5 rounded-lg font-bold text-xs transition flex items-center space-x-1 ${
                            student.isPlacementVerified
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                          }`}
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>{student.isPlacementVerified ? 'Verified' : 'Verify'}</span>
                        </button>

                        {/* Toggle Active/Inactive */}
                        <button
                          onClick={() => handleToggleStatus(student)}
                          className={`px-2.5 py-1.5 rounded-lg font-bold text-xs transition ${
                            student.accountStatus === 'active'
                              ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                              : 'bg-blue-50 text-brand-blue hover:bg-blue-100'
                          }`}
                        >
                          {student.accountStatus === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
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
    </div>
  );
};
