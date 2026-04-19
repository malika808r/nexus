import React from 'react';

export default function PostSkeleton() {
  return (
    <div className="card p-6 animate-pulse border-none shadow-sm bg-white dark:bg-slate-900/50">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800" />
        <div className="space-y-2">
          <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded-lg opacity-50" />
        </div>
      </div>
      
      <div className="space-y-3 mb-6">
        <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="h-4 w-[90%] bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="h-4 w-[40%] bg-slate-200 dark:bg-slate-800 rounded-lg" />
      </div>
      
      <div className="flex items-center gap-8 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded-lg" />
      </div>
    </div>
  );
}
