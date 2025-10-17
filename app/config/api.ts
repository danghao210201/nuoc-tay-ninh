interface ApiConfig {
  baseURL: string;
  endpoints: {
    searchPublicPetitions: string;
    petitionDetail: string;
    fileDownload: string;
  };
}

// Cấu hình mặc định
const defaultConfig: ApiConfig = {
  baseURL: "https://smart-api.tayninh.gov.vn",
  endpoints: {
    searchPublicPetitions: "/api/sso/search-public-petitions",
    petitionDetail: "/api/sso/petition-detail",
    fileDownload: "/api/sso/file",
  },
};

// Có thể override bằng environment variables hoặc config file
let currentConfig: ApiConfig = defaultConfig;

// Function để load config từ environment variables hoặc file khác
export async function loadApiConfig(): Promise<ApiConfig> {
  // Kiểm tra environment variables trước
  if (typeof window !== "undefined") {
    const customBaseURL = (window as any).__API_CONFIG__?.baseURL;
    if (customBaseURL) {
      currentConfig = {
        ...defaultConfig,
        baseURL: customBaseURL,
      };
    }
  }

  // Thử load từ config file (chỉ hoạt động khi build production)
  try {
    const configResponse = await fetch("/api.config.json");
    if (configResponse.ok) {
      const configData = await configResponse.json();
      currentConfig = {
        ...defaultConfig,
        ...configData,
      };
      console.log("Loaded API config from file:", currentConfig);
    }
  } catch (error) {
    console.log("Could not load config file, using default config");
  }

  return currentConfig;
}

// Synchronous version for immediate use
export function loadApiConfigSync(): ApiConfig {
  // Kiểm tra environment variables
  if (typeof window !== "undefined") {
    const customBaseURL = (window as any).__API_CONFIG__?.baseURL;
    if (customBaseURL) {
      currentConfig = {
        ...defaultConfig,
        baseURL: customBaseURL,
      };
    }
  }

  return currentConfig;
}

// Function để set config động
export function setApiConfig(config: Partial<ApiConfig>): void {
  currentConfig = {
    ...currentConfig,
    ...config,
  };
}

// Function để get config hiện tại
export function getApiConfig(): ApiConfig {
  return currentConfig;
}

// Helper functions để build URL
export function getApiBaseURL(): string {
  return getApiConfig().baseURL;
}

export function buildApiURL(
  endpoint: keyof ApiConfig["endpoints"],
  path?: string
): string {
  const config = getApiConfig();
  const endpointPath = config.endpoints[endpoint];
  const baseUrl = `${config.baseURL}${endpointPath}`;

  return path ? `${baseUrl}/${path}` : baseUrl;
}

export function buildFileDownloadURL(fileId: string): string {
  return buildApiURL("fileDownload", `${fileId}/download`);
}

// Initialize config với phiên bản sync
loadApiConfigSync();
