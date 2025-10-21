import { buildApiURL } from "../config/api";

// ========================
// Water (Cấp Nước LA) API
// ========================
const WATER_API_BASE = import.meta.env.DEV ? "/api-tayninh" : "https://api.tayninh.gov.vn";
const WATER_API_CLIENT_ID = "McstjwK9JpqTO5RUMt_IosfuUOsa";
const WATER_API_CLIENT_SECRET = "ABfOR2YwpMkoKUq7uo0HtQkp8Cca";

interface WaterTokenResponse {
  access_token: string;
  scope: string;
  token_type: string;
  expires_in: number;
}

let waterTokenCache: { token: string; expiresAt: number } | null = null;

async function requestWaterApiToken(): Promise<string> {
  // Trả về token từ cache nếu còn hạn, giảm số lần gọi token endpoint
  if (waterTokenCache && Date.now() < waterTokenCache.expiresAt) {
    return waterTokenCache.token;
  }

  const basic = typeof btoa !== "undefined"
    ? btoa(`${WATER_API_CLIENT_ID}:${WATER_API_CLIENT_SECRET}`)
    : Buffer.from(`${WATER_API_CLIENT_ID}:${WATER_API_CLIENT_SECRET}`).toString("base64");

  const body = new URLSearchParams({ grant_type: "client_credentials" }).toString();

  const res = await fetch(`${WATER_API_BASE}/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${basic}`,
    },
    body,
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) {
    throw new Error(`Token request failed: ${res.status}`);
  }

  const data: WaterTokenResponse = await res.json();
  const expiresAt = Date.now() + (data.expires_in - 60) * 1000; // trừ 60s để an toàn
  waterTokenCache = { token: data.access_token, expiresAt };
  return data.access_token;
}

export interface WaterSearchParams {
  idkh?: string;
  sodb?: string;
  tenkh?: string;
  madp?: string;
  madh?: string;
  cmnd?: string;
  dienthoai?: string;
}

export interface WaterCustomer {
  idkh: string;
  sodb: string;
  tenkh: string;
  cmnd: string;
  sdt: string;
  diachi: string;
  mst: string;
}

export async function searchWaterCustomers(
  params: WaterSearchParams = {}
): Promise<WaterCustomer[]> {
  const token = await requestWaterApiToken();

  const payload = {
    idkh: "",
    sodb: "",
    tenkh: "",
    madp: "",
    madh: "",
    cmnd: "",
    dienthoai: "",
    ...params,
  };

  const res = await fetch(`${WATER_API_BASE}/CapNuocLA/1.0/searchs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) {
    // Trường hợp token hết hạn bất thường, thử lấy lại token một lần
    if (res.status === 401) {
      waterTokenCache = null;
      const retryToken = await requestWaterApiToken();
      const retry = await fetch(`${WATER_API_BASE}/CapNuocLA/1.0/searchs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${retryToken}`,
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10000),
      });
      if (!retry.ok) {
        throw new Error(`Search failed: ${retry.status}`);
      }
      return (await retry.json()) as WaterCustomer[];
    }
    throw new Error(`Search failed: ${res.status}`);
  }

  return (await res.json()) as WaterCustomer[];
}

export interface WaterConsumption {
  tenkh: string;
  thang: number;
  nam: number;
  diachi: string;
  chisodau: number;
  chisocuoi: number;
  kltt: number;
  tongtien: number;
  hetno: boolean;
  kyhd: string;
  idkh: string;
  sodb: string;
  fkey: string;
  tiennuoc: number;
  tienthue: number;
  tienphi: number;
  phantramThue: number;
  donvithanhtoan: string;
  mst: string;
}

export async function getWaterConsumptions(idkh: string): Promise<WaterConsumption[]> {
  const token = await requestWaterApiToken();
  const url = `${WATER_API_BASE}/CapNuocLA/1.0/gettieuthus?idkh=${encodeURIComponent(idkh)}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) {
    if (res.status === 401) {
      waterTokenCache = null;
      const retryToken = await requestWaterApiToken();
      const retry = await fetch(url, {
        method: "GET",
        headers: { Authorization: `Bearer ${retryToken}`, Accept: "application/json" },
        signal: AbortSignal.timeout(10000),
      });
      if (!retry.ok) {
        throw new Error(`Consumption lookup failed: ${retry.status}`);
      }
      return (await retry.json()) as WaterConsumption[];
    }
    throw new Error(`Consumption lookup failed: ${res.status}`);
  }

  return (await res.json()) as WaterConsumption[];
}

export function clearWaterTokenCache() {
  waterTokenCache = null;
}
