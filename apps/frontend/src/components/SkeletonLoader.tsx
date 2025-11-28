export interface SkeletonLoaderProps {
  type?: 'table' | 'card' | 'list' | 'detail';
  count?: number;
}

export const SkeletonLoader = ({
  type = 'table',
  count = 5,
}: SkeletonLoaderProps) => {
  const skeletonItems = Array.from({ length: count });

  if (type === 'table') {
    return (
      <div className="space-y-3">
        {/* Header */}
        <div className="grid grid-cols-5 gap-4 p-4 bg-neutral-100 rounded-lg">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-4 bg-neutral-200 rounded animate-pulse"></div>
          ))}
        </div>
        {/* Rows */}
        {skeletonItems.map((_, i) => (
          <div key={i} className="grid grid-cols-5 gap-4 p-4 border border-neutral-200 rounded-lg">
            {Array.from({ length: 5 }).map((_, j) => (
              <div key={j} className="h-4 bg-neutral-200 rounded animate-pulse"></div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (type === 'card') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {skeletonItems.map((_, i) => (
          <div key={i} className="p-6 border border-neutral-200 rounded-lg space-y-4">
            <div className="h-6 bg-neutral-200 rounded w-3/4 animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-4 bg-neutral-200 rounded animate-pulse"></div>
              <div className="h-4 bg-neutral-200 rounded w-5/6 animate-pulse"></div>
            </div>
            <div className="flex gap-2 pt-4">
              <div className="h-8 bg-neutral-200 rounded flex-1 animate-pulse"></div>
              <div className="h-8 bg-neutral-200 rounded flex-1 animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className="space-y-3">
        {skeletonItems.map((_, i) => (
          <div key={i} className="p-4 border border-neutral-200 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-5 bg-neutral-200 rounded w-1/3 animate-pulse"></div>
              <div className="h-5 bg-neutral-200 rounded w-20 animate-pulse"></div>
            </div>
            <div className="h-4 bg-neutral-200 rounded w-full animate-pulse"></div>
            <div className="h-4 bg-neutral-200 rounded w-4/5 animate-pulse"></div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'detail') {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="h-8 bg-neutral-200 rounded w-1/2 animate-pulse"></div>
          <div className="h-4 bg-neutral-200 rounded w-2/3 animate-pulse"></div>
        </div>

        <div className="border border-neutral-200 rounded-lg p-6 space-y-4">
          <div className="h-6 bg-neutral-200 rounded w-1/4 animate-pulse"></div>
          <div className="grid grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-neutral-200 rounded w-1/2 animate-pulse"></div>
                <div className="h-6 bg-neutral-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-neutral-200 rounded-lg p-6 space-y-4">
          <div className="h-6 bg-neutral-200 rounded w-1/4 animate-pulse"></div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-4 bg-neutral-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
};
