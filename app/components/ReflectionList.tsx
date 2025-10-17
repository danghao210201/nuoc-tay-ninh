import { ReflectionImage } from "./ReflectionImage";
import { ReflectionSkeletonList } from "./ReflectionSkeleton";
import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router";

interface Reflection {
  id: string;
  title: string;
  description: string;
  createdDate: string;
  takePlaceAt: {
    fullAddress: string;
  };
  thumbnailId: string;
  tag: {
    name: string;
  };
  status: number;
  statusDescription: string;
  file: Array<{
    id: string;
    name: string;
    group: number[];
    updatedDate: string;
  }>;
}

interface ReflectionListProps {
  reflections: Reflection[];
  loading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
}

export function ReflectionList({
  reflections,
  loading = false,
  hasMore = false,
  onLoadMore,
}: ReflectionListProps) {
  const observerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Helper function để preserve search params khi navigate
  const navigateWithParams = (path: string) => {
    const params = new URLSearchParams();
    const tayNinhId = searchParams.get("tayninhid");

    if (tayNinhId) {
      params.set("tayninhid", tayNinhId);
    }

    const url = params.toString() ? `${path}?${params.toString()}` : path;
    navigate(url);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getImageCount = (files: any[]) => {
    if (!files) return 0;
    return files.filter((file) => file.group && file.group.includes(1)).length;
  };

  const getStatusBadgeClass = (status: number, statusDescription: string) => {
    if (status === 3 || statusDescription === "Hoàn thành") {
      return "status-badge-completed";
    } else if (status === 2 || status === 1) {
      return "status-badge-processing";
    }
    return "status-badge-default";
  };

  const handleReflectionClick = (reflectionId: string) => {
    navigateWithParams(`/reflection/${reflectionId}`);
  };

  // Intersection Observer cho infinite scroll
  useEffect(() => {
    if (!hasMore || !onLoadMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && !loading) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = observerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasMore, loading, onLoadMore]);

  if (loading && reflections.length === 0) {
    return <ReflectionSkeletonList count={5} />;
  }

  if (!loading && reflections.length === 0) {
    return (
      <div className="new-reflection-list">
        <div className="empty-container">
          <p>Không có phản ánh nào</p>
        </div>
      </div>
    );
  }

  return (
    <div className="new-reflection-list">
      {reflections.map((reflection) => (
        <div
          key={reflection.id}
          className="new-reflection-item clickable"
          onClick={() => handleReflectionClick(reflection.id)}
        >
          <div className="reflection-image-container">
            <ReflectionImage
              thumbnailId={reflection.thumbnailId}
              alt={reflection.title}
              className="new-reflection-image"
            />
            <div className="image-tag-bottom">{reflection.tag.name}</div>
            {getImageCount(reflection.file) > 1 && (
              <div className="image-count">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                  <path d="M21 19V5C21 3.9 20.1 3 19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19ZM8.5 13.5L11 16.51L14.5 12L19 18H5L8.5 13.5Z" />
                </svg>
                {getImageCount(reflection.file)}
              </div>
            )}
          </div>

          <div className="new-reflection-content">
            <h3 className="new-reflection-title">{reflection.title}</h3>

            <div className="reflection-footer">
              <div className="reflection-meta-left">
                <div className="info-item">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12,6 12,12 16,14" />
                  </svg>
                  <span className="info-text">
                    {formatDate(reflection.createdDate)}
                  </span>
                </div>
              </div>

              <div className="reflection-meta-right">
                <span
                  className={`new-status-badge ${getStatusBadgeClass(
                    reflection.status,
                    reflection.statusDescription
                  )}`}
                >
                  {reflection.statusDescription}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Loading more indicator */}
      {loading && reflections.length > 0 && (
        <div className="loading-more">
          <div className="loading-spinner-small"></div>
          <p>Đang tải thêm...</p>
        </div>
      )}

      {/* Intersection observer target */}
      {hasMore && !loading && (
        <div ref={observerRef} className="load-more-trigger" />
      )}

      {/* End of list indicator */}
      {!hasMore && reflections.length > 0 && (
        <div className="end-of-list">
          <p>Đã hiển thị tất cả phản ánh</p>
        </div>
      )}
    </div>
  );
}
