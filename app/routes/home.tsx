import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import type { Route } from "./+types/home";
import { FilterButtons } from "../components/FilterButtons";
import { ReflectionList } from "../components/ReflectionList";
import { BottomNavigation } from "../components/BottomNavigation";
import {
  petitionApi,
  getUserByTayNinhId,
  getPersonalPetitions,
  type ApiResponse,
  type UserInfo,
  type PersonalPetition,
  type PersonalPetitionsResponse,
} from "../services/api";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Phản ánh hiện trường - Long An" },
    {
      name: "description",
      content: "Ứng dụng phản ánh hiện trường tỉnh Long An",
    },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
  ];
}

export default function Home() {
  const [searchParams] = useSearchParams();
  const [activeFilter, setActiveFilter] = useState("processed");
  const [activeBottomTab, setActiveBottomTab] = useState("list");

  // State cho public reflections
  const [reflections, setReflections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUsingMockData, setIsUsingMockData] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    size: 10,
    hasMore: false,
  });

  // State cho personal reflections
  const [personalReflections, setPersonalReflections] = useState<
    PersonalPetition[]
  >([]);
  const [personalLoading, setPersonalLoading] = useState(false);
  const [personalError, setPersonalError] = useState<string | null>(null);
  const [personalPagination, setPersonalPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    size: 10,
    hasMore: false,
  });

  // State cho user info
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoadingUserInfo, setIsLoadingUserInfo] = useState(false);

  // Adapter function để chuyển đổi PersonalPetition thành Reflection format
  const adaptPersonalPetitionToReflection = (
    petition: PersonalPetition
  ): any => {
    return {
      id: petition.id,
      title: petition.title,
      description: petition.description,
      createdDate: petition.createdDate,
      takePlaceAt: {
        fullAddress: petition.takePlaceAt.fullAddress,
      },
      thumbnailId: petition.thumbnailId,
      tag: {
        name: petition.tag.name,
      },
      status: petition.status,
      statusDescription: petition.statusDescription,
      file: [], // Personal petition API không trả về file list
    };
  };

  // Hàm load dữ liệu từ API
  const loadReflections = async (
    page: number = 0,
    status?: number,
    isLoadMore: boolean = false
  ) => {
    try {
      if (!isLoadMore) {
        setLoading(true);
      }
      setError(null);

      const response = await petitionApi.searchPublicPetitions({
        page,
        size: 10,
        status,
      });

      // Check if using mock data (based on demo IDs)
      const usingMock = response.content.some((item) =>
        item.id?.startsWith("demo-")
      );
      setIsUsingMockData(usingMock);

      if (isLoadMore) {
        setReflections((prev) => [...prev, ...response.content]);
      } else {
        setReflections(response.content);
      }

      setPagination({
        currentPage: response.number,
        totalPages: response.totalPages,
        totalElements: response.totalElements,
        size: response.size,
        hasMore: !response.last,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Có lỗi xảy ra khi tải dữ liệu"
      );
      console.error("Error loading reflections:", err);
    } finally {
      setLoading(false);
    }
  };

  // Hàm load phản ánh cá nhân
  const loadPersonalReflections = async (
    page: number = 0,
    isLoadMore: boolean = false
  ) => {
    if (!userInfo?.soDienThoai) {
      setPersonalError("Không có thông tin số điện thoại");
      return;
    }

    try {
      if (!isLoadMore) {
        setPersonalLoading(true);
      }
      setPersonalError(null);

      const response = await getPersonalPetitions(
        userInfo.soDienThoai,
        page,
        10
      );

      if (isLoadMore) {
        setPersonalReflections((prev) => [...prev, ...response.content]);
      } else {
        setPersonalReflections(response.content);
      }

      setPersonalPagination({
        currentPage: response.number,
        totalPages: response.totalPages,
        totalElements: response.totalElements,
        size: response.size,
        hasMore: !response.last,
      });
    } catch (err) {
      setPersonalError(
        err instanceof Error
          ? err.message
          : "Có lỗi xảy ra khi tải phản ánh cá nhân"
      );
      console.error("Error loading personal reflections:", err);
    } finally {
      setPersonalLoading(false);
    }
  };

  // Load more data for pagination
  const loadMore = () => {
    if (activeBottomTab === "list" && pagination.hasMore && !loading) {
      const status = activeFilter === "processed" ? 3 : 2;
      loadReflections(pagination.currentPage + 1, status, true);
    } else if (
      activeBottomTab === "personal" &&
      personalPagination.hasMore &&
      !personalLoading
    ) {
      loadPersonalReflections(personalPagination.currentPage + 1, true);
    }
  };

  // Kiểm tra đăng nhập và lấy thông tin user
  useEffect(() => {
    const checkUserLogin = async () => {
      const tayNinhId = searchParams.get("tayninhid");

      if (tayNinhId) {
        setIsLoadingUserInfo(true);
        try {
          console.log("Checking user login for TayNinhID:", tayNinhId);
          const userData = await getUserByTayNinhId(tayNinhId);
          setUserInfo(userData);
          console.log("User info loaded successfully:", userData);
        } catch (error) {
          console.error("Error loading user info:", error);
          setUserInfo(null);
        } finally {
          setIsLoadingUserInfo(false);
        }
      } else {
        setUserInfo(null);
      }
    };

    checkUserLogin();
  }, [searchParams]);

  // Load personal reflections khi user info có và tab personal được chọn
  useEffect(() => {
    if (activeBottomTab === "personal" && userInfo?.soDienThoai) {
      loadPersonalReflections(0, false);
    }
  }, [activeBottomTab, userInfo]);

  // Effect để load dữ liệu khi filter thay đổi (chỉ cho tab list)
  useEffect(() => {
    if (activeBottomTab === "list") {
      const status = activeFilter === "processed" ? 3 : 2;
      loadReflections(0, status, false);
    }
  }, [activeFilter, activeBottomTab]);

  // Effect để load dữ liệu lần đầu
  useEffect(() => {
    loadReflections(0, 3, false); // Default load "processed" status
  }, []);

  return (
    <div className="mobile-app">
      {/* Chỉ hiển thị FilterButtons khi ở tab list */}
      {activeBottomTab === "list" && (
        <FilterButtons
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />
      )}

      {/* Demo mode notice - chỉ cho tab list */}
      {activeBottomTab === "list" && isUsingMockData && (
        <div className="demo-notice">
          <p>📱 Chế độ demo: API server không khả dụng, hiển thị dữ liệu mẫu</p>
        </div>
      )}

      {/* Nội dung cho tab List */}
      {activeBottomTab === "list" && (
        <>
          {error && (
            <div className="error-message">
              <p>⚠️ {error}</p>
              <button
                onClick={() => {
                  const status = activeFilter === "processed" ? 3 : 2;
                  loadReflections(0, status, false);
                }}
              >
                Thử lại
              </button>
            </div>
          )}

          <ReflectionList
            reflections={reflections}
            loading={loading}
            hasMore={pagination.hasMore}
            onLoadMore={loadMore}
          />
        </>
      )}

      {/* Nội dung cho tab Personal */}
      {activeBottomTab === "personal" && (
        <>
          {/* Chưa đăng nhập */}
          {!searchParams.get("tayninhid") && (
            <div className="personal-empty-state">
              <div className="empty-icon">
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <h3>Chưa đăng nhập</h3>
              <p>Vui lòng đăng nhập để xem phản ánh cá nhân của bạn</p>
            </div>
          )}

          {/* Đang load thông tin user */}
          {searchParams.get("tayninhid") && isLoadingUserInfo && (
            <div className="personal-loading">
              <div className="loading-spinner"></div>
              <p>Đang tải thông tin tài khoản...</p>
            </div>
          )}

          {/* Đã đăng nhập */}
          {searchParams.get("tayninhid") && userInfo && !isLoadingUserInfo && (
            <>
              {/* Header thông tin user */}
              <div className="personal-header">
                <div className="user-avatar">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div className="user-info">
                  <h3>{userInfo.hoVaTen}</h3>
                  <p>{userInfo.soDienThoai}</p>
                </div>
              </div>

              {/* Error cho personal */}
              {personalError && (
                <div className="error-message">
                  <p>⚠️ {personalError}</p>
                  <button onClick={() => loadPersonalReflections(0, false)}>
                    Thử lại
                  </button>
                </div>
              )}

              {/* Danh sách phản ánh cá nhân */}
              <ReflectionList
                reflections={personalReflections.map(
                  adaptPersonalPetitionToReflection
                )}
                loading={personalLoading}
                hasMore={personalPagination.hasMore}
                onLoadMore={loadMore}
              />
            </>
          )}
        </>
      )}

      <BottomNavigation
        activeTab={activeBottomTab}
        onTabChange={setActiveBottomTab}
      />
    </div>
  );
}
