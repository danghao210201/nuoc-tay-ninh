import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router";
import type { Route } from "./+types/reflection-detail";
import { petitionApi, type PetitionDetail } from "../services/api";
import { ReflectionGallery } from "../components/ReflectionGallery";
import { GovernmentResponse } from "../components/GovernmentResponse";
import { RatingSection } from "../components/RatingSection";

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: `Chi tiết phản ánh - ${params.id}` },
    { name: "description", content: "Chi tiết phản ánh hiện trường" },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
  ];
}

export default function ReflectionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [detail, setDetail] = useState<PetitionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    if (!id) return;

    const loadDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await petitionApi.getPetitionDetail(id);
        setDetail(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Có lỗi xảy ra khi tải chi tiết"
        );
        console.error("Error loading petition detail:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDetail();
  }, [id]);

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

  const getStatusBadgeClass = (status: number, statusDescription: string) => {
    if (status === 3 || statusDescription === "Hoàn thành") {
      return "status-badge-completed";
    } else if (status === 2 || status === 1) {
      return "status-badge-processing";
    }
    return "status-badge-default";
  };

  const getUserImages = (files: any[]) => {
    if (!files) return [];
    return files.filter((file) => file.group && file.group.includes(1));
  };

  const getResponseImages = (files: any[]) => {
    if (!files) return [];
    return files.filter((file) => file.group && file.group.includes(3));
  };

  if (loading) {
    return (
      <div className="reflection-detail-container">
        <div className="detail-header-transparent">
          <button
            className="back-btn-circular"
            onClick={() => navigateWithParams("/")}
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
          </button>
        </div>
        <div className="detail-loading">
          <div className="loading-spinner"></div>
          <p>Đang tải chi tiết...</p>
        </div>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="reflection-detail-container">
        <div className="detail-header-transparent">
          <button
            className="back-btn-circular"
            onClick={() => navigateWithParams("/")}
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
          </button>
        </div>
        <div className="detail-error">
          <p>⚠️ {error || "Không thể tải chi tiết phản ánh"}</p>
          <button onClick={() => navigateWithParams("/")}>Quay lại</button>
        </div>
      </div>
    );
  }

  const userImages = getUserImages(detail.file);
  const responseImages = getResponseImages(detail.file);

  return (
    <div className="reflection-detail-container">
      <div className="detail-header-transparent">
        <button
          className="back-btn-circular"
          onClick={() => navigateWithParams("/")}
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
        </button>
      </div>

      <div className="detail-content">
        {/* Phần 1: Chi tiết phản ánh của người dân */}
        <div className="user-petition-section">
          {userImages.length > 0 && <ReflectionGallery images={userImages} />}

          <div className="petition-info">
            <h2 className="petition-title">{detail.title}</h2>

            <div className="location-info">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>{detail.takePlaceAt.fullAddress}</span>
            </div>

            <div className="petition-content">
              <p>{detail.description}</p>
            </div>

            <div className="petition-meta">
              <span className="send-date">
                Hạn xử lý: {formatDate(detail.dueDate)}
              </span>
            </div>
          </div>
        </div>

        {/* Phần 2: Phản hồi của cơ quan chính quyền */}
        {detail.result && (
          <>
            <GovernmentResponse
              result={detail.result}
              images={responseImages}
              formatDate={formatDate}
            />

            {/* Phần đánh giá */}
            <RatingSection petitionId={id!} currentReaction={detail.reaction} />
          </>
        )}
      </div>
    </div>
  );
}
