import { useState } from "react";
import { useNavigate } from "react-router";
import type { Route } from "./+types/home";
import { searchWaterCustomers, type WaterCustomer, getWaterConsumptions, type WaterConsumption } from "../services/api";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Tra cứu nước" },
    {
      name: "description",
      content: "Ứng dụng tra cứu nước: thông tin khách hàng và danh sách tiêu thụ",
    },
    { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
  ];
}

export default function Home() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"khach-hang" | "tieu-thu">(
    "khach-hang"
  );

  const [keyword, setKeyword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<WaterCustomer[]>([]);
  const [custHasSearched, setCustHasSearched] = useState<boolean>(false);
  // States cho tra cứu tiêu thụ (hóa đơn)
  const [consIdkh, setConsIdkh] = useState<string>("");
  const [consLoading, setConsLoading] = useState<boolean>(false);
  const [consError, setConsError] = useState<string | null>(null);
  const [bills, setBills] = useState<WaterConsumption[]>([]);
  const [consHasSearched, setConsHasSearched] = useState<boolean>(false);
  const [kwFocused, setKwFocused] = useState(false);
  const [consFocused, setConsFocused] = useState(false);
  const [consMonth, setConsMonth] = useState<number | null>(null);
  const [consYear, setConsYear] = useState<number | null>(null);

  // Bộ lọc theo tháng/năm cho danh sách tiêu thụ
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const defaultYearOptions = Array.from({ length: 6 }, (_, i) => currentYear - i);
  const yearOptions = Array.from(new Set(bills.map((b) => b.nam))).sort((a, b) => b - a);
  const selectableYears = yearOptions.length > 0 ? yearOptions : defaultYearOptions;
  const filteredBills = bills.filter(
    (b) =>
      (consMonth == null || b.thang === consMonth) &&
      (consYear == null || b.nam === consYear)
  );
  const isFuturePeriod =
    consMonth != null &&
    consYear != null &&
    (consYear > currentYear || (consYear === currentYear && consMonth > currentMonth));

  // Mã màu dùng chung để tránh lặp lại literal
  const COLOR = {
    text: "#374151",
    muted: "#6b7280",
    border: "#e5e7eb",
    white: "#fff",
    cardBg: "#f9fafb",
    green: "#16a34a",
    red: "#ef4444",
    title: "#111827",
    iconBlue: "#0ea5e9",
    primaryBlue: "#2563eb",
  } as const;
  const goTo = (path: string) => () => navigate(path);

  const TabButton = ({
    label,
    isActive,
    onClick,
  }: {
    label: string;
    isActive: boolean;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className={`segmented-tab ${isActive ? "is-active" : ""}`}
      role="tab"
      aria-selected={isActive}
    >
      {label}
    </button>
  );

  async function handleSearch() {
    setLoading(true);
    setError(null);
    setCustHasSearched(true);
    try {
      const data = await searchWaterCustomers({ tenkh: keyword.trim() });
      setResults(data || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }

  function formatVND(n: number) {
    try {
      return new Intl.NumberFormat("vi-VN").format(n);
    } catch {
      return `${n}`;
    }
  }

  async function handleSearchBills() {
    if (!consIdkh.trim()) {
      setConsError("Vui lòng nhập mã khách hàng (idkh)");
      return;
    }
    setConsLoading(true);
    setConsError(null);
    setConsHasSearched(true);
    try {
      const data = await getWaterConsumptions(consIdkh.trim());
      setBills(data || []);
    } catch (e) {
      setConsError(e instanceof Error ? e.message : "Có lỗi khi tra cứu hóa đơn");
    } finally {
      setConsLoading(false);
    }
  }

  return (
    <div className="mobile-app">
      {/* <header className="page-header" style={{ padding: "16px", paddingTop: "calc(16px + env(safe-area-inset-top))", position: "sticky", top: 0, background: COLOR.white, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span aria-hidden style={{ color: COLOR.iconBlue }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12 2C12 2 5 9 5 14a7 7 0 0 0 14 0c0-5-7-12-7-12z" />
            </svg>
          </span>
          <h1 style={{ margin: 0, fontSize: "17px",fontWeight:600 }}>Tra cứu nước</h1>
        </div>
      </header> */}

      {/* Tab bar */}
      <div style={{ padding: "25px 16px" }}>
        <div className="segmented-tabs" role="tablist" aria-label="Chuyển tab tra cứu" style={{ display: "flex", alignItems: "center" }}>
          <TabButton
            label="Tra cứu khách hàng"
            isActive={activeTab === "khach-hang"}
            onClick={() => setActiveTab("khach-hang")}
          />
          <span role="separator" aria-hidden style={{ display: "inline-block", width: "1px", height: "28px", background: "#D3D4D7", margin: "0 8px" }} />
          <TabButton
            label="Tra cứu tiêu thụ"
            isActive={activeTab === "tieu-thu"}
            onClick={() => setActiveTab("tieu-thu")}
          />
        </div>
      </div>

      {/* Tab content */}
      <div style={{ padding: "16px" }}>
        {activeTab === "khach-hang" && (
          <>
            <div
              className="menu-card"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "16px",
                borderRadius: "12px",
                border: `1px solid ${COLOR.border}`,
                background: COLOR.white,
              }}
            >
              <span aria-hidden style={{ color: COLOR.primaryBlue }}>
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <circle cx="12" cy="8" r="4" />
                  <path d="M20 20v-1a5 5 0 0 0-5-5H9a5 5 0 0 0-5 5v1" />
                </svg>
              </span>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0 }}>Tra cứu thông tin khách hàng</h3>
                <p style={{ margin: "6px 0 0", color: COLOR.muted }}>
                  Xem hồ sơ, mã khách hàng, địa chỉ, trạng thái sử dụng.
                </p>
              </div>
            </div>

            {/* Quick search theo tên khách hàng */}
            <div
              style={{
                marginTop: "12px",
                padding: "12px",
                background: COLOR.white,
                border: `1px solid ${COLOR.border}`,
                borderRadius: "12px",
              }}
            >
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Nhập mã hoặc tên khách hàng..."
                  onFocus={() => setKwFocused(true)}
                  onBlur={() => setKwFocused(false)}
                  style={{
                    flex: 1,
                    padding: "10px",
                    border: `1px solid ${kwFocused ? COLOR.primaryBlue : COLOR.border}`,
                    borderRadius: "10px",
                    outline: "none",
                    transition: "box-shadow 0.2s ease, border-color 0.2s ease",
                    boxShadow: kwFocused ? "0 0 0 3px rgba(37,99,235,0.15)" : "none",
                  }}
                />
                <button
                  onClick={handleSearch}
                  style={{
                    padding: "10px 16px",
                    borderRadius: "10px",
                    border: "none",
                    background: COLOR.primaryBlue,
                    color: COLOR.white,
                    fontWeight: 600,
                    cursor: "pointer",
                    outline: "none",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.12)",
                  }}
                >
                  Tìm
                </button>
              </div>
              {loading && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    padding: "16px",
                    minHeight: "120px",
                  }}
                  role="status"
                  aria-live="polite"
                  aria-busy="true"
                >
                  <svg width="22" height="22" viewBox="0 0 50 50" aria-hidden style={{ marginRight: 2 }}>
                    <circle cx="25" cy="25" r="20" stroke={COLOR.border} strokeWidth="4" fill="none" />
                    <circle
                      cx="25"
                      cy="25"
                      r="20"
                      stroke={COLOR.primaryBlue}
                      strokeWidth="4"
                      strokeLinecap="round"
                      fill="none"
                      strokeDasharray="31.4 125.6"
                    >
                      <animateTransform
                        attributeName="transform"
                        type="rotate"
                        from="0 25 25"
                        to="360 25 25"
                        dur="0.9s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  </svg>
                  <span style={{ color: COLOR.muted, fontWeight: 600 }}>Đang tìm kiếm...</span>
                </div>
              )}
              {error && <p style={{ marginTop: 8, color: COLOR.red }}>{error}</p>}
              {!loading && custHasSearched && results.length === 0 && !error && (
                <p style={{ marginTop: 8, color: COLOR.red }}>
                  Không tìm thấy thông tin, hãy nhập đúng mã hoặc tên khách hàng
                </p>
              )}

              {!loading && results.length > 0 && (
                <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: "8px" }}>
                  {results.map((item) => (
                    <div key={`${item.idkh}-${item.sodb}`} style={{ padding: "12px", border: `1px solid ${COLOR.border}`, borderRadius: "10px", background: COLOR.cardBg }}>
                      <div style={{ fontWeight: 700 }}>{item.tenkh}</div>
                      <div style={{ color: COLOR.text }}>Số ĐB: {item.sodb} • Mã KH: {item.idkh}</div>
                      <div style={{ color: COLOR.muted }}>{item.diachi}</div>
                      {item.sdt && <div style={{ color: COLOR.muted }}>SĐT: {item.sdt}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === "tieu-thu" && (
          <>
            <div
              className="menu-card"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "16px",
                borderRadius: "12px",
                border: `1px solid ${COLOR.border}`,
                background: COLOR.white,
              }}
            >
              <span aria-hidden style={{ color: COLOR.primaryBlue }}>
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M3 3h18v4H3z" />
                  <path d="M3 11h18v10H3z" />
                  <path d="M7 15h2" />
                  <path d="M11 15h2" />
                  <path d="M15 15h2" />
                </svg>
              </span>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0 }}>Tra cứu danh sách tiêu thụ</h3>
                <p style={{ margin: "6px 0 0", color: COLOR.muted }}>
                  Xem lịch sử chỉ số, khối lượng tiêu thụ và hóa đơn.
                </p>
              </div>
            </div>
          
            {/* Quick search theo mã khách hàng (idkh) */}
            <div
              style={{
                marginTop: "12px",
                padding: "12px",
                background: COLOR.white,
                border: `1px solid ${COLOR.border}`,
                borderRadius: "12px",
              }}
            >
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  value={consIdkh}
                  onChange={(e) => setConsIdkh(e.target.value)}
                  placeholder="Nhập mã khách hàng..."
                  onFocus={() => setConsFocused(true)}
                  onBlur={() => setConsFocused(false)}
                  style={{
                    flex: 1,
                    padding: "10px",
                    border: `1px solid ${consFocused ? COLOR.primaryBlue : COLOR.border}`,
                    borderRadius: "10px",
                    outline: "none",
                    transition: "box-shadow 0.2s ease, border-color 0.2s ease",
                    boxShadow: consFocused ? "0 0 0 3px rgba(37,99,235,0.15)" : "none",
                  }}
                />
                <button
                  onClick={handleSearchBills}
                  style={{
                    padding: "10px 16px",
                    borderRadius: "10px",
                    border: "none",
                    background: COLOR.primaryBlue,
                    color: COLOR.white,
                    fontWeight: 600,
                    cursor: "pointer",
                    outline: "none",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.12)",
                  }}
                >
                  Tìm
                </button>
              </div>
              {/* Bộ lọc theo tháng/năm */}
              <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                <select
                  value={consMonth ?? ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    setConsMonth(v ? Number(v) : null);
                  }}
                  style={{
                    flex: 1,
                    padding: "10px",
                    border: `1px solid ${COLOR.border}`,
                    borderRadius: "10px",
                    outline: "none",
                    background: COLOR.white,
                  }}
                >
                  <option value="">Tất cả tháng</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>
                      Tháng {m}
                    </option>
                  ))}
                </select>
                <select
                  value={consYear ?? ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    setConsYear(v ? Number(v) : null);
                  }}
                  style={{
                    flex: 1,
                    padding: "10px",
                    border: `1px solid ${COLOR.border}`,
                    borderRadius: "10px",
                    outline: "none",
                    background: COLOR.white,
                  }}
                >
                  <option value="">Tất cả năm</option>
                  {selectableYears.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
              {consLoading && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    padding: "16px",
                    minHeight: "120px",
                  }}
                  role="status"
                  aria-live="polite"
                  aria-busy="true"
                >
                  <svg width="22" height="22" viewBox="0 0 50 50" aria-hidden style={{ marginRight: 2 }}>
                    <circle cx="25" cy="25" r="20" stroke={COLOR.border} strokeWidth="4" fill="none" />
                    <circle
                      cx="25"
                      cy="25"
                      r="20"
                      stroke={COLOR.primaryBlue}
                      strokeWidth="4"
                      strokeLinecap="round"
                      fill="none"
                      strokeDasharray="31.4 125.6"
                    >
                      <animateTransform
                        attributeName="transform"
                        type="rotate"
                        from="0 25 25"
                        to="360 25 25"
                        dur="0.9s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  </svg>
                  <span style={{ color: COLOR.muted, fontWeight: 600 }}>Đang tải hoá đơn...</span>
                </div>
              )}
              {consError && <p style={{ marginTop: 8, color: COLOR.red }}>{consError}</p>}
              {!consLoading && consHasSearched && bills.length === 0 && !consError && (
                <p style={{ marginTop: 8, color: COLOR.red }}>
                  Không tìm thấy thông tin, hãy nhập đúng mã khách hàng
                </p>
              )}
              {isFuturePeriod && (
                <p style={{ marginTop: 8, color: COLOR.iconBlue }}>
                  Chưa đến kỳ hạn thanh toán hoá đơn
                </p>
              )}
          
              {!consLoading && filteredBills.length > 0 && (
                <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: "8px" }}>
                  {filteredBills.map((bill) => (
                    <div key={bill.fkey} style={{ padding: "12px", border: `1px solid ${COLOR.border}`, borderRadius: "10px", background: COLOR.cardBg }}>
                      <div style={{ fontWeight: 700 }}>{bill.tenkh}</div>
                      <div style={{ color: COLOR.text, fontWeight: 600 }}>Kỳ hóa đơn: {bill.kyhd}</div>
                      <div style={{ color: COLOR.text }}>Mã KH: {bill.idkh}</div>
                      <div style={{ color: COLOR.text }}>Số ĐB: {bill.sodb}</div>
                      <div style={{ color: COLOR.text, textAlign:'justify' }}>Địa chỉ: {bill.diachi}</div>
                      
                      <div style={{ marginTop: 6, color: COLOR.text }}>Chỉ số đầu: {bill.chisodau}</div>
                      <div style={{ color: COLOR.text }}>Chỉ số cuối: {bill.chisocuoi}</div>
                      <div style={{ color: COLOR.text }}>Tiêu thụ: {bill.kltt} m³</div>
                      
                      <div style={{ marginTop: 6, color: COLOR.text }}>Tiền nước: {formatVND(bill.tiennuoc)}</div>
                      <div style={{ color: COLOR.text }}>Thuế: {formatVND(bill.tienthue)}</div>
                      <div style={{ color: COLOR.text }}>Phí: {formatVND(bill.tienphi)}</div>
                      <div style={{ fontWeight: 700, color: COLOR.title }}>Tổng: {formatVND(bill.tongtien)}</div>
                      
                      <div style={{ marginTop: 8 }}>
                        <span style={{ background: bill.hetno ? COLOR.green : COLOR.red, color: COLOR.white, borderRadius: "6px", padding: "4px 8px", fontWeight: 600 }}>
                          {bill.hetno ? "Đã thanh toán" : "Chưa thanh toán"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
