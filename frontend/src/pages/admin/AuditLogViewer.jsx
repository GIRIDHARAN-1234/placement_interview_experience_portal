import React, { useState, useEffect } from 'react';
import { History, Search, Filter, ShieldCheck } from 'lucide-react';
import api from '../../services/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const AuditLogViewer = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('All');
  const [entityFilter, setEntityFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const actions = [
    'All',
    'OFFER_CREATED',
    'OFFER_STATUS_UPDATED',
    'OFFERS_BULK_IMPORTED',
    'EXPERIENCE_APPROVED',
    'EXPERIENCE_REJECTED',
    'STUDENT_STATUS_TOGGLED',
    'COMPANY_CREATED',
    'DRIVE_CREATED',
    'SYSTEM_SEEDED',
  ];

  const entityTypes = [
    'All',
    'PlacementOffer',
    'InterviewExperience',
    'User',
    'PlacementDrive',
    'Company',
  ];

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (actionFilter !== 'All') params.append('action', actionFilter);
      if (entityFilter !== 'All') params.append('entityType', entityFilter);

      const res = await api.get(`/admin/audit-logs?${params.toString()}`);
      if (res.data.success) {
        setLogs(res.data.data || []);
        setTotalPages(res.data.pages || 1);
        setTotalCount(res.data.total || 0);
      }
    } catch (err) {
      console.error('Failed to load audit logs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, actionFilter, entityFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Audit Log Viewer</h1>
        <p className="text-sm text-slate-500 mt-1">
          Immutable historical trail of administrator actions, offer verifications, and moderation decisions.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-wrap items-center gap-3">
        <select
          value={actionFilter}
          onChange={(e) => {
            setActionFilter(e.target.value);
            setPage(1);
          }}
          className="border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium bg-white"
        >
          {actions.map((a) => (
            <option key={a} value={a}>
              Action: {a}
            </option>
          ))}
        </select>

        <select
          value={entityFilter}
          onChange={(e) => {
            setEntityFilter(e.target.value);
            setPage(1);
          }}
          className="border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium bg-white"
        >
          {entityTypes.map((e) => (
            <option key={e} value={e}>
              Entity: {e}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner text="Loading audit logs..." size="lg" />
      ) : logs.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-xs text-slate-400">
          No audit log entries matching your filters.
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
              <thead className="bg-slate-50/75 text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">Entity Type</th>
                  <th className="px-6 py-4">Actor</th>
                  <th className="px-6 py-4">Safe Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4 text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800">{log.entityType}</td>
                    <td className="px-6 py-4 text-slate-600">{log.actorEmail}</td>
                    <td className="px-6 py-4 max-w-xs font-mono text-[11px] text-slate-500 truncate">
                      {JSON.stringify(log.safeMetadata || {})}
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
