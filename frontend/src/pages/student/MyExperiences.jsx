import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, PlusCircle, ArrowRight, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import api from '../../services/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { StatusBadge, DifficultyBadge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';

export const MyExperiences = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      setLoading(true);
      try {
        const res = await api.get('/experiences/my-submissions');
        if (res.data.success) {
          setSubmissions(res.data.data || []);
        }
      } catch (err) {
        console.error('Failed to load my submissions', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading your submissions..." size="lg" />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            My Experience Submissions
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track the administrative moderation review status of your submitted interview reports.
          </p>
        </div>

        <Link
          to="/submit-experience"
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-brand-blue hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Submit Experience</span>
        </Link>
      </div>

      {submissions.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No experiences submitted yet"
          description="If you have an officially verified placement offer, share your interview rounds to guide college juniors."
          actionText="Submit Experience"
          actionLink="/submit-experience"
        />
      ) : (
        <div className="space-y-4">
          {submissions.map((exp) => (
            <div
              key={exp._id}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4 hover:border-slate-300 transition"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2.5">
                  <span className="text-sm font-bold text-navy-900 bg-slate-100 px-3 py-1 rounded-xl">
                    {exp.companyId?.name}
                  </span>
                  <StatusBadge status={exp.status} />
                  <DifficultyBadge difficulty={exp.difficulty} />
                </div>
                <span className="text-xs text-slate-400">
                  Submitted {new Date(exp.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">{exp.jobRole}</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Drive: {exp.placementDriveId?.title} • {exp.rounds?.length} Rounds Detailed
                </p>
              </div>

              {/* Moderation Feedback if present */}
              {exp.moderationFeedback && (
                <div
                  className={`p-3.5 rounded-xl text-xs space-y-1 ${
                    exp.status === 'Approved'
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                      : 'bg-rose-50 text-rose-900 border border-rose-200'
                  }`}
                >
                  <span className="font-bold block">
                    Placement Directorate Moderation Feedback:
                  </span>
                  <p>{exp.moderationFeedback}</p>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <Link
                  to={`/experiences/${exp._id}`}
                  className="text-xs font-bold text-brand-blue hover:text-blue-700 flex items-center space-x-1"
                >
                  <span>View Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
