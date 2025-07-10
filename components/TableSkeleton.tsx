export default function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="w-full border border-gray-200 rounded-md overflow-hidden animate-pulse">
      <div className="bg-blue-600 text-white text-sm font-semibold px-4 py-2">
        <div className="grid grid-cols-4 gap-4">
          <span>Date</span>
          <span>Wake Time</span>
          <span>HRV</span>
          <span>Action</span>
        </div>
      </div>

      {[...Array(rows)].map((_, i) => (
        <div
          key={i}
          className={`grid grid-cols-4 gap-4 px-4 py-3 ${
            i % 2 === 0 ? 'bg-white' : 'bg-gray-50'
          } border-t border-gray-100`}
        >
          <div className="h-4 bg-gray-200 rounded w-24" />
          <div className="h-4 bg-gray-200 rounded w-20" />
          <div className="h-4 bg-gray-200 rounded w-12" />
          <div className="h-4 bg-gray-300 rounded w-16" />
        </div>
      ))}
    </div>
  );
}
