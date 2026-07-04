export function PageSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="animate-pulse space-y-4 p-4">
      <div className="h-8 w-48 rounded-lg bg-surface-elevated" />
      <div className="h-4 w-72 rounded bg-surface-elevated" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="surface-panel h-32 rounded-xl" />
      ))}
    </div>
  );
}

export function FeedSkeleton() {
  return (
    <div className="animate-pulse space-y-4 p-4">
      <div className="surface-panel h-24 rounded-xl" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="surface-panel h-48 rounded-xl" />
      ))}
    </div>
  );
}
