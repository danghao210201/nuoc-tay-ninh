import { useState } from "react";
import { ReflectionImage } from "./ReflectionImage";

interface ImageFile {
  id: string;
  name: string;
  group: number[];
  updatedDate: string;
}

interface ReflectionGalleryProps {
  images: ImageFile[];
}

export function ReflectionGallery({ images }: ReflectionGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showGalleryModal, setShowGalleryModal] = useState(false);

  if (!images || images.length === 0) {
    return null;
  }

  const handleImageClick = (index: number) => {
    setCurrentImageIndex(index);
    setShowGalleryModal(true);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const closeModal = () => {
    setShowGalleryModal(false);
  };

  return (
    <>
      <div className="reflection-gallery">
        <div className="main-image" onClick={() => handleImageClick(0)}>
          <ReflectionImage
            thumbnailId={images[0].id}
            alt="Hình ảnh phản ánh"
            className="gallery-main-image"
          />
          {images.length > 1 && (
            <div className="image-count-overlay">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M21 19V5C21 3.9 20.1 3 19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19ZM8.5 13.5L11 16.51L14.5 12L19 18H5L8.5 13.5Z" />
              </svg>
              {images.length}
            </div>
          )}
        </div>

        {images.length > 1 && (
          <div className="thumbnail-list">
            {images.slice(1, 4).map((image, index) => (
              <div
                key={image.id}
                className="thumbnail-item"
                onClick={() => handleImageClick(index + 1)}
              >
                <ReflectionImage
                  thumbnailId={image.id}
                  alt={`Hình ảnh ${index + 2}`}
                  className="gallery-thumbnail"
                />
                {index === 2 && images.length > 4 && (
                  <div className="more-images-overlay">
                    +{images.length - 4}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Gallery Modal */}
      {showGalleryModal && (
        <div className="gallery-modal" onClick={closeModal}>
          <div
            className="gallery-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="gallery-close-btn" onClick={closeModal}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <div className="gallery-image-container">
              {images.length > 1 && (
                <button
                  className="gallery-nav-btn gallery-prev-btn"
                  onClick={prevImage}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="15,18 9,12 15,6" />
                  </svg>
                </button>
              )}

              <ReflectionImage
                thumbnailId={images[currentImageIndex].id}
                alt={`Hình ảnh ${currentImageIndex + 1}`}
                className="gallery-modal-image"
              />

              {images.length > 1 && (
                <button
                  className="gallery-nav-btn gallery-next-btn"
                  onClick={nextImage}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="9,18 15,12 9,6" />
                  </svg>
                </button>
              )}
            </div>

            <div className="gallery-counter">
              {currentImageIndex + 1} / {images.length}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
