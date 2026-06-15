import { describe, it, expect, vi, beforeEach } from "vitest";
import { EventEmitter } from "node:events";

// Mock the store module
vi.mock("../lib/store", () => {
  const memoryRevoked = new Set<string>();
  const memoryBindings = new Map<string, string>();
  let memoryActive: any[] = [];
  let memoryLogs: any[] = [];
  const memorySessions = new Map<string, number>();

  return {
    initStore: vi.fn(),
    getActiveKeys: vi.fn(async () => memoryActive),
    addActiveKey: vi.fn(async (key: any) => { memoryActive.unshift(key); }),
    removeActiveKey: vi.fn(async (key: string) => {
      const len = memoryActive.length;
      memoryActive = memoryActive.filter((k) => k.key !== key);
      return memoryActive.length !== len;
    }),
    isKeyRevoked: vi.fn(async (key: string) => memoryRevoked.has(key)),
    addRevokedKey: vi.fn(async (key: string) => { memoryRevoked.add(key); }),
    getDeviceBinding: vi.fn(async (key: string) => memoryBindings.get(key) || null),
    setDeviceBinding: vi.fn(async (key: string, dev: string) => { memoryBindings.set(key, dev); }),
    getVerificationLogs: vi.fn(async () => memoryLogs),
    addVerificationLog: vi.fn(async (log: any) => { memoryLogs.unshift(log); }),
    createAdminSession: vi.fn(async (tok: string) => { memorySessions.set(tok, Date.now() + 3600 * 1000); }),
    validateAdminSession: vi.fn(async (tok: string) => memorySessions.has(tok)),
    checkRateLimit: vi.fn(async () => true),
  };
});

// Setup env variables before importing handler
process.env.LICENSE_SECRET = "INTEGRATION_TEST_SECRET_KEY";
process.env.ADMIN_PASSCODE = "admin-secret-pwd";

import handler from "../index";

function createMockReq(url: string, method = "GET", body?: any, headers: Record<string, string> = {}) {
  const req = new EventEmitter() as any;
  req.url = url;
  req.method = method;
  req.headers = {
    host: "localhost",
    ...headers,
  };
  req.socket = { remoteAddress: "127.0.0.1" };
  if (body !== undefined) {
    req.body = body;
  }
  return req;
}

function createMockRes() {
  let resolveFn: any;
  const promise = new Promise((resolve) => {
    resolveFn = resolve;
  });

  const res = {
    statusCode: 200,
    headers: {} as Record<string, string>,
    body: "",
    setHeader(name: string, value: string) {
      this.headers[name.toLowerCase()] = value;
    },
    end(data?: string) {
      if (data) this.body += data;
      resolveFn(this);
    },
    promise,
  } as any;

  return res;
}

describe("API Endpoints Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fallback to default key and return status successfully if environment is not set", async () => {
    const origSecret = process.env.LICENSE_SECRET;
    delete process.env.LICENSE_SECRET;

    const req = createMockReq("/api/validate?key=SHC-123");
    const res = createMockRes();

    await handler(req, res);
    await res.promise;

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body).valid).toBe(false);

    process.env.LICENSE_SECRET = origSecret;
  });

  it("should generate a license key with correct passcode", async () => {
    const req = createMockReq("/api/keys/generate", "POST", {
      days: "30",
      memo: "Joe Shmoe",
      passcode: "admin-secret-pwd",
    });
    const res = createMockRes();

    await handler(req, res);
    await res.promise;

    expect(res.statusCode).toBe(200);
    const data = JSON.parse(res.body);
    expect(data.success).toBe(true);
    expect(data.key.key).toContain("SHC-");
  });

  it("should fail to generate license key with incorrect passcode", async () => {
    const req = createMockReq("/api/keys/generate", "POST", {
      days: "30",
      memo: "Joe Shmoe",
      passcode: "wrong-pwd",
    });
    const res = createMockRes();

    await handler(req, res);
    await res.promise;

    expect(res.statusCode).toBe(401);
  });

  it("should validate a key and perform device binding", async () => {
    // 1. Generate a key
    const reqGen = createMockReq("/api/keys/generate", "POST", {
      days: "90",
      memo: "Device test",
      passcode: "admin-secret-pwd",
    });
    const resGen = createMockRes();
    await handler(reqGen, resGen);
    await resGen.promise;
    const generated = JSON.parse(resGen.body).key.key;

    // 2. Validate first time (binds to Device A)
    const reqVal1 = createMockReq(`/api/validate?key=${generated}&device_id=DeviceA`);
    const resVal1 = createMockRes();
    await handler(reqVal1, resVal1);
    await resVal1.promise;
    expect(JSON.parse(resVal1.body).valid).toBe(true);
    expect(JSON.parse(resVal1.body).bound_device).toBe("DeviceA");

    // 3. Validate second time with same device
    const reqVal2 = createMockReq(`/api/validate?key=${generated}&device_id=DeviceA`);
    const resVal2 = createMockRes();
    await handler(reqVal2, resVal2);
    await resVal2.promise;
    expect(JSON.parse(resVal2.body).valid).toBe(true);

    // 4. Validate with different device (Device B) -> expect failure
    const reqVal3 = createMockReq(`/api/validate?key=${generated}&device_id=DeviceB`);
    const resVal3 = createMockRes();
    await handler(reqVal3, resVal3);
    await resVal3.promise;
    expect(JSON.parse(resVal3.body).valid).toBe(false);
    expect(JSON.parse(resVal3.body).reason).toContain("禁止跨设备共享");
  });

  it("should revoke a key and add it to revoked blacklist", async () => {
    // 1. Generate a key
    const reqGen = createMockReq("/api/keys/generate", "POST", {
      days: "30",
      memo: "Revoke test",
      passcode: "admin-secret-pwd",
    });
    const resGen = createMockRes();
    await handler(reqGen, resGen);
    await resGen.promise;
    const key = JSON.parse(resGen.body).key.key;

    // 2. Revoke key
    const reqRev = createMockReq("/api/keys/revoke", "POST", {
      key,
      passcode: "admin-secret-pwd",
    });
    const resRev = createMockRes();
    await handler(reqRev, resRev);
    await resRev.promise;
    expect(resRev.statusCode).toBe(200);

    // 3. Validate key -> expect failure due to blacklist
    const reqVal = createMockReq(`/api/validate?key=${key}&device_id=DeviceX`);
    const resVal = createMockRes();
    await handler(reqVal, resVal);
    await resVal.promise;
    expect(JSON.parse(resVal.body).valid).toBe(false);
    expect(JSON.parse(resVal.body).reason).toContain("已被商家废除或撤销");
  });

  it("should validate the admin passcode successfully and bypass device binding", async () => {
    const adminPasscode = "admin-secret-pwd";
    const reqVal = createMockReq(`/api/validate?key=${adminPasscode}&device_id=AnyDevice`);
    const resVal = createMockRes();
    await handler(reqVal, resVal);
    await resVal.promise;
    
    expect(resVal.statusCode).toBe(200);
    const data = JSON.parse(resVal.body);
    expect(data.valid).toBe(true);
    expect(data.expires_at).toBe("2099-12-31 23:59:59");
    expect(data.bound_device).toBe("管理员测试设备");
  });
});
