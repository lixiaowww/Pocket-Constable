import { Redis } from "@upstash/redis";

const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

const hasRedis = !!(redisUrl && redisToken);
const redis = hasRedis
  ? new Redis({
      url: redisUrl,
      token: redisToken,
    })
  : null;

// Fallback in-memory structures
let memoryActiveKeys: any[] = [];
let memoryVerificationLogs: any[] = [];
const memoryDeviceBindings = new Map<string, string>();
const memoryRevokedKeys = new Set<string>();
const memorySessions = new Map<string, number>(); // token -> expiry timestamp

export async function initStore() {
  if (hasRedis) {
    const isVercelKv = !!process.env.KV_REST_API_URL;
    console.log(`[Store] Running with Upstash Redis persistence (${isVercelKv ? "KV_REST_API_URL" : "UPSTASH_REDIS_REST_URL"}).`);
  } else {
    console.log("[Store] Running in-memory (fallback). No Redis credentials found.");
  }
}

// 1. Active Keys
export async function getActiveKeys(): Promise<any[]> {
  if (redis) {
    try {
      const list = await redis.lrange("pc:active_keys", 0, -1);
      return list || [];
    } catch (e) {
      console.error("[Store] Redis getActiveKeys error, falling back to memory:", e);
      return memoryActiveKeys;
    }
  }
  return memoryActiveKeys;
}

export async function addActiveKey(keyLog: any): Promise<void> {
  if (redis) {
    try {
      await redis.lpush("pc:active_keys", keyLog);
    } catch (e) {
      console.error("[Store] Redis addActiveKey error, falling back to memory:", e);
      memoryActiveKeys.unshift(keyLog);
    }
  } else {
    memoryActiveKeys.unshift(keyLog);
  }
}

export async function removeActiveKey(key: string): Promise<boolean> {
  if (redis) {
    try {
      const list = await getActiveKeys();
      const newList = list.filter((k: any) => k.key !== key);
      if (list.length === newList.length) return false;
      
      // Rewrite list
      await redis.del("pc:active_keys");
      if (newList.length > 0) {
        // reverse it because lpush prepends
        await redis.lpush("pc:active_keys", ...[...newList].reverse());
      }
      return true;
    } catch (e) {
      console.error("[Store] Redis removeActiveKey error, falling back to memory:", e);
      const idx = memoryActiveKeys.findIndex((k: any) => k.key === key);
      if (idx !== -1) {
        memoryActiveKeys.splice(idx, 1);
        return true;
      }
      return false;
    }
  } else {
    const idx = memoryActiveKeys.findIndex((k: any) => k.key === key);
    if (idx !== -1) {
      memoryActiveKeys.splice(idx, 1);
      return true;
    }
    return false;
  }
}

// 2. Revoked Keys (Blacklist)
export async function isKeyRevoked(key: string): Promise<boolean> {
  if (redis) {
    try {
      return (await redis.sismember("pc:revoked_keys", key)) === 1;
    } catch (e) {
      console.error("[Store] Redis isKeyRevoked error, falling back to memory:", e);
      return memoryRevokedKeys.has(key);
    }
  }
  return memoryRevokedKeys.has(key);
}

export async function addRevokedKey(key: string): Promise<void> {
  if (redis) {
    try {
      await redis.sadd("pc:revoked_keys", key);
    } catch (e) {
      console.error("[Store] Redis addRevokedKey error, falling back to memory:", e);
      memoryRevokedKeys.add(key);
    }
  } else {
    memoryRevokedKeys.add(key);
  }
}

// 3. Device Bindings
export async function getDeviceBinding(key: string): Promise<string | null> {
  if (redis) {
    try {
      return (await redis.hget("pc:device_bindings", key)) as string | null;
    } catch (e) {
      console.error("[Store] Redis getDeviceBinding error, falling back to memory:", e);
      return memoryDeviceBindings.get(key) || null;
    }
  }
  return memoryDeviceBindings.get(key) || null;
}

export async function setDeviceBinding(key: string, device: string): Promise<void> {
  if (redis) {
    try {
      await redis.hset("pc:device_bindings", { [key]: device });
    } catch (e) {
      console.error("[Store] Redis setDeviceBinding error, falling back to memory:", e);
      memoryDeviceBindings.set(key, device);
    }
  } else {
    memoryDeviceBindings.set(key, device);
  }
}

// 4. Verification Logs
export async function getVerificationLogs(): Promise<any[]> {
  if (redis) {
    try {
      const list = await redis.lrange("pc:verification_logs", 0, -1);
      return list || [];
    } catch (e) {
      console.error("[Store] Redis getVerificationLogs error, falling back to memory:", e);
      return memoryVerificationLogs;
    }
  }
  return memoryVerificationLogs;
}

export async function addVerificationLog(log: any): Promise<void> {
  if (redis) {
    try {
      await redis.lpush("pc:verification_logs", log);
      await redis.ltrim("pc:verification_logs", 0, 199); // trim to 200 logs
    } catch (e) {
      console.error("[Store] Redis addVerificationLog error, falling back to memory:", e);
      memoryVerificationLogs.unshift(log);
      if (memoryVerificationLogs.length > 200) {
        memoryVerificationLogs.pop();
      }
    }
  } else {
    memoryVerificationLogs.unshift(log);
    if (memoryVerificationLogs.length > 200) {
      memoryVerificationLogs.pop();
    }
  }
}

// 5. Admin Sessions
export async function createAdminSession(token: string): Promise<void> {
  const expirySec = 2 * 60 * 60; // 2 hours
  if (redis) {
    try {
      await redis.set(`pc:session:${token}`, "valid", { ex: expirySec });
    } catch (e) {
      console.error("[Store] Redis createAdminSession error, falling back to memory:", e);
      memorySessions.set(token, Date.now() + expirySec * 1000);
    }
  } else {
    memorySessions.set(token, Date.now() + expirySec * 1000);
  }
}

export async function validateAdminSession(token: string): Promise<boolean> {
  if (redis) {
    try {
      const exists = await redis.get(`pc:session:${token}`);
      return exists === "valid";
    } catch (e) {
      console.error("[Store] Redis validateAdminSession error, falling back to memory:", e);
      const expiry = memorySessions.get(token);
      if (!expiry) return false;
      if (Date.now() > expiry) {
        memorySessions.delete(token);
        return false;
      }
      return true;
    }
  }
  const expiry = memorySessions.get(token);
  if (!expiry) return false;
  if (Date.now() > expiry) {
    memorySessions.delete(token);
    return false;
  }
  return true;
}

export async function destroyAdminSession(token: string): Promise<void> {
  if (redis) {
    try {
      await redis.del(`pc:session:${token}`);
    } catch (e) {
      console.error("[Store] Redis destroyAdminSession error, falling back to memory:", e);
      memorySessions.delete(token);
    }
  } else {
    memorySessions.delete(token);
  }
}

// 6. Sliding Window Rate Limiter
export async function checkRateLimit(ip: string, limit: number, windowSec: number): Promise<boolean> {
  const now = Date.now();
  const key = `pc:rl:${ip}`;
  const windowMs = windowSec * 1000;
  
  if (redis) {
    try {
      const p = redis.pipeline();
      // Add member score
      p.zadd(key, { score: now, member: `${now}-${Math.random()}` });
      // Remove elements older than window
      p.zremrangebyscore(key, 0, now - windowMs);
      // Count
      p.zcard(key);
      // Expire the key to avoid leaking space
      p.expire(key, windowSec);
      
      const res = await p.exec();
      const count = res[2] as number;
      return count <= limit;
    } catch (e) {
      console.error("[RateLimit] Redis error:", e);
      return true; // fail-open in case of Redis error
    }
  } else {
    // In-memory simple rate limit (just sliding array)
    if (!(global as any)._rlMemoryStore) {
      (global as any)._rlMemoryStore = {};
    }
    let logs = (global as any)._rlMemoryStore[key] || [];
    logs = logs.filter((t: number) => t > now - windowMs);
    logs.push(now);
    (global as any)._rlMemoryStore[key] = logs;
    return logs.length <= limit;
  }
}
