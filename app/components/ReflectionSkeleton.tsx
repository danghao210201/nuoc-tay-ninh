export function ReflectionSkeleton() {
  return (
    <div className="skeleton-reflection-item">
      <div className="skeleton-image-container">
        <div className="skeleton-image"></div>
        <div className="skeleton-tag"></div>
      </div>

      <div className="skeleton-content">
        <div className="skeleton-title">
          <div className="skeleton-line skeleton-line-long"></div>
          <div className="skeleton-line skeleton-line-medium"></div>
        </div>

        <div className="skeleton-footer">
          <div className="skeleton-line skeleton-line-short"></div>
          <div className="skeleton-badge"></div>
        </div>
      </div>
    </div>
  );
}

export function ReflectionSkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="new-reflection-list">
      {Array.from({ length: count }, (_, index) => (
        <ReflectionSkeleton key={index} />
      ))}
    </div>
  );
}
