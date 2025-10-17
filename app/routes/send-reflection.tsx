import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import type { Route } from "./+types/send-reflection";
import { MapLocationPicker } from "../components/MapLocationPicker";
import {
  getReflectionFields,
  getReflectionTopics,
  uploadFiles,
  createPetition,
  getUserByTayNinhId,
  getWards,
  type FieldItem,
  type UploadedFile,
  type CreatePetitionRequest,
  type UserInfo,
  type WardItem,
  sendOtp,
  confirmOtp,
} from "../services/api";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Gửi phản ánh hiện trường" },
    { name: "description", content: "Gửi phản ánh hiện trường tỉnh Long An" },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
  ];
}

interface FormData {
  fullName: string;
  phoneNumber: string;
  content: string;
  fieldId: string; // ID lĩnh vực phản ánh
  topicId: string; // ID chuyên mục
  wardId: string; // ID xã/phường (bắt buộc)
  location: {
    latitude: number | null;
    longitude: number | null;
    address: string;
  };
  isPublic: boolean;
  isAnonymous: boolean; // Ẩn danh thông tin cá nhân
  files: File[];
}

export default function SendReflection() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  // State cho dropdown data
  const [reflectionFields, setReflectionFields] = useState<FieldItem[]>([]);
  const [reflectionTopics, setReflectionTopics] = useState<FieldItem[]>([]);
  const [wards, setWards] = useState<WardItem[]>([]);
  const [filteredWards, setFilteredWards] = useState<WardItem[]>([]);
  const [wardSearchTerm, setWardSearchTerm] = useState("");
  const [showWardDropdown, setShowWardDropdown] = useState(false);
  const [isLoadingFields, setIsLoadingFields] = useState(false);
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);
  const [isLoadingWards, setIsLoadingWards] = useState(false);

  // State cho success modal
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [petitionCode, setPetitionCode] = useState("");

  // State cho error modal
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // State cho user info
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoadingUserInfo, setIsLoadingUserInfo] = useState(false);
  // State cho OTP
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpPhoneNumber, setOtpPhoneNumber] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isConfirmingOtp, setIsConfirmingOtp] = useState(false);
  const [otpError, setOtpError] = useState("");

  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    phoneNumber: "",
    content: "",
    fieldId: "",
    topicId: "",
    wardId: "",
    location: {
      latitude: null,
      longitude: null,
      address: "",
    },
    isPublic: true,
    isAnonymous: true, // Mặc định ẩn danh
    files: [],
  });

  // Kiểm tra đăng nhập và lấy thông tin user
  useEffect(() => {
    const checkUserLogin = async () => {
      const tayNinhId = searchParams.get("tayninhid");

      if (tayNinhId) {
        setIsLoadingUserInfo(true);
        try {
          console.log("Fetching user info for TayNinhID:", tayNinhId);
          const userData = await getUserByTayNinhId(tayNinhId);
          setUserInfo(userData);

          // Tự động điền thông tin vào form
          setFormData((prev) => ({
            ...prev,
            fullName: userData.hoVaTen,
            phoneNumber: userData.soDienThoai,
          }));

          console.log("User info loaded successfully:", userData);
        } catch (error) {
          console.error("Error loading user info:", error);
          // Không hiển thị lỗi cho user vì có thể họ muốn nhập thủ công
        } finally {
          setIsLoadingUserInfo(false);
        }
      }
    };

    checkUserLogin();
  }, [searchParams]);

  // Load lĩnh vực phản ánh khi component mount
  useEffect(() => {
    const loadReflectionFields = async () => {
      setIsLoadingFields(true);
      try {
        const fields = await getReflectionFields();
        setReflectionFields(fields);
      } catch (error) {
        console.error("Error loading reflection fields:", error);
        // Có thể hiển thị thông báo lỗi cho user ở đây
      } finally {
        setIsLoadingFields(false);
      }
    };

    loadReflectionFields();
  }, []);

  // Load danh sách xã/phường khi component mount
  useEffect(() => {
    const loadWards = async () => {
      setIsLoadingWards(true);
      try {
        const wardsData = await getWards();
        setWards(wardsData);
        setFilteredWards(wardsData);
      } catch (error) {
        console.error("Error loading wards:", error);
        // Có thể hiển thị thông báo lỗi cho user ở đây
      } finally {
        setIsLoadingWards(false);
      }
    };

    loadWards();
  }, []);

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(".ward-search-container")) {
        setShowWardDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Load chuyên mục khi lĩnh vực thay đổi
  useEffect(() => {
    const loadReflectionTopics = async () => {
      if (!formData.fieldId) {
        setReflectionTopics([]);
        return;
      }

      setIsLoadingTopics(true);
      try {
        const topics = await getReflectionTopics(formData.fieldId);
        setReflectionTopics(topics);
        // Reset topic selection khi field thay đổi
        setFormData((prev) => ({ ...prev, topicId: "" }));
      } catch (error) {
        console.error("Error loading reflection topics:", error);
        setReflectionTopics([]);
      } finally {
        setIsLoadingTopics(false);
      }
    };

    loadReflectionTopics();
  }, [formData.fieldId]);

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Xử lý tìm kiếm xã/phường
  const handleWardSearch = (searchTerm: string) => {
    setWardSearchTerm(searchTerm);
    setShowWardDropdown(true);

    if (searchTerm.trim() === "") {
      setFilteredWards(wards);
    } else {
      const filtered = wards.filter((ward) =>
        ward.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredWards(filtered);
    }
  };

  // Chọn xã/phường từ dropdown
  const handleWardSelect = (ward: WardItem) => {
    setFormData((prev) => ({ ...prev, wardId: ward.id }));
    setWardSearchTerm(ward.name);
    setShowWardDropdown(false);
  };

  // Xóa lựa chọn xã/phường
  const handleWardClear = () => {
    setFormData((prev) => ({ ...prev, wardId: "" }));
    setWardSearchTerm("");
    setFilteredWards(wards);
    setShowWardDropdown(false);
  };

  const isValidPhoneNumber = (phone: string) => {
    return /^0\d{9,10}$/.test(phone.trim());
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Trình duyệt không hỗ trợ định vị GPS");
      return;
    }

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          // Sử dụng OpenStreetMap Nominatim API (miễn phí)
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1&accept-language=vi`
          );

          let address = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

          if (response.ok) {
            const data = await response.json();
            if (data && data.display_name) {
              address = data.display_name;
            }
          }

          setFormData((prev) => ({
            ...prev,
            location: {
              latitude,
              longitude,
              address,
            },
          }));
        } catch (error) {
          console.error("Error getting address:", error);
          setFormData((prev) => ({
            ...prev,
            location: {
              latitude,
              longitude,
              address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            },
          }));
        } finally {
          setIsGettingLocation(false);
        }
      },
      (error) => {
        console.error("Error getting location:", error);
        alert(
          "Không thể lấy vị trí hiện tại. Vui lòng kiểm tra quyền truy cập vị trí."
        );
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000, // 5 minutes
      }
    );
  };

  const handleMapLocationSelect = (
    lat: number,
    lng: number,
    address?: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      location: {
        latitude: lat,
        longitude: lng,
        address: address || `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
      },
    }));
  };

  const getFileType = (file: File) => {
    if (file.type.startsWith("image/")) return "image";
    if (file.type.startsWith("video/")) return "video";
    return "document";
  };

  const getFileIcon = (file: File) => {
    const type = getFileType(file);

    if (type === "image") {
      return (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
        </svg>
      );
    }

    if (type === "video") {
      return (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polygon points="23 7 16 12 23 17 23 7" />
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
        </svg>
      );
    }

    return (
      <svg
        width="20"
        height="20"
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
    );
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);

    // Kiểm tra kích thước file (giới hạn 50MB mỗi file)
    const oversizedFiles = selectedFiles.filter(
      (file) => file.size > 50 * 1024 * 1024
    );
    if (oversizedFiles.length > 0) {
      alert(
        "Một số file quá lớn (tối đa 50MB mỗi file). Vui lòng chọn file nhỏ hơn."
      );
      return;
    }

    setFormData((prev) => ({
      ...prev,
      files: [...prev.files, ...selectedFiles].slice(0, 10), // Giới hạn 10 file
    }));

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName.trim()) {
      alert("Vui lòng nhập họ và tên");
      return;
    }

    if (!formData.phoneNumber.trim()) {
      alert("Vui lòng nhập số điện thoại");
      return;
    }

    if (!formData.content.trim()) {
      alert("Vui lòng nhập nội dung phản ánh");
      return;
    }

    if (!formData.fieldId) {
      alert("Vui lòng chọn lĩnh vực phản ánh");
      return;
    }

    if (!formData.topicId) {
      alert("Vui lòng chọn chuyên mục");
      return;
    }

    if (!formData.wardId) {
      alert("Vui lòng chọn xã/phường");
      return;
    }

    if (formData.files.length === 0) {
      alert("Vui lòng đính kèm ít nhất một file (ảnh, video hoặc tài liệu)");
      return;
    }

    // Kiểm tra định dạng số điện thoại trước khi gửi OTP
    if (!isValidPhoneNumber(formData.phoneNumber)) {
      alert("Số điện thoại không hợp lệ (bắt đầu bằng 0, 10–11 số)");
      return;
    }

    // Gửi OTP và hiển thị popup nhập OTP
    try {
      setIsSendingOtp(true);
      const phone = formData.phoneNumber.trim();
      await sendOtp(phone);
      setOtpPhoneNumber(phone);
      setShowOtpModal(true);
    } catch (err) {
      console.error("Error sending OTP:", err);
      alert(
        err instanceof Error
          ? err.message
          : "Không thể gửi OTP, vui lòng thử lại"
      );
    } finally {
      setIsSendingOtp(false);
    }
    return;
  };

  // Gửi phản ánh sau khi xác thực OTP thành công
  const proceedWithSubmission = async () => {
    setIsSubmitting(true);
    try {
      // 1. Upload files nếu có
      let uploadedFiles: UploadedFile[] = [];
      if (formData.files.length > 0) {
        console.log("Uploading files...");
        uploadedFiles = await uploadFiles(formData.files);
        console.log("Files uploaded successfully:", uploadedFiles);
      }

      // 2. Tìm thông tin topic đã chọn
      const selectedTopic = reflectionTopics.find(
        (topic) => topic.id === formData.topicId
      );
      if (!selectedTopic) {
        throw new Error("Không tìm thấy thông tin chuyên mục");
      }

      // 3. Tạo payload cho API create petition
      const petitionData: CreatePetitionRequest = {
        typeRequestName: "",
        reporterLocation: {},
        tag: {
          id: selectedTopic.id,
          integratedCode: selectedTopic.integratedCode,
          primaryColor: selectedTopic.primaryColor,
          parentId: selectedTopic.parentId || formData.fieldId,
          name: selectedTopic.name,
        },
        reporter: {
          fullname: formData.fullName,
          phone: formData.phoneNumber,
          identityId: userInfo?.soCmnd || "",
          type: 1,
          address: null,
          id: "686ff199d391d56ac864dcf9",
          username: "",
        },
        takePlaceOn: new Date().toISOString(),
        description: formData.content,
        takePlaceAt: {
          latitude: formData.location.latitude?.toString() || "",
          longitude: formData.location.longitude?.toString() || "",
          fullAddress: formData.location.address || "",
          place: [
            {
              id: formData.wardId,
              typeId: "5ee304423167922ac55bea02",
              name: wards.find((ward) => ward.id === formData.wardId)?.name || "",
            },
            {
              id: "5def47c5f47614018c000080",
              typeId: "5ee304423167922ac55bea01",
              name: "Tỉnh Tây Ninh",
            },
          ],
        },
        sendSms: false,
        isPublic: formData.isPublic,
        file: uploadedFiles.map((file) => ({
          id: file.id,
          name: file.filename,
          group: 1,
          updateDate: new Date().toISOString(),
          size: file.size,
        })),
        thumbnailId: uploadedFiles.length > 0 ? uploadedFiles[0].id : "",
        isAnonymous: formData.isAnonymous,
        requiredSecret: false,
        receptionMethod: "6875f999aa2b7760605d92b7",
        openAddress: false,
        takePlaceVillage: "",
        takePlaceTown: "684cc8119d5b7c13db810596",
        takePlaceProvince: "5def47c5f47614018c000080",
        acceptByAgencyAndPlaceEnable: false,
        acceptAgencyId: "",
        captcha: "",
        title: selectedTopic.name,
      };

      // 4. Gọi API create petition
      console.log("Creating petition...", petitionData);
      const result = await createPetition(petitionData);
      console.log("Petition created successfully:", result);

      setPetitionCode(result.code);
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error submitting reflection:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Lỗi không xác định khi gửi phản ánh"
      );
      setShowErrorModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmOtp = async () => {
    if (!otpCode.trim()) {
      setOtpError("Vui lòng nhập mã OTP");
      return;
    }
    try {
      setIsConfirmingOtp(true);
      await confirmOtp(otpPhoneNumber, otpCode.trim());
      setShowOtpModal(false);
      setOtpError("");
      setOtpCode("");
      await proceedWithSubmission();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Xác thực OTP không thành công.Hãy nhập đúng mã xác thực OTP";
      setOtpError(msg);
    } finally {
      setIsConfirmingOtp(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    setPetitionCode("");
    navigateWithParams("/");
  };

  const handleErrorModalClose = () => {
    setShowErrorModal(false);
    setErrorMessage("");
  };

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
    <div className="send-reflection-container">
      {/* Header trong suốt */}
      <div className="send-header-transparent">
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

      <form onSubmit={handleSubmit} className="send-reflection-form">
        {/* Thông tin người gửi */}
        <div className="form-section">
          <div className="form-group">
            <label htmlFor="fullName" className="form-label">
              Họ và tên <span className="required">*</span>
            </label>
            <input
              type="text"
              id="fullName"
              className="form-input"
              value={formData.fullName}
              onChange={(e) => handleInputChange("fullName", e.target.value)}
              placeholder={
                isLoadingUserInfo ? "Đang tải thông tin..." : "Nhập họ và tên"
              }
              disabled={isLoadingUserInfo}
              readOnly={!!userInfo}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phoneNumber" className="form-label">
              Số điện thoại <span className="required">*</span>
            </label>
            <input
              type="tel"
              id="phoneNumber"
              className="form-input"
              value={formData.phoneNumber}
              onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
              placeholder={
                isLoadingUserInfo
                  ? "Đang tải thông tin..."
                  : "Nhập số điện thoại"
              }
              disabled={isLoadingUserInfo}
              readOnly={!!userInfo}
              required
            />
          </div>
        </div>

        {/* Thông tin phản ánh */}
        <div className="form-section">
          <div className="form-group">
            <label htmlFor="content" className="form-label">
              Nội dung phản ánh <span className="required">*</span>
            </label>
            <textarea
              id="content"
              className="form-textarea"
              value={formData.content}
              onChange={(e) => handleInputChange("content", e.target.value)}
              placeholder="Mô tả chi tiết nội dung phản ánh..."
              rows={5}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="fieldId" className="form-label">
              Lĩnh vực phản ánh <span className="required">*</span>
            </label>
            <select
              id="fieldId"
              className="form-select"
              value={formData.fieldId}
              onChange={(e) => handleInputChange("fieldId", e.target.value)}
              required
              disabled={isLoadingFields}
            >
              <option value="">
                {isLoadingFields ? "Đang tải..." : "-- Chọn lĩnh vực --"}
              </option>
              {reflectionFields.map((field) => (
                <option key={field.id} value={field.id}>
                  {field.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="topicId" className="form-label">
              Chuyên mục <span className="required">*</span>
            </label>
            <select
              id="topicId"
              className="form-select"
              value={formData.topicId}
              onChange={(e) => handleInputChange("topicId", e.target.value)}
              required
              disabled={!formData.fieldId || isLoadingTopics}
            >
              <option value="">
                {!formData.fieldId
                  ? "-- Vui lòng chọn lĩnh vực trước --"
                  : isLoadingTopics
                    ? "Đang tải..."
                    : "-- Chọn chuyên mục --"}
              </option>
              {reflectionTopics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="wardId" className="form-label">
              Xã/Phường <span className="required">*</span>
            </label>
            <div
              className="ward-search-container"
              style={{ position: "relative" }}
            >
              <input
                type="text"
                id="wardId"
                className="form-input"
                value={wardSearchTerm}
                onChange={(e) => handleWardSearch(e.target.value)}
                onFocus={() => setShowWardDropdown(true)}
                placeholder={
                  isLoadingWards
                    ? "Đang tải..."
                    : "Nhập tên xã/phường để tìm kiếm..."
                }
                disabled={isLoadingWards}
                autoComplete="off"
              />
              {wardSearchTerm && (
                <button
                  type="button"
                  onClick={handleWardClear}
                  style={{
                    position: "absolute",
                    right: "8px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "16px",
                    color: "#666",
                  }}
                >
                  ×
                </button>
              )}
              {showWardDropdown && filteredWards.length > 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    backgroundColor: "white",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    maxHeight: "200px",
                    overflowY: "auto",
                    zIndex: 1000,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                >
                  {filteredWards.map((ward) => (
                    <div
                      key={ward.id}
                      onClick={() => handleWardSelect(ward)}
                      style={{
                        padding: "8px 12px",
                        cursor: "pointer",
                        borderBottom: "1px solid #eee",
                        backgroundColor:
                          formData.wardId === ward.id ? "#f0f0f0" : "white",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#f5f5f5";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor =
                          formData.wardId === ward.id ? "#f0f0f0" : "white";
                      }}
                    >
                      {ward.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Vị trí phản ánh</label>
            <div className="location-section">
              <div className="location-buttons">
                <button
                  type="button"
                  className="location-btn"
                  onClick={getCurrentLocation}
                  disabled={isGettingLocation}
                >
                  {isGettingLocation ? (
                    <div className="location-loading">
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
                      Đang lấy vị trí...
                    </div>
                  ) : (
                    <>
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
                      Vị trí hiện tại
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="map-btn"
                  onClick={() => setIsMapModalOpen(true)}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
                    <line x1="8" y1="2" x2="8" y2="18" />
                    <line x1="16" y1="6" x2="16" y2="22" />
                  </svg>
                  Chọn từ bản đồ
                </button>
              </div>

              {formData.location.address && (
                <div className="location-display">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span>{formData.location.address}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tùy chọn công khai */}
        <div className="form-section">
          <div className="radio-group">
            <label className="radio-option">
              <input
                type="radio"
                name="isPublic"
                checked={formData.isPublic === true}
                onChange={() => handleInputChange("isPublic", true)}
              />
              <span className="radio-custom"></span>
              <span className="radio-label">Công khai phản ánh</span>
            </label>

            <label className="radio-option">
              <input
                type="radio"
                name="isPublic"
                checked={formData.isPublic === false}
                onChange={() => handleInputChange("isPublic", false)}
              />
              <span className="radio-custom"></span>
              <span className="radio-label">Không công khai</span>
            </label>
          </div>
        </div>

        {/* Thông tin cá nhân */}
        <div className="form-section">
          <h3 className="section-title">Thông tin cá nhân</h3>
          <div className="radio-group">
            <label className="radio-option">
              <input
                type="radio"
                name="isAnonymous"
                checked={formData.isAnonymous === false}
                onChange={() => handleInputChange("isAnonymous", false)}
              />
              <span className="radio-custom"></span>
              <span className="radio-label">Công khai thông tin cá nhân</span>
            </label>

            <label className="radio-option">
              <input
                type="radio"
                name="isAnonymous"
                checked={formData.isAnonymous === true}
                onChange={() => handleInputChange("isAnonymous", true)}
              />
              <span className="radio-custom"></span>
              <span className="radio-label">
                Không công khai thông tin cá nhân (ẩn danh)
              </span>
            </label>
          </div>
        </div>

        {/* Đính kèm ảnh */}
        <div className="form-section">
          <h3 className="section-title">
            Đính kèm file <span className="required">*</span>
          </h3>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="*/*"
            multiple
            className="hidden-input"
          />

          <button
            type="button"
            className="file-upload-btn"
            onClick={() => fileInputRef.current?.click()}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </svg>
            Chọn hình ảnh, video, file từ thiết bị
          </button>

          {formData.files.length > 0 && (
            <div className="file-preview-grid">
              {formData.files.map((file, index) => (
                <div key={index} className="file-preview-item">
                  {getFileType(file) === "image" ? (
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index + 1}`}
                      className="file-preview-image"
                    />
                  ) : getFileType(file) === "video" ? (
                    <div className="file-preview-video">
                      <video
                        src={URL.createObjectURL(file)}
                        className="file-preview-video-element"
                        muted
                      />
                      <div className="video-overlay">
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="white"
                        >
                          <polygon points="5,3 19,12 5,21 5,3" />
                        </svg>
                      </div>
                    </div>
                  ) : (
                    <div className="file-preview-document">
                      {getFileIcon(file)}
                      <span className="file-name">{file.name}</span>
                      <span className="file-size">
                        {(file.size / 1024 / 1024).toFixed(1)} MB
                      </span>
                    </div>
                  )}
                  <button
                    type="button"
                    className="file-remove-btn"
                    onClick={() => removeFile(index)}
                  >
                    <svg
                      width="16"
                      height="16"
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
              ))}
            </div>
          )}

          {formData.files.length > 0 && (
            <p className="file-count">
              Đã chọn {formData.files.length}/10 file
            </p>
          )}
        </div>

        {/* Nút gửi */}
        <div className="form-section">
          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
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
                Đang gửi...
              </>
            ) : (
              <>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22,2 15,22 11,13 2,9 22,2" />
                </svg>
                Gửi phản ánh
              </>
            )}
          </button>
        </div>
      </form>

      <MapLocationPicker
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        onLocationSelect={handleMapLocationSelect}
        initialLocation={
          formData.location.latitude && formData.location.longitude
            ? {
              latitude: formData.location.latitude,
              longitude: formData.location.longitude,
            }
            : undefined
        }
      />

      {/* OTP Modal */}
      {showOtpModal && (
        <div className="otp-modal-overlay">
          <div className="otp-modal-content">
            <div className="otp-modal-header">
              <div className="otp-icon">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 2l7 4v5c0 5-3.8 9-7 11-3.2-2-7-6-7-11V6l7-4z" />
                  <polyline points="9,12 11,14 15,10" />
                </svg>
              </div>
              <h3>Xác thực OTP</h3>
            </div>

            <div className="otp-modal-body">
              <p>
                OTP đã gửi tới số <strong>{otpPhoneNumber}</strong>
              </p>
              <p className="otp-help-text">
                Vui lòng nhập mã OTP để xác nhận gửi phản ánh.
              </p>
              <input
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                className="otp-input"
                value={otpCode}
                onChange={(e) =>
                  setOtpCode(e.target.value.replace(/\D/g, ""))
                }
                placeholder="Nhập mã OTP"
                autoFocus
              />
              {otpError && <p className="otp-error-text">{otpError}</p>}
            </div>

            <div className="otp-modal-actions">
              <button
                type="button"
                className="otp-confirm-btn"
                onClick={handleConfirmOtp}
                disabled={isConfirmingOtp || !otpCode.trim()}
              >
                {isConfirmingOtp ? "Đang xác thực..." : "Xác nhận"}
              </button>
              <button
                type="button"
                className="otp-cancel-btn"
                onClick={() => setShowOtpModal(false)}
                disabled={isConfirmingOtp}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="error-modal-overlay">
          <div className="error-modal-content">
            <div className="error-modal-header">
              <div className="error-icon">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              </div>
              <h3>Gửi phản ánh thất bại!</h3>
            </div>

            <div className="error-modal-body">
              <p>Đã xảy ra lỗi trong quá trình gửi phản ánh của bạn.</p>
              <div className="error-details">
                <span className="error-label">Chi tiết lỗi:</span>
                <span className="error-value">{errorMessage}</span>
              </div>
              <p className="error-note">
                Vui lòng thử lại sau ít phút hoặc liên hệ bộ phận hỗ trợ.
              </p>
            </div>

            <div className="error-modal-footer">
              <button
                className="error-modal-btn"
                onClick={handleErrorModalClose}
              >
                Thử lại
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="success-modal-overlay">
          <div className="success-modal-content">
            <div className="success-modal-header">
              <div className="success-icon">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22,4 12,14.01 9,11.01" />
                </svg>
              </div>
              <h3>Gửi phản ánh thành công!</h3>
            </div>

            <div className="success-modal-body">
              <p>Phản ánh của bạn đã được ghi nhận thành công.</p>
              <div className="petition-code">
                <span className="code-label">Mã phản ánh:</span>
                <span className="code-value">{petitionCode}</span>
              </div>
              <p className="code-note">
                Vui lòng lưu lại mã phản ánh để theo dõi tình trạng xử lý.
              </p>
            </div>

            <div className="success-modal-footer">
              <button
                className="success-modal-btn"
                onClick={handleSuccessModalClose}
              >
                Quay lại
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
