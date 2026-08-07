export function LoadingSkeleton({ lines = 4 }: { lines?: number }) {
  return (
    <div className="space-y-3 p-4 bg-white rounded-xl border border-slate-200 shadow-xs animate-pulse">
      <div className="h-4 bg-slate-200 rounded-md w-1/3 mb-4"></div>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="flex space-x-4">
          <div className="h-3 bg-slate-200 rounded-md w-1/4"></div>
          <div className="h-3 bg-slate-200 rounded-md w-1/2"></div>
          <div className="h-3 bg-slate-200 rounded-md w-1/4"></div>
        </div>
      ))}
    </div>
  );
}

export function LoadingKpiGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-28 bg-slate-200 rounded-xl border border-slate-300"></div>
      ))}
    </div>
  );
}
