import { buildApiURL } from "../config/api";

export interface ApiResponse {
  content: any[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  last: boolean;
  first: boolean;
  numberOfElements: number;
}

export interface SearchParams {
  page?: number;
  size?: number;
  status?: number;
  excludeParentTag?: string;
}

export interface PetitionDetail {
  title: string;
  code: string;
  description: string;
  status: number;
  statusDescription: string;
  tag: {
    id: string;
    parentId: string;
    name: string;
  };
  takePlaceOn: string;
  receiptDate: string;
  createdDate: string;
  dueDate: string;
  agency: {
    id: string;
    name: string;
  };
  takePlaceAt: {
    latitude: number;
    longitude: number;
    fullAddress: string;
    place: Array<{
      id: string;
      typeId: string;
      name: string;
    }>;
  };
  file: Array<{
    id: string;
    name: string;
    group: number[];
    updatedDate: string;
  }>;
  thumbnailId: string;
  reaction: {
    satisfied: number;
    normal: number;
    unsatisfied: number;
    verySatisfied: number;
    veryUnsatisfied: number;
  };
  result?: {
    content: string;
    date: string;
    agency: {
      id: string;
      name: string;
    };
    isPublic: boolean;
    approved: boolean;
  };
  resultArray: Array<{
    content: string;
    date: string;
    agency: {
      id: string;
      code?: string;
      name: string;
    };
    isPublic: boolean;
    approved: boolean;
  }>;
}

// Mock data fallback để demo khi API không khả dụng
const mockApiResponse: ApiResponse = {
  content: [
    {
      id: "demo-1",
      title: "Demo: Phản ánh đường hư hỏng tại khu vực trung tâm",
      description:
        "Đoạn đường từ cầu A đến ngã tư B bị hư hỏng nghiêm trọng, cần được sửa chữa gấp",
      createdDate: "2025-01-02T10:30:00.000Z",
      takePlaceAt: {
        fullAddress: "Ngã tư Bình Chánh, Quận 8, TP.HCM",
      },
      thumbnailId: "demo-thumb-1",
      tag: {
        name: "Hạ tầng giao thông",
      },
      status: 3,
      statusDescription: "Hoàn thành",
      file: [
        {
          id: "f1",
          name: "demo1.jpg",
          group: [1],
          updatedDate: "2025-01-02T10:30:00.000Z",
        },
      ],
    },
    {
      id: "demo-2",
      title: "Demo: Ô nhiễm môi trường tại khu công nghiệp",
      description:
        "Khu công nghiệp ABC xả nước thải không qua xử lý ra sông, gây ô nhiễm nghiêm trọng",
      createdDate: "2025-01-01T14:15:00.000Z",
      takePlaceAt: {
        fullAddress: "Khu công nghiệp ABC, Long An",
      },
      thumbnailId: "demo-thumb-2",
      tag: {
        name: "Môi trường",
      },
      status: 2,
      statusDescription: "Đang xử lý",
      file: [
        {
          id: "f2",
          name: "demo2.jpg",
          group: [1],
          updatedDate: "2025-01-01T14:15:00.000Z",
        },
        {
          id: "f3",
          name: "demo3.jpg",
          group: [1],
          updatedDate: "2025-01-01T14:16:00.000Z",
        },
      ],
    },
  ],
  totalPages: 1,
  totalElements: 2,
  size: 10,
  number: 0,
  last: true,
  first: true,
  numberOfElements: 2,
};

// Mock detail data
const mockPetitionDetail: PetitionDetail = {
  title: "Demo: Phản ánh đèn đường hỏng",
  code: "02012025-001",
  description:
    "Phản ánh tình trạng đèn đường khu vực cầu k21 (Tân Phước Tân Bình Tp. Tây Ninh) ban ngày thì bật đèn đêm đèn lại tắt. Mong được hỗ trợ. Xin thành thật cảm ơn.",
  status: 3,
  statusDescription: "Hoàn thành",
  tag: {
    id: "demo-tag-1",
    parentId: "demo-parent-1",
    name: "Hạ tầng đô thị",
  },
  takePlaceOn: "2025-01-02T03:33:00.000Z",
  receiptDate: "2025-01-02T06:48:03.913Z",
  createdDate: "2025-01-02T03:37:35.252Z",
  dueDate: "2025-01-14T06:48:00.000Z",
  agency: {
    id: "demo-agency-1",
    name: "UBND Thành Phố Tây Ninh",
  },
  takePlaceAt: {
    latitude: 0.0,
    longitude: 0.0,
    fullAddress: "Tỉnh Tây Ninh, Tỉnh Tây Ninh, Việt Nam",
    place: [
      {
        id: "demo-place-1",
        typeId: "demo-type-1",
        name: "Tỉnh Tây Ninh",
      },
    ],
  },
  file: [
    {
      id: "demo-file-1",
      name: "demo-image-1.jpg",
      group: [1],
      updatedDate: "2025-01-02T11:37:36.890Z",
    },
  ],
  thumbnailId: "demo-thumb-1",
  reaction: {
    satisfied: 0,
    normal: 0,
    unsatisfied: 0,
    verySatisfied: 0,
    veryUnsatisfied: 0,
  },
  result: {
    content:
      "Chào bạn, UBND thành phố đã khắc phục xong hệ thống chiếu sáng tại vị trí trên.\n\nTrân trọng./",
    date: "2025-01-02T15:31:20.000Z",
    agency: {
      id: "demo-agency-1",
      name: "UBND Thành Phố Tây Ninh",
    },
    isPublic: true,
    approved: true,
  },
  resultArray: [
    {
      content:
        "Chào bạn, UBND thành phố đã khắc phục xong hệ thống chiếu sáng tại vị trí trên.\n\nTrân trọng./",
      date: "2025-01-02T15:31:20.000Z",
      agency: {
        id: "demo-agency-1",
        code: "H39.26",
        name: "UBND Thành Phố Tây Ninh",
      },
      isPublic: true,
      approved: true,
    },
  ],
};

export const petitionApi = {
  async searchPublicPetitions(params: SearchParams = {}): Promise<ApiResponse> {
    const defaultParams = {
      page: 0,
      size: 10,
      "exclude-parent-tag": "642cc9c5ba7d1606dfa291c9",
      ...params,
    };

    // Chuyển đổi params thành query string
    const queryParams = new URLSearchParams();
    Object.entries(defaultParams).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });

    try {
      const apiUrl = buildApiURL("searchPublicPetitions");
      const response = await fetch(`${apiUrl}?${queryParams.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.warn("API server không khả dụng, sử dụng mock data:", error);

      // Fallback to mock data with filtering
      const filteredContent = mockApiResponse.content.filter((item) => {
        if (params.status !== undefined) {
          return item.status === params.status;
        }
        return true;
      });

      return {
        ...mockApiResponse,
        content: filteredContent,
        totalElements: filteredContent.length,
        numberOfElements: filteredContent.length,
      };
    }
  },

  async getPetitionDetail(id: string): Promise<PetitionDetail> {
    try {
      const apiUrl = buildApiURL("petitionDetail", id);
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.warn(
        "API server không khả dụng, sử dụng mock detail data:",
        error
      );

      // Return mock detail data
      return mockPetitionDetail;
    }
  },
};

// Interface for field response
export interface FieldItem {
  id: string;
  code: string | null;
  integratedCode: string | null;
  primaryColor: string | null;
  iconId: string;
  order: number;
  status: number;
  parentId: string | null;
  createdDate: string;
  name: string;
  description: string | null;
}

export interface FieldResponse {
  content: FieldItem[];
  pageable: {
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
    offset: number;
    pageNumber: number;
    pageSize: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  sort: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

/**
 * Lấy danh sách lĩnh vực phản ánh
 */
export async function getReflectionFields(): Promise<FieldItem[]> {
  try {
    const response = await fetch(
      "https://smart-api.tayninh.gov.vn/api/sso/tags-by-parent-id?category-id=5f3a491c4e1bd312a6f00003&page=0&keyword=&sort=order",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch reflection fields: ${response.status}`);
    }

    const data: FieldResponse = await response.json();
    return data.content || [];
  } catch (error) {
    console.error("Error fetching reflection fields:", error);
    throw error;
  }
}

/**
 * Lấy danh sách chuyên mục theo lĩnh vực
 */
export async function getReflectionTopics(
  parentId: string
): Promise<FieldItem[]> {
  try {
    const response = await fetch(
      `https://smart-api.tayninh.gov.vn/api/sso/tags-by-category-id?category-id=5f3a491c4e1bd312a6f00003&parent-id=${parentId}&page=0&keyword=&sort=order`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch reflection topics: ${response.status}`);
    }

    const data: FieldResponse = await response.json();
    return data.content || [];
  } catch (error) {
    console.error("Error fetching reflection topics:", error);
    throw error;
  }
}

// Interface for file upload response
export interface UploadedFile {
  id: string;
  filename: string;
  size: number;
  uuid: string | null;
}

// Interface for petition creation
export interface CreatePetitionRequest {
  typeRequestName: string;
  reporterLocation: object;
  tag: {
    id: string;
    integratedCode: string | null;
    primaryColor: string | null;
    parentId: string;
    name: string;
  };
  reporter: {
    fullname: string;
    phone: string;
    identityId: string;
    type: number;
    address: string | null;
    id: string;
    username: string;
  };
  takePlaceOn: string;
  description: string;
  takePlaceAt: {
    latitude: string;
    longitude: string;
    fullAddress: string;
    place: any[];
  };
  sendSms: boolean;
  isPublic: boolean;
  file: Array<{
    id: string;
    name: string;
    group: number;
    updateDate: string;
    size: number;
  }>;
  thumbnailId: string;
  isAnonymous: boolean;
  requiredSecret: boolean;
  receptionMethod: string;
  openAddress: boolean;
  takePlaceVillage: string;
  takePlaceTown: string;
  takePlaceProvince: string;
  acceptByAgencyAndPlaceEnable: boolean;
  acceptAgencyId: string;
  captcha: string;
  title: string;
}

export interface CreatePetitionResponse {
  id: string;
  code: string;
}

/**
 * Upload multiple files
 */
export async function uploadFiles(files: File[]): Promise<UploadedFile[]> {
  try {
    const formData = new FormData();

    files.forEach((file) => {
      formData.append("files", file);
    });

    const response = await fetch(
      "https://smart-api.tayninh.gov.vn/api/sso/file-upload-multiple",
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to upload files: ${response.status}`);
    }

    const uploadedFiles: UploadedFile[] = await response.json();
    return uploadedFiles;
  } catch (error) {
    console.error("Error uploading files:", error);
    throw error;
  }
}

/**
 * Create petition
 */
export async function createPetition(
  petitionData: CreatePetitionRequest
): Promise<CreatePetitionResponse> {
  try {
    const response = await fetch(
      "https://smart-api.tayninh.gov.vn/api/sso/create-petition",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(petitionData),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to create petition: ${response.status}`);
    }

    const result: CreatePetitionResponse = await response.json();
    return result;
  } catch (error) {
    console.error("Error creating petition:", error);
    throw error;
  }
}

// Interface for ward/commune information
export interface WardItem {
  id: string;
  name: string;
}

// Interface for user information
export interface UserInfo {
  soDienThoai: string;
  hoVaTen: string;
  soCmnd: string;
  ngayThangNamSinh: string;
  donViId: number;
  id: number;
  maQuyen: string;
}

/**
 * Lấy thông tin người dùng từ TayNinhID
 */
export async function getUserByTayNinhId(tayNinhId: string): Promise<UserInfo> {
  try {
    const response = await fetch(
      "https://smart.tayninh.gov.vn/api/Users/getNguoiDanByTayNinhId",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          TayNinhID: tayNinhId,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch user info: ${response.status}`);
    }

    const userInfo: UserInfo = await response.json();
    return userInfo;
  } catch (error) {
    console.error("Error fetching user info:", error);
    throw error;
  }
}

// Interface for personal petitions response
export interface PersonalPetition {
  num: number;
  id: string;
  title: string;
  code: string;
  description: string;
  status: number;
  statusDescription: string;
  isFirstStep: boolean;
  takePlaceAt: {
    latitude: number;
    longitude: number;
    fullAddress: string;
    place: any[];
  };
  thumbnailId: string;
  reaction: {
    satisfied: number;
    normal: number;
    unsatisfied: number;
    verySatisfied: number;
    veryUnsatisfied: number;
  };
  reporter: {
    id: string;
    username: string;
    fullname: string;
    phone: string;
    identityId: string;
    type: number;
  };
  dueDate: string;
  createdDate: string;
  tag: {
    id: string;
    parentId: string;
    name: string;
  };
}

export interface PersonalPetitionsResponse {
  content: PersonalPetition[];
  pageable: {
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
    offset: number;
    pageNumber: number;
    pageSize: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  size: number;
  number: number;
  sort: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

/**
 * Lấy danh sách phản ánh theo số điện thoại
 */
export async function getPersonalPetitions(
  phone: string,
  page: number = 0,
  size: number = 10
): Promise<PersonalPetitionsResponse> {
  try {
    const response = await fetch(
      `https://smart-api.tayninh.gov.vn/api/sso/petition-by-categories-v2?page=${page}&size=${size}&reporter-phone=${phone}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch personal petitions: ${response.status}`);
    }

    const data: PersonalPetitionsResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching personal petitions:", error);
    throw error;
  }
}

/**
 * Lấy danh sách xã/phường
 */
export async function getWards(): Promise<WardItem[]> {
  try {
    const response = await fetch(
      "https://smart-api.tayninh.gov.vn/api/sso/places/search?nation-id=5f39f4a95224cf235e134c5c&parent-type-id=5ee304423167922ac55bea02&parent-id=5def47c5f47614018c000080",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch wards: ${response.status}`);
    }

    const data = await response.json();
    // Chỉ lấy id và name, bỏ qua trường parent
    return data.map((item: any) => ({
      id: item.id,
      name: item.name,
    }));
  } catch (error) {
    console.error("Error fetching wards:", error);
    throw error;
  }
}

/**
 * Gửi OTP đến số điện thoại
 * form-data: phoneNumber
 */
export async function sendOtp(
  phoneNumber: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const formData = new FormData();
    formData.append("phoneNumber", phoneNumber.trim());

    const response = await fetch(
      "https://smart-api.tayninh.gov.vn/api/sso/otp",
      {
        method: "POST",
        body: formData,
      }
    );

    let message: string | undefined;
    try {
      const data = await response.json();
      message = data?.message;
    } catch {
      // Response có thể không phải JSON
    }

    if (!response.ok) {
      throw new Error(message || `Failed to send OTP: ${response.status}`);
    }

    return { success: true, message };
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw error instanceof Error
      ? error
      : new Error("Không thể gửi OTP, vui lòng thử lại");
  }
}

/**
 * Xác nhận OTP
 * params: phone-number, otp
 */
export async function confirmOtp(
  phoneNumber: string,
  otp: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const params = new URLSearchParams({
      "phone-number": phoneNumber.trim(),
      otp: otp.trim(),
    });

    const response = await fetch(
      `https://smart-api.tayninh.gov.vn/api/sso/otp/confirm?${params.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    let data: any = null;
    try {
      data = await response.json();
    } catch {
      // Response có thể không phải JSON
    }

    if (!response.ok) {
      const msg = data?.message || "Xác thực OTP không thành công.Hãy nhập đúng mã xác thực OTP";
      throw new Error(msg);
    }

    return { success: true, message: data?.message };
  } catch (error) {
    console.error("Error confirming OTP:", error);
    throw error instanceof Error
      ? error
      : new Error("Không thể xác thực OTP, vui lòng thử lại");
  }
}
