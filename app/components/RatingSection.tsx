import { useState } from "react";

interface Reaction {
  satisfied: number;
  normal: number;
  unsatisfied: number;
  verySatisfied: number;
  veryUnsatisfied: number;
}

interface RatingSectionProps {
  petitionId: string;
  currentReaction: Reaction;
}

export function RatingSection({
  petitionId,
  currentReaction,
}: RatingSectionProps) {
  const [userRating, setUserRating] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const ratingOptions = [
    {
      id: "verySatisfied",
      label: "Rất hài lòng",
      icon: (
        <div style={{ position: "relative", display: "inline-block" }}>
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="currentColor"
            stroke="none"
          >
            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
          </svg>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
            style={{
              position: "absolute",
              top: "-4px",
              right: "-4px",
              color: "#fbbf24",
            }}
          >
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
          </svg>
        </div>
      ),
      color: "#22c55e",
      count: currentReaction.verySatisfied || 0,
    },
    {
      id: "satisfied",
      label: "Hài lòng",
      icon: (
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="currentColor"
          stroke="none"
        >
          <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
        </svg>
      ),
      color: "#3b82f6",
      count: currentReaction.satisfied || 0,
    },
    {
      id: "unsatisfied",
      label: "Không hài lòng",
      icon: (
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="currentColor"
          stroke="none"
          style={{ transform: "rotate(180deg)" }}
        >
          <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
        </svg>
      ),
      color: "#ef4444",
      count: currentReaction.unsatisfied || 0,
    },
  ];

  const handleRating = async (ratingId: string) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setUserRating(ratingId);

    try {
      // Simulate API call for rating
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log(`Rating submitted: ${ratingId} for petition: ${petitionId}`);
    } catch (error) {
      console.error("Error submitting rating:", error);
      setUserRating(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTotalRatings = () => {
    return (
      currentReaction.verySatisfied +
      currentReaction.satisfied +
      currentReaction.unsatisfied
    );
  };

  return (
    <div className="rating-section">
      <h3 className="rating-title">Đánh giá kết quả</h3>

      <div className="rating-options">
        {ratingOptions.map((option) => (
          <button
            key={option.id}
            className={`rating-option ${
              userRating === option.id ? "selected" : ""
            }`}
            onClick={() => handleRating(option.id)}
            disabled={isSubmitting}
            style={{
              borderColor: userRating === option.id ? option.color : "#e5e7eb",
              color: userRating === option.id ? option.color : "#6b7280",
            }}
          >
            <div className="rating-icon" style={{ color: option.color }}>
              {option.icon}
            </div>
            <span className="rating-label">{option.label}</span>
            <span className="rating-count">({option.count})</span>
          </button>
        ))}
      </div>

      {userRating && (
        <div className="rating-success">
          <p>✅ Cảm ơn bạn đã đánh giá!</p>
        </div>
      )}

      {getTotalRatings() > 0 && (
        <div className="rating-stats">
          <p>
            Tổng số đánh giá: <strong>{getTotalRatings()}</strong>
          </p>
        </div>
      )}
    </div>
  );
}
