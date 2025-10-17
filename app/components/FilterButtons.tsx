interface FilterButtonsProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export function FilterButtons({
  activeFilter,
  onFilterChange,
}: FilterButtonsProps) {
  const filters = [
    { id: "processed", label: "Đã xử lý" },
    { id: "processing", label: "Đang xử lý" },
  ];

  return (
    <div className="stack-filter-container">
      <div className="stack-filter-buttons">
        {filters.map((filter, index) => (
          <div key={filter.id} className="filter-button-wrapper">
            <button
              className={`stack-filter-btn ${
                activeFilter === filter.id ? "active" : ""
              }`}
              onClick={() => onFilterChange(filter.id)}
            >
              {filter.label}
            </button>
            {index < filters.length - 1 && (
              <span className="filter-separator">|</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
