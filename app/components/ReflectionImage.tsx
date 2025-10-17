import { useState, useEffect } from "react";
import { buildFileDownloadURL } from "../config/api";

interface ReflectionImageProps {
  thumbnailId: string;
  alt: string;
  className?: string;
}

export function ReflectionImage({
  thumbnailId,
  alt,
  className,
}: ReflectionImageProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Check if it's a demo thumbnail
  const isDemoThumbnail = thumbnailId?.startsWith("demo-");

  // Debug logging
  useEffect(() => {
    console.log("ReflectionImage render:", {
      thumbnailId,
      isDemoThumbnail,
      imageLoading,
      imageError,
    });
  }, [thumbnailId, isDemoThumbnail, imageLoading, imageError]);

  const handleImageLoad = () => {
    console.log("Image loaded successfully:", thumbnailId);
    setImageLoading(false);
  };

  const handleImageError = (e: any) => {
    console.log("Image load error:", thumbnailId, e);
    setImageError(true);
    setImageLoading(false);
  };

  // Demo mode - show placeholder
  if (isDemoThumbnail) {
    return (
      <div className={`demo-image-placeholder ${className || ""}`}>
        <div className="demo-image-content">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="M21 15l-3.086-3.086a2 2 0 00-2.828 0L6 21" />
          </svg>
          <p>Demo Image</p>
        </div>
      </div>
    );
  }

  // Show error placeholder if image fails to load
  if (imageError) {
    return (
      <div className={`image-error ${className || ""}`}>
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="M21 15l-3.086-3.086a2 2 0 00-2.828 0L6 21" />
        </svg>
        <p>Không thể tải ảnh</p>
      </div>
    );
  }

  const imageUrl = buildFileDownloadURL(thumbnailId);
  console.log("Attempting to load image:", imageUrl);

  // Always render img tag, overlay loading state
  return (
    <div
      className={`image-container ${className || ""}`}
      style={{ position: "relative" }}
    >
      <img
        src={imageUrl}
        alt={alt}
        className={`reflection-image ${imageLoading ? "loading" : "loaded"}`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: imageLoading ? 0 : 1,
          transition: "opacity 0.3s ease",
        }}
      />
      {imageLoading && (
        <div className="image-loading-overlay">
          <div className="loading-spinner-small"></div>
          <p style={{ marginTop: "8px", fontSize: "12px", color: "#6b7280" }}>
            Đang tải...
          </p>
        </div>
      )}
    </div>
  );
}
