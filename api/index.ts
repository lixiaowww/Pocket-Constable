import crypto from "node:crypto";
import {
  initStore,
  getActiveKeys,
  addActiveKey,
  removeActiveKey,
  isKeyRevoked,
  addRevokedKey,
  getDeviceBinding,
  setDeviceBinding,
  getVerificationLogs,
  addVerificationLog,
  createAdminSession,
  validateAdminSession,
  checkRateLimit,
} from "./lib/store.js";

// Self-contained Vercel serverless function (no Express) so the bundle has zero
// external runtime dependencies. This avoids the FUNCTION_INVOCATION_FAILED crash.
// Initialize store logs on load
initStore();

function getSecret(): string {
  return process.env.LICENSE_SECRET || "SHC_SECRET_FALLBACK_KEY_2026_DEFAULT";
}

function getAdminPasscode(): string {
  return process.env.ADMIN_PASSCODE || "admin888";
}

interface KeyLog {
  key: string;
  memo: string;
  days: number;
  createdAt: string;
  expiresAt: string;
  status?: string;
}

interface VerificationLog {
  timestamp: string;
  key: string;
  ip: string;
  device: string;
  result: string;
  status: "success" | "failed";
}

export function generateLicenseKey(daysValid: number, clientMemo = "小红书买家"): KeyLog {
  const expiryTime = Date.now() + daysValid * 24 * 60 * 60 * 1000;
  const expiryHex = expiryTime.toString(16).toUpperCase();
  const randomHex = crypto.randomBytes(4).toString("hex").toUpperCase();
  const rawData = `${expiryHex.toLowerCase()}-${randomHex}`;
  const signature = crypto.createHmac("sha256", getSecret()).update(rawData).digest("hex").slice(0, 16).toUpperCase();
  const key = `SHC-${expiryHex}-${randomHex}-${signature}`;

  return {
    key,
    memo: clientMemo,
    days: daysValid,
    createdAt: new Date().toLocaleString("zh-CN"),
    expiresAt: new Date(expiryTime).toLocaleString("zh-CN"),
    status: "active",
  };
}

export function normalizeKey(raw: string): string {
  return (raw || "")
    .trim()
    .replace(/^["'“”‘’]+|["'“”‘’]+$/g, "")
    .replace(/\s+/g, "");
}

export async function checkKeyValidity(key: string): Promise<{ valid: boolean; reason?: string; expiresAt?: string }> {
  const normalized = normalizeKey(key);
  if (normalized && normalized.toLowerCase() === getAdminPasscode().trim().toLowerCase()) {
    return { valid: true, expiresAt: "2099-12-31 23:59:59" };
  }
  if (!normalized || !normalized.startsWith("SHC-")) {
    return { valid: false, reason: "卡密格式错误 (必须以'SHC-'开头)" };
  }

  // Revocation list check
  if (await isKeyRevoked(normalized)) {
    return { valid: false, reason: "该卡密已被商家废除或撤销，请重新购买合法卡密" };
  }

  const parts = normalized.split("-");
  if (parts.length !== 4) {
    return { valid: false, reason: "卡密校验段长度不符，可能已损毁" };
  }

  const [, expiryHex, randomHex, signature] = parts;
  const expiryTime = parseInt(expiryHex, 16);
  if (isNaN(expiryTime)) {
    return { valid: false, reason: "失效序列码无法解析" };
  }

  const rawData = `${expiryHex.toLowerCase()}-${randomHex}`;
  const expectedSignature = crypto.createHmac("sha256", getSecret()).update(rawData).digest("hex").slice(0, signature.length).toUpperCase();

  if (signature !== expectedSignature) {
    return { valid: false, reason: "数字签名不匹配 (该密钥非本系统签发或属于盗版篡改密钥)" };
  }

  if (Date.now() > expiryTime) {
    return { valid: false, reason: `该卡密已于 ${new Date(expiryTime).toLocaleString("zh-CN")} 到期已失效` };
  }

  return { valid: true, expiresAt: new Date(expiryTime).toLocaleString("zh-CN") };
}

async function isAdminAuthorized(passcode: string): Promise<boolean> {
  if (!passcode) return false;
  const p = passcode.trim();
  const adminP = getAdminPasscode().trim();
  if (p === adminP || p.toLowerCase() === adminP.toLowerCase()) return true;
  return await validateAdminSession(passcode);
}

function sendJson(res: any, status: number, obj: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(obj));
}

function readJsonBody(req: any): Promise<any> {
  return new Promise((resolve) => {
    if (req.body !== undefined) {
      if (typeof req.body === "object" && req.body !== null) {
        return resolve(req.body);
      }
      if (typeof req.body === "string") {
        try {
          return resolve(JSON.parse(req.body));
        } catch {
          return resolve({});
        }
      }
      return resolve({});
    }

    let raw = "";
    req.on("data", (chunk: Buffer) => {
      raw += chunk.toString();
    });
    req.on("end", () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        resolve({});
      }
    });
    req.on("error", () => resolve({}));
  });
}

export default async function handler(req: any, res: any) {
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || "").split(",").filter(Boolean);
  const requestOrigin = req.headers?.origin || "";
  const corsOrigin = allowedOrigins.length === 0 ? requestOrigin : (allowedOrigins.includes(requestOrigin) ? requestOrigin : allowedOrigins[0] || "");
  if (corsOrigin) res.setHeader("Access-Control-Allow-Origin", corsOrigin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

  if (req.method === "OPTIONS") {
    res.statusCode = 200;
    return res.end();
  }

  const url = new URL(req.url || "/", "http://localhost");
  const pathname = url.pathname.replace(/\/+$/, "") || "/";
  const method = (req.method || "GET").toUpperCase();

  // Environment Check - Fallback to testing keys is allowed for frictionless configuration

  // Extract IP and rate limit check
  const rawIp = (req.headers["x-forwarded-for"] as string) || req.socket?.remoteAddress || "Unknown IP";
  const ip = Array.isArray(rawIp) ? rawIp[0].split(",")[0].trim() : rawIp.split(",")[0].trim();
  const clientIp = ip.replace("::ffff:", "");

  const isAdminPath = pathname.startsWith("/api/keys");
  const limit = isAdminPath ? 10 : 30; // 10 req/min for Admin panel, 30 req/min for validation
  const isAllowed = await checkRateLimit(clientIp, limit, 60);
  if (!isAllowed) {
    return sendJson(res, 429, { error: "请求过于频繁，请稍后再试" });
  }

  // GET /api/v?k= — minimal plain-text endpoint for macOS Shortcuts (no extra query params)
  if (pathname === "/api/v" && method === "GET") {
    const key = normalizeKey(url.searchParams.get("k") || url.searchParams.get("key") || "");
    const result = await checkKeyValidity(key);
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    return res.end(result.valid ? "OK" : "FAIL");
  }

  // GET /api/validate
  if (pathname === "/api/validate" && method === "GET") {
    const key = normalizeKey(url.searchParams.get("key") || "");
    const device = (url.searchParams.get("device_id") || (req.headers["user-agent"] as string) || "苹果设备（iOS快捷指令）").slice(0, 100);
    const simpleFormat = url.searchParams.get("format") === "simple";

    if (!key) {
      if (simpleFormat) {
        res.statusCode = 400;
        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        return res.end("INVALID");
      }
      return sendJson(res, 400, {
        valid: false,
        reason: "请求中未包含 [key] 参数。请确认 Shortcuts 设置中参数拼写是否正确。",
      });
    }

    const result = await checkKeyValidity(key);

    // Device binding logic
    let boundDevice = "";
    const isAdmin = key.toLowerCase() === getAdminPasscode().trim().toLowerCase();
    if (result.valid) {
      if (!isAdmin) {
        const existingDeviceId = await getDeviceBinding(key);
        if (!existingDeviceId) {
          await setDeviceBinding(key, device);
          boundDevice = device;
        } else if (existingDeviceId !== device) {
          result.valid = false;
          result.reason = "此卡密已在其他设备或账户绑定，禁止跨设备共享使用。";
          boundDevice = existingDeviceId;
        } else {
          boundDevice = existingDeviceId;
        }
      } else {
        boundDevice = "管理员测试设备";
      }
    }

    await addVerificationLog({
      timestamp: new Date().toLocaleString("zh-CN"),
      key,
      ip: clientIp,
      device,
      result: result.valid ? "验证成功：已授予执行权限" : `拦截：${result.reason}`,
      status: result.valid ? "success" : "failed",
    });

    if (simpleFormat) {
      res.statusCode = 200;
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      return res.end(result.valid ? "ACTIVE" : "INVALID");
    }

    return sendJson(res, 200, {
      valid: result.valid,
      status: result.valid ? "ACTIVE" : "EXPIRED_OR_INVALID",
      expires_at: result.expiresAt || "",
      reason: result.reason || "",
      bound_device: boundDevice,
      timestamp: new Date().toISOString(),
      owner_info: "遇袭维权锦囊卡密认证部",
    });
  }

  // POST /api/keys/admin-data
  if (pathname === "/api/keys/admin-data" && method === "POST") {
    const body = await readJsonBody(req);
    const passcode = body?.passcode || "";

    const p = (passcode || "").trim();
    const adminP = getAdminPasscode().trim();
    const isPasscodeAuth = p === adminP || p.toLowerCase() === adminP.toLowerCase();
    const isSessionAuth = !isPasscodeAuth && (await validateAdminSession(passcode));

    if (!isPasscodeAuth && !isSessionAuth) {
      return sendJson(res, 401, { error: "验证失败：无权读取商密级激活表据。" });
    }

    let token = passcode;
    if (isPasscodeAuth) {
      token = "sess_" + crypto.randomBytes(24).toString("hex");
      await createAdminSession(token);
    }

    const [keys, logs] = await Promise.all([
      getActiveKeys(),
      getVerificationLogs()
    ]);

    return sendJson(res, 200, { 
      activeKeys: keys, 
      verificationLogs: logs, 
      token,
      isTestingMode: !process.env.ADMIN_PASSCODE || !process.env.LICENSE_SECRET
    });
  }

  // POST /api/keys/generate
  if (pathname === "/api/keys/generate" && method === "POST") {
    const body = await readJsonBody(req);
    const { days, memo, passcode } = body || {};

    if (!(await isAdminAuthorized(passcode))) {
      return sendJson(res, 401, { error: "管理员面板密码错误，无法签发卡密！" });
    }

    const daysNum = parseInt(days, 10);
    if (isNaN(daysNum) || daysNum <= 0) {
      return sendJson(res, 400, { error: "生成的有效期必须是正整数天！" });
    }

    const newKey = generateLicenseKey(daysNum, memo || "自定义备忘录");
    await addActiveKey(newKey);
    return sendJson(res, 200, { success: true, key: newKey });
  }

  // POST /api/keys/revoke
  if (pathname === "/api/keys/revoke" && method === "POST") {
    const body = await readJsonBody(req);
    const { key, passcode } = body || {};

    if (!(await isAdminAuthorized(passcode))) {
      return sendJson(res, 401, { error: "管理员密码错误，无权撤销该密钥！" });
    }

    const normalized = normalizeKey(key);
    await addRevokedKey(normalized);
    const removed = await removeActiveKey(normalized);

    if (removed) {
      return sendJson(res, 200, { success: true, message: "卡密已从当前生成表单中撤销，并已加入全局拦截黑名单" });
    }
    return sendJson(res, 404, { error: "未在当前生成表单中发现该卡密条目，已将其加入全局黑名单" });
  }

  return sendJson(res, 404, { error: "未找到该接口", path: pathname });
}
