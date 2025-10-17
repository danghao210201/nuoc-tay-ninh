import { useNavigate, useSearchParams } from "react-router";

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function BottomNavigation({
  activeTab,
  onTabChange,
}: BottomNavigationProps) {
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

  return (
    <div className="bottom-nav">
      <button
        className={`bottom-nav-item ${activeTab === "list" ? "active" : ""}`}
        onClick={() => onTabChange("list")}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
          <path d="M2 12h20" />
        </svg>
        <span>Công khai</span>
      </button>

      <button
        className="create-btn"
        onClick={() => navigateWithParams("/send-reflection")}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M22 2L11 13" />
          <path d="M22 2L15 22L11 13M22 2L2 9L11 13" />
        </svg>
      </button>

      <button
        className={`bottom-nav-item ${
          activeTab === "personal" ? "active" : ""
        }`}
        onClick={() => onTabChange("personal")}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        <span>Cá nhân</span>
      </button>
    </div>
  );
}
