import express from "express";
import path from "path";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

// Access control headers for iOS Shortcuts requests (Shortcuts may execute from distinct iOS webviews)
app.use(express.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Secret for signing license keys - fallback for local development
const SECRET = process.env.LICENSE_SECRET || "SHC_SECRET_FALLBACK_KEY_2026_V3";

// Key generation and verification helpers
function generateLicenseKey(daysValid: number, clientMemo = "小红书买家"): any {
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
    status: "active"
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
  
  const [prefix, expiryHex, randomHex, signature] = parts;
  const expiryTime = parseInt(expiryHex, 16);
  if (isNaN(expiryTime)) {
    return { valid: false, reason: "失效序列码无法解析" };
  }
  
  // Signature of lower-case expiryHex and randomHex
  const rawData = `${expiryHex.toLowerCase()}-${randomHex}`;
  const expectedSignature = crypto.createHmac("sha256", SECRET).update(rawData).digest("hex").slice(0, 10).toUpperCase();
  
  if (signature !== expectedSignature) {
    return { valid: false, reason: "数字签名不匹配 (该密钥非本系统签发或属于盗版篡改密钥)" };
  }
  
  if (Date.now() > expiryTime) {
    return { valid: false, reason: `该卡密已于 ${new Date(expiryTime).toLocaleString("zh-CN")} 到期已失效` };
  }
  
  return { 
    valid: true, 
    expiresAt: new Date(expiryTime).toLocaleString("zh-CN")
  };
}

// Global In-Memory Store for track logs during hot restart sessions
interface KeyLog {
  key: string;
  memo: string;
  days: number;
  createdAt: string;
  expiresAt: string;
}

interface VerificationLog {
  timestamp: string;
  key: string;
  ip: string;
  device: string;
  result: string;
  status: "success" | "failed";
}

const activeKeys: KeyLog[] = [
  generateLicenseKey(365, "展示样例-终身激活卡密"),
  generateLicenseKey(30, "测试用途-月卡密"),
];

const verificationLogs: VerificationLog[] = [];

// API: Check/Validate Key (Calleable by Apple Shortcuts and React Frontend)
app.get("/api/validate", (req, res) => {
  const key = (req.query.key as string || "").trim();
  const device = (req.query.device_id as string || req.headers["user-agent"] || "苹果设备（iOS快捷指令）").slice(0, 100);
  const rawIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "Unknown IP";
  const ip = Array.isArray(rawIp) ? rawIp[0] : rawIp;

  if (!key) {
    return res.status(400).json({ 
      valid: false, 
      reason: "请求中未包含 [key] 参数。请确认 Shortcuts 设置中参数拼写是否正确。" 
    });
  }

  const result = checkKeyValidity(key);
  
  // Log the check
  verificationLogs.unshift({
    timestamp: new Date().toLocaleString("zh-CN"),
    key,
    ip: ip.replace("::ffff:", ""),
    device,
    result: result.valid ? "验证成功：已授予执行权限" : `拦截：${result.reason}`,
    status: result.valid ? "success" : "failed"
  });

  // Limit verification log length to last 50 entries
  if (verificationLogs.length > 50) {
    verificationLogs.pop();
  }

  // Response with structured format perfect for Siri Shortcuts Parsing
  res.json({
    valid: result.valid,
    status: result.valid ? "ACTIVE" : "EXPIRED_OR_INVALID",
    expires_at: result.expiresAt || "",
    reason: result.reason || "",
    timestamp: new Date().toISOString(),
    owner_info: "治安防卫保命快捷导航维权卡密认证部"
  });
});

// API: Generate new key (Merchant Panel)
app.post("/api/keys/generate", (req, res) => {
  const { days, memo, passcode } = req.body;
  
  // Simple check to prevent unauthorized generation
  const adminPasscode = process.env.ADMIN_PASSCODE || "admin888";
  if (passcode !== adminPasscode) {
    return res.status(401).json({ error: "管理员面板密码错误，无法签发卡密！" });
  }

  const daysNum = parseInt(days, 10);
  if (isNaN(daysNum) || daysNum <= 0) {
    return res.status(400).json({ error: "生成的有效期必须是正整数天！" });
  }

  const newKey = generateLicenseKey(daysNum, memo || "自定义备忘录");
  activeKeys.unshift(newKey);
  
  res.json({ success: true, key: newKey });
});

// API: Read audit logs and key database (Merchant Panel)
app.get("/api/keys/admin-data", (req, res) => {
  const passcode = req.query.passcode as string;
  const adminPasscode = process.env.ADMIN_PASSCODE || "admin888";
  
  if (passcode !== adminPasscode) {
    return res.status(401).json({ error: "验证失败：无权读取商密级激活表据。" });
  }

  res.json({
    activeKeys,
    verificationLogs
  });
});

// API: Revoke / delete a manual key from the local tracking array
app.post("/api/keys/revoke", (req, res) => {
  const { key, passcode } = req.body;
  const adminPasscode = process.env.ADMIN_PASSCODE || "admin888";

  if (passcode !== adminPasscode) {
    return res.status(401).json({ error: "管理员密码错误，无权撤销该密钥！" });
  }

  const index = activeKeys.findIndex(k => k.key === key);
  if (index !== -1) {
    activeKeys.splice(index, 1);
    res.json({ success: true, message: "卡密已从当前生成表单中撤销" });
  } else {
    res.status(404).json({ error: "未在当前内存记录里发现该卡密条目" });
  }
});

// Vite Setup for Development / Static serving for production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n========================================`);
    console.log(`[V3 SECURITY ENGINE ACTIVED]`);
    console.log(`Local Access: http://localhost:${PORT}`);
    console.log(`Authentication API Route: /api/validate`);
    console.log(`========================================\n`);
  });
}

startServer();
