import { useState } from "react";
import { ReflectionImage } from "./ReflectionImage";
import { buildFileDownloadURL } from "../config/api";

interface ResultData {
  content: string;
  date: string;
  agency: {
    id: string;
    code?: string;
    name: string;
  };
  isPublic: boolean;
  approved: boolean;
}

interface ImageFile {
  id: string;
  name: string;
  group: number[];
  updatedDate: string;
}

interface GovernmentResponseProps {
  result: ResultData;
  images: ImageFile[];
  formatDate: (dateString: string) => string;
}

export function GovernmentResponse({
  result,
  images,
  formatDate,
}: GovernmentResponseProps) {
  const responseImages = images.filter(
    (img) => img.group && img.group.includes(3)
  );
  const [viewingFile, setViewingFile] = useState<{
    id: string;
    name: string;
    url: string;
  } | null>(null);
  const [downloadingFileId, setDownloadingFileId] = useState<string | null>(
    null
  );

  const downloadAndViewFile = async (fileId: string, fileName: string) => {
    if (downloadingFileId === fileId) return; // Prevent multiple downloads

    // Xử lý PDF trên mobile - tạo PDF viewer overlay thay vì mở tab mới
    if (isPDF(fileName) && isMobileDevice()) {
      try {
        setDownloadingFileId(fileId);
        const downloadUrl = buildFileDownloadURL(fileId);

        // Tạo PDF viewer với navigation overlay
        setViewingFile({
          id: fileId,
          name: fileName,
          url: downloadUrl, // Sử dụng direct URL cho mobile
        });
      } catch (error) {
        console.error("Error preparing PDF:", error);
        alert("Không thể tải file PDF. Vui lòng thử lại.");
      } finally {
        setDownloadingFileId(null);
      }
      return;
    }

    try {
      setDownloadingFileId(fileId);

      const downloadUrl = buildFileDownloadURL(fileId);
      const response = await fetch(downloadUrl, {
        method: "GET",
        signal: AbortSignal.timeout(15000), // 15 second timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const fileUrl = URL.createObjectURL(blob);

      setViewingFile({
        id: fileId,
        name: fileName,
        url: fileUrl,
      });
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Không thể tải file. Vui lòng thử lại.");
    } finally {
      setDownloadingFileId(null);
    }
  };

  const closeFileViewer = () => {
    if (viewingFile) {
      URL.revokeObjectURL(viewingFile.url);
      setViewingFile(null);
    }
  };

  const isImage = (fileName: string) => {
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"];
    return imageExtensions.some((ext) => fileName.toLowerCase().endsWith(ext));
  };

  const isPDF = (fileName: string) => {
    return fileName.toLowerCase().endsWith(".pdf");
  };

  const isMobileDevice = () => {
    // Detect mobile devices và webview
    const userAgent = navigator.userAgent.toLowerCase();
    const mobileKeywords = [
      "mobile",
      "android",
      "iphone",
      "ipad",
      "ipod",
      "blackberry",
      "webos",
    ];
    return (
      mobileKeywords.some((keyword) => userAgent.includes(keyword)) ||
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) ||
      window.innerWidth <= 768
    );
  };

  return (
    <>
      <div className="government-response">
        <div className="response-header">
          <h3 className="response-agency">{result.agency.name}</h3>
          <div className="response-date">
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
            <span>{formatDate(result.date)}</span>
          </div>
        </div>

        <div className="response-content">
          <p>{result.content}</p>
        </div>

        {responseImages.length > 0 && (
          <div className="response-attachments">
            <h4>File đính kèm:</h4>
            <div className="attachment-list">
              {responseImages.map((file) => (
                <div
                  key={file.id}
                  className="attachment-item"
                  onClick={() => downloadAndViewFile(file.id, file.name)}
                >
                  <div className="attachment-icon">
                    {downloadingFileId === file.id ? (
                      <div className="attachment-loading">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeDasharray="31.416"
                            strokeDashoffset="31.416"
                          >
                            <animate
                              attributeName="stroke-dasharray"
                              dur="2s"
                              values="0 31.416;15.708 15.708;0 31.416"
                              repeatCount="indefinite"
                            />
                            <animate
                              attributeName="stroke-dashoffset"
                              dur="2s"
                              values="0;-15.708;-31.416"
                              repeatCount="indefinite"
                            />
                          </circle>
                        </svg>
                      </div>
                    ) : isPDF(file.name) ? (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14,2 14,8 20,8" />
                        <line x1="9" y1="9" x2="10" y2="9" />
                        <line x1="9" y1="13" x2="15" y2="13" />
                        <line x1="13" y1="17" x2="15" y2="17" />
                      </svg>
                    ) : (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14,2 14,8 20,8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <polyline points="10,9 9,9 8,9" />
                      </svg>
                    )}
                  </div>
                  <span className="attachment-name">{file.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* File Viewer Modal */}
      {viewingFile && (
        <div
          className={`file-viewer-modal ${
            isPDF(viewingFile.name) && isMobileDevice()
              ? "mobile-pdf-modal"
              : ""
          }`}
          onClick={closeFileViewer}
        >
          <div
            className="file-viewer-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="file-viewer-header">
              <h3 className="file-viewer-title">{viewingFile.name}</h3>
              <button className="file-viewer-close" onClick={closeFileViewer}>
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
            </div>

            <div className="file-viewer-body">
              {isImage(viewingFile.name) ? (
                <img
                  src={viewingFile.url}
                  alt={viewingFile.name}
                  className="file-viewer-image"
                />
              ) : isPDF(viewingFile.name) ? (
                isMobileDevice() ? (
                  // Mobile: PDF viewer với navigation overlay
                  <div className="file-viewer-pdf-mobile">
                    <div className="pdf-mobile-header">
                      <button
                        className="pdf-back-btn"
                        onClick={closeFileViewer}
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M19 12H5" />
                          <path d="M12 19l-7-7 7-7" />
                        </svg>
                        Quay lại
                      </button>
                      <div className="pdf-mobile-actions">
                        <a
                          href={viewingFile.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="pdf-action-btn"
                          title="Mở trong browser"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                            <polyline points="15,3 21,3 21,9" />
                            <line x1="10" y1="14" x2="21" y2="3" />
                          </svg>
                        </a>
                        <a
                          href={viewingFile.url}
                          download={viewingFile.name}
                          className="pdf-action-btn"
                          title="Tải xuống"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7,10 12,15 17,10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                          </svg>
                        </a>
                      </div>
                    </div>
                    <div className="pdf-mobile-content">
                      <iframe
                        src={viewingFile.url}
                        title={viewingFile.name}
                        className="pdf-mobile-iframe"
                        frameBorder="0"
                      />
                      <div className="pdf-mobile-fallback">
                        <div className="fallback-content">
                          <div className="fallback-icon">
                            <svg
                              width="48"
                              height="48"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1"
                            >
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <polyline points="14,2 14,8 20,8" />
                              <line x1="9" y1="9" x2="10" y2="9" />
                              <line x1="9" y1="13" x2="15" y2="13" />
                              <line x1="13" y1="17" x2="15" y2="17" />
                            </svg>
                          </div>
                          <p className="fallback-title">PDF không hiển thị?</p>
                          <div className="fallback-buttons">
                            <a
                              href={viewingFile.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="fallback-btn primary"
                            >
                              Mở trong browser
                            </a>
                            <a
                              href={viewingFile.url}
                              download={viewingFile.name}
                              className="fallback-btn secondary"
                            >
                              Tải xuống
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Desktop: Sử dụng iframe như cũ
                  <div className="file-viewer-pdf">
                    <iframe
                      src={viewingFile.url}
                      title={viewingFile.name}
                      className="pdf-iframe"
                      frameBorder="0"
                    />
                    <div className="pdf-controls">
                      <a
                        href={viewingFile.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="pdf-control-btn"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                          <polyline points="15,3 21,3 21,9" />
                          <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                        Mở trong tab mới
                      </a>
                      <a
                        href={viewingFile.url}
                        download={viewingFile.name}
                        className="pdf-control-btn"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7,10 12,15 17,10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        Tải xuống
                      </a>
                    </div>
                  </div>
                )
              ) : (
                <div className="file-viewer-document">
                  <div className="document-icon">
                    <svg
                      width="64"
                      height="64"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14,2 14,8 20,8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10,9 9,9 8,9" />
                    </svg>
                  </div>
                  <p className="document-name">{viewingFile.name}</p>
                  <a
                    href={viewingFile.url}
                    download={viewingFile.name}
                    className="download-btn"
                  >
                    Tải xuống
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
