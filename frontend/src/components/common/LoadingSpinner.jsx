import React from 'react';

export const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div
        className={`${sizeClasses[size] || sizeClasses.md} rounded-full border-brand-blue border-t-transparent animate-spin`}
      ></div>
      {text && <p className="mt-3 text-sm text-slate-500 font-medium">{text}</p>}
    </div>
  );
};

export const CardSkeleton = ({ count = 3 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse space-y-4"
        >
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-slate-200 rounded-lg"></div>
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              <div className="h-3 bg-slate-100 rounded w-1/2"></div>
            </div>
          </div>
          <div className="h-3 bg-slate-100 rounded w-full"></div>
          <div className="h-3 bg-slate-100 rounded w-5/6"></div>
          <div className="pt-2 flex justify-between items-center">
            <div className="h-6 bg-slate-200 rounded w-20"></div>
            <div className="h-8 bg-slate-200 rounded w-24"></div>
          </div>
        </div>
      ))}
    </div>
  );
};
