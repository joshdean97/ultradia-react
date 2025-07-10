export default function FocusStreakSkeleton() {
  return (
    <div className="bg-pink-50 border border-pink-200 p-4 rounded-lg animate-pulse space-y-3 mb-4">
      <div className="h-4 w-1/3 bg-pink-200 rounded" />
      <div className="flex gap-2 justify-center">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="w-6 h-6 bg-pink-100 rounded" />
        ))}
      </div>
      <div className="h-3 w-1/2 bg-pink-100 mx-auto rounded" />
      <div className="h-3 w-2/3 bg-pink-100 mx-auto rounded" />
    </div>
  );
}
