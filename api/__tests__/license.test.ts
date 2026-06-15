import { describe, it, expect, vi, beforeEach } from "vitest";
import crypto from "node:crypto";

// Mock the store module
vi.mock("../lib/store", () => {
  const memoryRevoked = new Set<string>();
  const memoryBindings = new Map<string, string>();
  return {
    initStore: vi.fn(),
    getActiveKeys: vi.fn(() => []),
    addActiveKey: vi.fn(),
    removeActiveKey: vi.fn(),
    isKeyRevoked: vi.fn(async (key: string) => memoryRevoked.has(key)),
    addRevokedKey: vi.fn(async (key: string) => { memoryRevoked.add(key); }),
    getDeviceBinding: vi.fn(async (key: string) => memoryBindings.get(key) || null),
    setDeviceBinding: vi.fn(async (key: string, dev: string) => { memoryBindings.set(key, dev); }),
    getVerificationLogs: vi.fn(() => []),
    addVerificationLog: vi.fn(),
    createAdminSession: vi.fn(),
    validateAdminSession: vi.fn(() => true),
    checkRateLimit: vi.fn(() => true),
  };
});

// Setup mock environment variables before importing
process.env.LICENSE_SECRET = "TEST_SECRET_KEY_1234567890";
process.env.ADMIN_PASSCODE = "test-passcode-999";

// Now import the functions to test. We'll modify api/index.ts to export them.
import { generateLicenseKey, checkKeyValidity, normalizeKey } from "../index";

describe("Card Key (License) System", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("normalizeKey", () => {
    it("should strip spaces and quotes", () => {
      expect(normalizeKey(" SHC-123-456-789 ")).toBe("SHC-123-456-789");
      expect(normalizeKey('"SHC-123"')).toBe("SHC-123");
      expect(normalizeKey('“SHC-123”')).toBe("SHC-123");
    });
  });

  describe("generateLicenseKey and checkKeyValidity", () => {
    it("should generate a valid key and validate it successfully", async () => {
      const days = 30;
      const keyLog = generateLicenseKey(days, "UnitTest Buyer");
      expect(keyLog.key).toMatch(/^SHC-[0-9A-F]+-[0-9A-F]+-[0-9A-F]+$/);
      expect(keyLog.days).toBe(30);

      const result = await checkKeyValidity(keyLog.key);
      expect(result.valid).toBe(true);
      expect(result.expiresAt).toBeDefined();
    });

    it("should fail validation for expired keys", async () => {
      // Generate key with negative days (expired)
      const keyLog = generateLicenseKey(-1, "Expired Buyer");
      const result = await checkKeyValidity(keyLog.key);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain("到期已失效");
    });

    it("should fail validation for tampered signatures", async () => {
      const keyLog = generateLicenseKey(10, "Tamper Target");
      // Tamper with the last character of the signature
      const lastChar = keyLog.key.slice(-1);
      const newChar = lastChar === "A" ? "B" : "A";
      const tamperedKey = keyLog.key.slice(0, -1) + newChar;

      const result = await checkKeyValidity(tamperedKey);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain("数字签名不匹配");
    });

    it("should fail validation for incorrect formats", async () => {
      const res1 = await checkKeyValidity("NOT-STARTING-WITH-SHC");
      expect(res1.valid).toBe(false);
      expect(res1.reason).toContain("卡密格式错误");

      const res2 = await checkKeyValidity("SHC-SHORT-FORMAT");
      expect(res2.valid).toBe(false);
      expect(res2.reason).toContain("卡密校验段长度不符");
    });

    it("should support backward compatibility with old 10-character signatures", async () => {
      // Generate a valid 10-char signature key using the old logic
      const expiryTime = Date.now() + 10 * 24 * 60 * 60 * 1000;
      const expiryHex = expiryTime.toString(16).toUpperCase();
      const randomHex = crypto.randomBytes(4).toString("hex").toUpperCase();
      const rawData = `${expiryHex.toLowerCase()}-${randomHex}`;
      const signature10 = crypto
        .createHmac("sha256", process.env.LICENSE_SECRET!)
        .update(rawData)
        .digest("hex")
        .slice(0, 10)
        .toUpperCase();
      const oldKey = `SHC-${expiryHex}-${randomHex}-${signature10}`;

      const result = await checkKeyValidity(oldKey);
      expect(result.valid).toBe(true);
    });

    it("should fail validation for blacklisted/revoked keys", async () => {
      const keyLog = generateLicenseKey(30, "Revoke Buyer");
      
      // Import the mocked store and add this key to revoked list
      const store = await import("../lib/store");
      await store.addRevokedKey(keyLog.key);

      const result = await checkKeyValidity(keyLog.key);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain("已被商家废除或撤销");
    });
  });
});
