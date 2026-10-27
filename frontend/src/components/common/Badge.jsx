import React from 'react';

export const StatusBadge = ({ status }) => {
  const styles = {
    Approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    selected: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    completed: 'bg-blue-50 text-blue-700 border-blue-200',
    ongoing: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    'Pending Review': 'bg-amber-50 text-amber-700 border-amber-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    upcoming: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    Rejected: 'bg-rose-50 text-rose-700 border-rose-200',
    rejected: 'bg-rose-50 text-rose-700 border-rose-200',
    inactive: 'bg-slate-100 text-slate-600 border-slate-200',
    Draft: 'bg-slate-100 text-slate-600 border-slate-200',
    archived: 'bg-slate-100 text-slate-600 border-slate-200',
  };

  const styleClass = styles[status] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styleClass}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-70"></span>
      {status}
    </span>
  );
};

export const DifficultyBadge = ({ difficulty }) => {
  const styles = {
    Easy: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Medium: 'bg-amber-50 text-amber-700 border-amber-200',
    Hard: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
        styles[difficulty] || 'bg-slate-50 text-slate-700 border-slate-200'
      }`}
    >
      {difficulty}
    </span>
  );
};

export const CategoryBadge = ({ category }) => {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
      {category}
    </span>
  );
};

export const PlacementVerifiedBadge = ({ verified, className = '' }) => {
  if (verified) {
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-xs ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mr-1.5 animate-pulse"></span>
        Placement Verified
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200 ${className}`}
    >
      Unverified
    </span>
  );
};
