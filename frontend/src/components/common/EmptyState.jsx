import React from 'react';
import { FolderSearch, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export const EmptyState = ({
  icon: Icon = FolderSearch,
  title = 'No items found',
  description = 'There are no records matching your criteria.',
  actionText,
  actionLink,
  onAction,
}) => {
  return (
    <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center my-6 max-w-lg mx-auto">
      <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-500 mx-auto flex items-center justify-center mb-4">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-slate-800">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
      {(actionText && (actionLink || onAction)) && (
        <div className="mt-6">
          {actionLink ? (
            <Link
              to={actionLink}
              className="inline-flex items-center px-4 py-2 bg-brand-blue hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              {actionText}
            </Link>
          ) : (
            <button
              onClick={onAction}
              className="inline-flex items-center px-4 py-2 bg-brand-blue hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition"
            >
              {actionText}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
