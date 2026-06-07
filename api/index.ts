import crypto from "node:crypto";

// Self-contained Vercel serverless function (no Express) so the bundle has zero
// external runtime dependencies. This avoids the FUNCTION_INVOCATION_FAILED crash
// that occurred when an Express app was bundled as an ESM serverless function.

const SECRET = process.env.LICENSE_SECRET || "SHC_SECRET_FALLBACK_KEY_2026_V3";
const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || "admin888";

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

function generateLicenseKey(daysValid: number, clientMemo = "小红书买家"): KeyLog {
  const expiryTime = Date.now() + daysValid * 24 * 60 * 60 * 1000;
  const expiryHex = expiryTime.toString(16).toUpperCase();
  const randomHex = crypto.randomBytes(4).toString("hex").toUpperCase();
  const rawData = `${expiryHex.toLowerCase()}-${randomHex}`;
  const signature = crypto.createHmac("sha256", SECRET).update(rawData).digest("hex").slice(0, 10).toUpperCase();
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

function checkKeyValidity(key: string): { valid: boolean; reason?: string; expiresAt?: string } {
  if (!key || typeof key !== "string" || !key.startsWith("SHC-")) {
    return { valid: false, reason: "卡密格式错误 (必须以'SHC-'开头)" };
  }

  const parts = key.split("-");
  if (parts.length !== 4) {
    return { valid: false, reason: "卡密校验段长度不符，可能已损毁" };
  }

  const [, expiryHex, randomHex, signature] = parts;
  const expiryTime = parseInt(expiryHex, 16);
  if (isNaN(expiryTime)) {
    return { valid: false, reason: "失效序列码无法解析" };
  }

  const rawData = `${expiryHex.toLowerCase()}-${randomHex}`;
  const expectedSignature = crypto.createHmac("sha256", SECRET).update(rawData).digest("hex").slice(0, 10).toUpperCase();

  if (signature !== expectedSignature) {
    return { valid: false, reason: "数字签名不匹配 (该密钥非本系统签发或属于盗版篡改密钥)" };
  }

  if (Date.now() > expiryTime) {
    return { valid: false, reason: `该卡密已于 ${new Date(expiryTime).toLocaleString("zh-CN")} 到期已失效` };
  }

  return { valid: true, expiresAt: new Date(expiryTime).toLocaleString("zh-CN") };
}

// NOTE: serverless instances are ephemeral, so this store only survives within a
// single warm instance. The merchant panel is best-effort; license validation is
// fully stateless (pure HMAC) and unaffected.
const activeKeys: KeyLog[] = [
  generateLicenseKey(365, "展示样例-终身激活卡密"),
  generateLicenseKey(30, "测试用途-月卡密"),
];
const verificationLogs: VerificationLog[] = [];

function sendJson(res: any, status: number, obj: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(obj));
}

function readJsonBody(req: any): Promise<any> {
  return new Promise((resolve) => {
    if (req.body && typeof req.body === "object") {
      return resolve(req.body);
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
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

  if (req.method === "OPTIONS") {
    res.statusCode = 200;
    return res.end();
  }

  const url = new URL(req.url || "/", "http://localhost");
  const pathname = url.pathname.replace(/\/+$/, "") || "/";
  const method = (req.method || "GET").toUpperCase();

  // GET /api/validate
  if (pathname === "/api/validate" && method === "GET") {
    const key = (url.searchParams.get("key") || "").trim();
    const device = (url.searchParams.get("device_id") || (req.headers["user-agent"] as string) || "苹果设备（iOS快捷指令）").slice(0, 100);
    const rawIp = (req.headers["x-forwarded-for"] as string) || req.socket?.remoteAddress || "Unknown IP";
    const ip = Array.isArray(rawIp) ? rawIp[0] : rawIp;

    if (!key) {
      return sendJson(res, 400, {
        valid: false,
        reason: "请求中未包含 [key] 参数。请确认 Shortcuts 设置中参数拼写是否正确。",
      });
    }

    const result = checkKeyValidity(key);

    verificationLogs.unshift({
      timestamp: new Date().toLocaleString("zh-CN"),
      key,
      ip: ip.replace("::ffff:", ""),
      device,
      result: result.valid ? "验证成功：已授予执行权限" : `拦截：${result.reason}`,
      status: result.valid ? "success" : "failed",
    });
    if (verificationLogs.length > 50) verificationLogs.pop();

    return sendJson(res, 200, {
      valid: result.valid,
      status: result.valid ? "ACTIVE" : "EXPIRED_OR_INVALID",
      expires_at: result.expiresAt || "",
      reason: result.reason || "",
      timestamp: new Date().toISOString(),
      owner_info: "遇袭维权锦囊卡密认证部",
    });
  }

  // GET /api/keys/admin-data
  if (pathname === "/api/keys/admin-data" && method === "GET") {
    const passcode = url.searchParams.get("passcode") || "";
    if (passcode !== ADMIN_PASSCODE) {
      return sendJson(res, 401, { error: "验证失败：无权读取商密级激活表据。" });
    }
    return sendJson(res, 200, { activeKeys, verificationLogs });
  }

  // POST /api/keys/generate
  if (pathname === "/api/keys/generate" && method === "POST") {
    const body = await readJsonBody(req);
    const { days, memo, passcode } = body || {};
    if (passcode !== ADMIN_PASSCODE) {
      return sendJson(res, 401, { error: "管理员面板密码错误，无法签发卡密！" });
    }
    const daysNum = parseInt(days, 10);
    if (isNaN(daysNum) || daysNum <= 0) {
      return sendJson(res, 400, { error: "生成的有效期必须是正整数天！" });
    }
    const newKey = generateLicenseKey(daysNum, memo || "自定义备忘录");
    activeKeys.unshift(newKey);
    return sendJson(res, 200, { success: true, key: newKey });
  }

  // POST /api/keys/revoke
  if (pathname === "/api/keys/revoke" && method === "POST") {
    const body = await readJsonBody(req);
    const { key, passcode } = body || {};
    if (passcode !== ADMIN_PASSCODE) {
      return sendJson(res, 401, { error: "管理员密码错误，无权撤销该密钥！" });
    }
    const index = activeKeys.findIndex((k) => k.key === key);
    if (index !== -1) {
      activeKeys.splice(index, 1);
      return sendJson(res, 200, { success: true, message: "卡密已从当前生成表单中撤销" });
    }
    return sendJson(res, 404, { error: "未在当前内存记录里发现该卡密条目" });
  }

  return sendJson(res, 404, { error: "未找到该接口", path: pathname });
}
