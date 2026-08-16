import React from 'react';

export interface LoadingSkeletonProps {
  count?: number;
  type?: 'card' | 'list' | 'banner';
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  count = 4,
  type = 'card',
}) => {
  const items = Array.from({ length: count });

  if (type === 'card') {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {items.map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-800 rounded-2xl p-3 border border-slate-100 dark:border-slate-700 animate-pulse space-y-2"
          >
            <div className="w-full aspect-square bg-slate-200 dark:bg-slate-700 rounded-xl" />
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
            <div className="flex items-center justify-between pt-2">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
              <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-xl w-14" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-slate-800 rounded-2xl p-3 border border-slate-100 dark:border-slate-700 animate-pulse flex items-center gap-3"
        >
          <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
};
