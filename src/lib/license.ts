/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const STORAGE_KEY = "pc_license_v1";

export interface StoredLicense {
  key: string;
  expiresAt: string | null;
  validatedAt: number;
}

export interface ValidateResult {
  valid: boolean;
  expiresAt?: string | null;
  reason?: string;
}

export function getDeviceId(): string {
  const DEVICE_ID_KEY = "pc_device_id_v1";
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    // Generate a unique ID for this browser
    deviceId = "web-" + (window.crypto?.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2));
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
}

export function isAndroid(): boolean {
  return /Android/i.test(navigator.userAgent);
}

export function isStandalonePwa(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

/** Android 或已安装 PWA 时需要卡密激活 */
export function shouldRequireActivation(): boolean {
  return isAndroid() || isStandalonePwa();
}

export function getStoredLicense(): StoredLicense | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredLicense;
  } catch {
    return null;
  }
}

export function saveLicense(key: string, expiresAt: string | null): void {
  const entry: StoredLicense = {
    key: key.trim(),
    expiresAt,
    validatedAt: Date.now(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entry));
}

export function clearLicense(): void {
  localStorage.removeItem(STORAGE_KEY);
}

function isExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return false;
  const t = new Date(expiresAt).getTime();
  return Number.isFinite(t) && t < Date.now();
}

export function hasValidLocalLicense(): boolean {
  const stored = getStoredLicense();
  if (!stored?.key) return false;
  if (isExpired(stored.expiresAt)) {
    clearLicense();
    return false;
  }
  return true;
}

export async function validateLicenseKey(key: string): Promise<ValidateResult> {
  const trimmed = key.trim();
  if (!trimmed) {
    return { valid: false, reason: "请输入卡密" };
  }

  try {
    const params = new URLSearchParams({
      key: trimmed,
      device_id: getDeviceId(),
    });
    const res = await fetch(`/api/validate?${params}`);
    const data = await res.json();

    if (data.valid) {
      saveLicense(trimmed, data.expires_at ?? null);
      return { valid: true, expiresAt: data.expires_at ?? null };
    }

    return { valid: false, reason: data.reason || "卡密无效或已过期" };
  } catch {
    return { valid: false, reason: "无法连接验证服务器，请检查网络" };
  }
}

export function getLicenseKeyFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get("k") || params.get("key");
}

export function stripLicenseParamsFromUrl(): void {
  const url = new URL(window.location.href);
  if (!url.searchParams.has("k") && !url.searchParams.has("key")) return;
  url.searchParams.delete("k");
  url.searchParams.delete("key");
  window.history.replaceState({}, "", url.pathname + url.search + url.hash);
}
