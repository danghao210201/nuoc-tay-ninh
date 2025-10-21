import { useState } from "react";
import { useNavigate } from "react-router";
import type { Route } from "./+types/home";
import { searchWaterCustomers, type WaterCustomer, getWaterConsumptions, type WaterConsumption } from "../services/api";

export function meta({ }: Route.MetaArgs) {
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
  // Tabs removed: hiển thị đồng thời hai phần tra cứu

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

      {/* <div style={{ padding: "24px 16px 0" }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: COLOR.title }}>
          Tra cứu hoá đơn nước
        </h2>
        <p style={{ margin: "6px 0 0", color: COLOR.muted }}>
          Tra cứu danh sách tiêu thụ theo mã khách hàng.
        </p>
      </div> */}

      <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>


        <>
          <div
            className="menu-card"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              padding: "18px",
              borderRadius: "14px",
              border: `1px solid ${COLOR.border}`,
              background: COLOR.white,
              boxShadow: "0 6px 16px rgba(17,24,39,0.06)",
            }}
          >
            <span aria-hidden style={{ color: COLOR.primaryBlue, display: "inline-flex", alignItems: "center", justifyContent: "center", width: "38px", height: "38px", background: "rgba(37,99,235,0.08)", borderRadius: "10px" }}>
              <svg
                width="22"
                height="22"
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
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <h3 style={{ margin: 0 }}>Tra cứu hoá đơn nước</h3>
                <span aria-hidden style={{ color: COLOR.iconBlue, display: "inline-flex" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M12 2C12 2 5 9 5 14a7 7 0 0 0 14 0c0-5-7-12-7-12z" />
                  </svg>
                </span>
              </div>
              <p style={{ margin: "6px 0 0", color: COLOR.muted }}>
                Xem lịch sử chỉ số, khối lượng tiêu thụ và hóa đơn thanh toán
              </p>
            </div>
          </div>

          {/* Quick search theo mã khách hàng (idkh) */}
          <div
            style={{
              marginTop: "12px",
              padding: "14px",
              background: COLOR.white,
              border: `1px solid ${COLOR.border}`,
              borderRadius: "14px",
              boxShadow: "0 4px 12px rgba(17,24,39,0.04)",
            }}
          >
            <div style={{ display: "flex", gap: "8px" }}>
              <div style={{ position: "relative", flex: 1 }}>
                <input
                  value={consIdkh}
                  onChange={(e) => setConsIdkh(e.target.value)}
                  placeholder="Nhập mã khách hàng..."
                  onFocus={() => setConsFocused(true)}
                  onBlur={() => setConsFocused(false)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    paddingRight: "40px",
                    fontSize: 15,
                    lineHeight: 1.4,
                    border: `1px solid ${consFocused ? COLOR.primaryBlue : COLOR.border}`,
                    borderRadius: "12px",
                    outline: "none",
                    transition: "box-shadow 0.2s ease, border-color 0.2s ease, background-color 0.2s ease",
                    boxShadow: consFocused ? "0 0 0 4px rgba(14,165,233,0.15)" : "none",
                    background: consFocused ? "#F5F9FF" : "#F9FAFB",
                  }}
                />
                {consIdkh && (
                  <button
                    type="button"
                    aria-label="Xoá nội dung"
                    onClick={() => setConsIdkh("")}
                    style={{
                      position: "absolute",
                      right: "8px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: "24px",
                      height: "24px",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "50%",
                      border: "none",
                      background: "transparent",
                      color: consFocused ? COLOR.primaryBlue : COLOR.muted,
                      cursor: "pointer",
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 6l12 12M18 6L6 18" />
                    </svg>
                  </button>
                )}
              </div>
              <button
                onClick={handleSearchBills}
                style={{
                  padding: "12px 16px",
                  borderRadius: "12px",
                  border: "none",
                  background: COLOR.primaryBlue,
                  color: COLOR.white,
                  fontWeight: 600,
                  cursor: "pointer",
                  outline: "none",
                  boxShadow: "0 6px 14px rgba(37,99,235,0.18)",
                  transition: "filter 0.2s ease",
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
                  padding: "10px 12px",
                  fontSize: 14,
                  border: `1px solid ${COLOR.border}`,
                  borderRadius: "12px",
                  outline: "none",
                  background: "#F9FAFB",
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
                  padding: "10px 12px",
                  fontSize: 14,
                  border: `1px solid ${COLOR.border}`,
                  borderRadius: "12px",
                  outline: "none",
                  background: "#F9FAFB",
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
                  <div key={bill.fkey} style={{ padding: "16px", border: `1px solid ${COLOR.border}`, borderRadius: "14px", background: COLOR.white, boxShadow: "0 4px 12px rgba(17,24,39,0.06)" }}>
                    {/* Header hóa đơn */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ fontWeight: 800, letterSpacing: 0.2, color: COLOR.title }}>THÔNG TIN HOÁ ĐƠN</div>
                    </div>

                    {/* Tổng quan KH & kỳ hóa đơn */}
                    <div style={{ marginTop: 8, display: "grid", gridTemplateColumns: "120px 1fr", rowGap: 6, columnGap: 10, fontSize: 14 }}>
                      <span style={{ color: COLOR.muted }}>Mã khách hàng:</span><span style={{ color: COLOR.text, fontWeight: 600 }}>{bill.idkh}</span>
                      <span style={{ color: COLOR.muted }}>Khách hàng:</span><span style={{ color: COLOR.text, fontWeight: 600 }}>{bill.tenkh}</span>
                      <span style={{ color: COLOR.muted }}>Kỳ hoá đơn:</span><span style={{ color: COLOR.text }}>{bill.kyhd}</span>
                      <span style={{ color: COLOR.muted }}>Số ĐB:</span><span style={{ color: COLOR.text }}>{bill.sodb}</span>
                      <span style={{ color: COLOR.muted }}>Địa chỉ:</span><span style={{ color: COLOR.text}}>{bill.diachi}</span>
                    </div>

                    {/* Mục: Thông tin hóa đơn */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderTop: `1px solid ${COLOR.border}`, marginTop: 12 }}>
                      <div style={{ fontWeight: 700, color: COLOR.title }}>Chi tiết chỉ số</div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", rowGap: 6, columnGap: 10, fontSize: 14 }}>
                      <span style={{ color: COLOR.muted }}>Chỉ số đầu:</span><span style={{ color: COLOR.text }}>{bill.chisodau}</span>
                      <span style={{ color: COLOR.muted }}>Chỉ số cuối:</span><span style={{ color: COLOR.text }}>{bill.chisocuoi}</span>
                      <span style={{ color: COLOR.muted }}>Khối lượng tiêu thụ:</span><span style={{ color: COLOR.text }}>{bill.kltt} m³</span>
                    </div>

                    {/* Mục: Tổng hợp */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderTop: `1px solid ${COLOR.border}`, marginTop: 12 }}>
                      <div style={{ fontWeight: 700, color: COLOR.title }}>Tổng hợp</div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", rowGap: 6, columnGap: 10, fontSize: 14 }}>
                      <span style={{ color: COLOR.muted }}>Tiền nước:</span><span style={{ color: COLOR.text }}>{formatVND(bill.tiennuoc)}</span>
                      <span style={{ color: COLOR.muted }}>Thuế:</span><span style={{ color: COLOR.text }}>{formatVND(bill.tienthue)}</span>
                      <span style={{ color: COLOR.muted }}>Phí:</span><span style={{ color: COLOR.text }}>{formatVND(bill.tienphi)}</span>
                      <span style={{ color: COLOR.title, fontWeight: 800 }}>Tổng:</span><span style={{ justifySelf: "start", width: "fit-content" }}><span style={{ marginLeft:"-15px", color: COLOR.primaryBlue, fontWeight: 800, fontSize: 16, background: "rgba(37,99,235,0.12)", padding: "6px 10px", borderRadius: "10px", boxShadow: "0 2px 6px rgba(37,99,235,0.12)", display: "inline-flex" }}>{formatVND(bill.tongtien)} đ</span></span>
                    </div>

                    {/* Trạng thái thanh toán */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 10, borderTop: `1px solid ${COLOR.border}`, marginTop: 12 }}>
                      <span aria-hidden style={{ color: bill.hetno ? COLOR.green : COLOR.red, display: "inline-flex", alignItems: "center", justifyContent: "center", width: 24, height: 24, background: bill.hetno ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)", borderRadius: 6 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      <div style={{ marginLeft: 2, display: "flex", alignItems: "center" }}>
                        <span style={{ background: bill.hetno ? "linear-gradient(135deg,#22c55e,#16a34a)" : "linear-gradient(135deg,#ef4444,#dc2626)", color: COLOR.white, borderRadius: "999px", padding: "6px 10px", fontWeight: 700, boxShadow: "0 2px 6px rgba(0,0,0,0.12)", display: "inline-flex", alignItems: "center" }}>
                          {bill.hetno ? "Đã thanh toán" : "Chưa thanh toán"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      </div>
    </div>
  );
}
