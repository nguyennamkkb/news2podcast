export default function ProjectDetailLoading() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-6 w-20 bg-muted animate-pulse rounded" />
      </div>
      <div className="h-64 w-full bg-muted animate-pulse rounded" />
    </div>
  );
}