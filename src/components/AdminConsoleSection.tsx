/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Key, 
  Plus, 
  History, 
  Copy, 
  Check, 
  Trash2, 
  Smartphone, 
  Lock, 
  AlertTriangle, 
  RefreshCw, 
  ArrowRight,
  FileCode
} from "lucide-react";

interface KeyLog {
  key: string;
  memo: string;
  days: number;
  createdAt: string;
  expiresAt: string;
  status: string;
}

interface VerificationLog {
  timestamp: string;
  key: string;
  ip: string;
  device: string;
  result: string;
  status: "success" | "failed";
}

interface SimulationResult {
  valid: boolean;
  status: string;
  expires_at?: string;
  reason?: string;
  timestamp: string;
}

export default function AdminConsoleSection() {
  const [passcode, setPasscode] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isTestingMode, setIsTestingMode] = useState(false);
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);
  
  // States of administrator data
  const [activeKeys, setActiveKeys] = useState<KeyLog[]>([]);
  const [verificationLogs, setVerificationLogs] = useState<VerificationLog[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Key creation inputs
  const [days, setDays] = useState("30");
  const [memo, setMemo] = useState("");
  const [generateError, setGenerateError] = useState("");
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);

  // Shortcuts query simulator
  const [simulatedKey, setSimulatedKey] = useState("");
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [simulating, setSimulating] = useState(false);

  // Authenticate admin portal
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError("");
    try {
      const res = await fetch("/api/keys/admin-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
      });
      if (res.ok) {
        const data = await res.json();
        setActiveKeys(data.activeKeys);
        setVerificationLogs(data.verificationLogs);
        setIsAuthorized(true);
        setIsTestingMode(!!data.isTestingMode);
        // Persist token session locally
        const token = data.token || passcode;
        sessionStorage.setItem("sh_admin_session", token);
        setPasscode(token);
      } else {
        let errMsg = "口令验证未通过";
        try {
          const err = await res.json();
          errMsg = err.error || errMsg;
        } catch (_) {
          try {
            const text = await res.text();
            errMsg = text || `服务器错误，状态码: ${res.status}`;
          } catch (__) {
            errMsg = `服务器错误，状态码: ${res.status}`;
          }
        }
        setAuthError(errMsg);
      }
    } catch (e) {
      setAuthError(`网络连接异常: ${(e as Error).message || "无法连接至服务器，请检查网络。"}`);
    } finally {
      setLoading(false);
    }
  };

  // Re-verify on mount if password/token was stored
  useEffect(() => {
    const saved = sessionStorage.getItem("sh_admin_session");
    if (saved) {
      setPasscode(saved);
      // Simulate click
      const autoAuth = async () => {
        try {
          const res = await fetch("/api/keys/admin-data", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ passcode: saved }),
          });
          if (res.ok) {
            const data = await res.json();
            setActiveKeys(data.activeKeys);
            setVerificationLogs(data.verificationLogs);
            setIsAuthorized(true);
            setIsTestingMode(!!data.isTestingMode);
            const token = data.token || saved;
            sessionStorage.setItem("sh_admin_session", token);
            setPasscode(token);
          }
        } catch (_) {}
      };
      autoAuth();
    }
  }, []);

  // Fetch / refresh lists
  const handleRefreshData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/keys/admin-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
      });
      if (res.ok) {
        const data = await res.json();
        setActiveKeys(data.activeKeys);
        setVerificationLogs(data.verificationLogs);
        if (data.token) {
          sessionStorage.setItem("sh_admin_session", data.token);
          setPasscode(data.token);
        }
      } else {
        let errMsg = "";
        try {
          const err = await res.json();
          errMsg = err.error;
        } catch (_) {}
        if (errMsg) setAuthError(errMsg);
      }
    } catch (_) {}
    setLoading(false);
  };

  // Generate a key
  const handleGenerateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerateError("");
    setNewlyCreatedKey(null);
    if (!memo.trim()) {
      setGenerateError("请输入买家备注（例如买家小红书昵称），方便日后封底追溯");
      return;
    }

    try {
      const res = await fetch("/api/keys/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ days, memo, passcode })
      });
      if (res.ok) {
        const data = await res.json();
        setNewlyCreatedKey(data.key.key);
        setActiveKeys(prev => [data.key, ...prev]);
        setMemo("");
      } else {
        let errMsg = "生成失败";
        try {
          const err = await res.json();
          errMsg = err.error || errMsg;
        } catch (_) {
          try {
            const text = await res.text();
            errMsg = text || errMsg;
          } catch (__) {}
        }
        setGenerateError(errMsg);
      }
    } catch (e) {
      setGenerateError(`请求发送失败: ${(e as Error).message || "网络异常"}`);
    }
  };

  // Revoke/void a key
  const handleRevokeKey = async (keyToRevoke: string) => {
    if (!window.confirm(`确定要废除该卡密吗？废除后，持有该卡密的 iPhone 用户将立即无法启动快捷指令，并在下次请求时被安全阻断。`)) {
      return;
    }
    try {
      const res = await fetch("/api/keys/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: keyToRevoke, passcode })
      });
      if (res.ok) {
        setActiveKeys(prev => prev.filter(k => k.key !== keyToRevoke));
      } else {
        let errMsg = "撤销失败";
        try {
          const err = await res.json();
          errMsg = err.error || errMsg;
        } catch (_) {
          try {
            const text = await res.text();
            errMsg = text || errMsg;
          } catch (__) {}
        }
        alert(errMsg);
      }
    } catch (e) {
      alert(`请求交互异常: ${(e as Error).message || "网络错误"}`);
    }
  };

  // Simulate iPhone Shortcuts calling validation
  const handleSimulateCall = async () => {
    if (!simulatedKey.trim()) return;
    setSimulating(true);
    setSimulationResult(null);
    try {
      const url = `/api/validate?key=${encodeURIComponent(simulatedKey.trim())}&device_id=模拟器-iPhone17Pro`;
      const res = await fetch(url);
      const data = await res.json();
      setSimulationResult(data);
      // Automatically refresh logs after simulation
      setTimeout(handleRefreshData, 500);
    } catch (_) {
      setSimulationResult({ 
        valid: false, 
        status: "ERROR", 
        reason: "模拟请求出错", 
        timestamp: new Date().toISOString() 
      });
    } finally {
      setSimulating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(text);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Analyze logs to check key-sharing (if the same key is associated with multiple distinct IP addresses)
  const getAbusiveKeys = () => {
    const keyIps: Record<string, Set<string>> = {};
    verificationLogs.forEach(log => {
      if (log.status === "success") {
        if (!keyIps[log.key]) {
          keyIps[log.key] = new Set();
        }
        keyIps[log.key].add(log.ip);
      }
    });
    
    const abusive: Record<string, number> = {};
    Object.entries(keyIps).forEach(([key, ips]) => {
      if (ips.size >= 2) { // 2 or more distinct IPs (for demo we use >= 2, real environment might use >= 3)
        abusive[key] = ips.size;
      }
    });
    return abusive;
  };

  const keyAbuseStats = getAbusiveKeys();

  // If not authorized yet, show passcode block
  if (!isAuthorized) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white border-2 border-black rounded-sm shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <div className="text-center space-y-3 mb-6">
          <div className="w-12 h-12 bg-[#FAF9F5] border border-black flex items-center justify-center mx-auto rounded-sm">
            <Lock className="w-6 h-6 text-stone-900 animate-pulse" />
          </div>
          <h3 className="text-xl font-serif font-black tracking-tight text-stone-900">
            小红书商家卡密防盗管理后台
          </h3>
          <span className="text-[10px] font-mono tracking-widest text-stone-500 uppercase block">
             SECURITY AUTHORIZATION REQUIRED
          </span>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase text-stone-600 block">
              输入商家管理密钥 / ADMIN_PASSCODE：
            </label>
            <input
              type="password"
              placeholder="请输入管理员口令"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="w-full p-3 bg-[#FAFDF6] border border-black text-xs font-mono tracking-widest focus:outline-none focus:ring-1 focus:ring-black"
              required
            />
          </div>

          {authError && (
            <p className="text-xs text-red-650 bg-red-50 p-2.5 border border-red-200 font-mono">
              ⚠️ {authError}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-black hover:bg-neutral-900 text-white text-xs font-serif font-bold uppercase tracking-widest rounded-sm flex items-center justify-center gap-2 transition cursor-pointer"
          >
            {loading ? "正在连接安全容器..." : "双因子云端安全校验"}
          </button>
        </form>

        <p className="text-[10px] text-stone-550 mt-5 leading-relaxed font-mono">
          * <strong>防盗卖原理</strong>：通过将生成的“云端HMAC防伪卡密”置入 iPhone 快捷指令。用户每次在手机启动快捷指令时，手机后台会自动秘密向该网页发送 validation 命令。如果判定被多人多次盗刷或属于篡改密钥，则立即向手机返回验证失败阻断运行。
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Testing Mode Alert Banner */}
      {isTestingMode && (
        <div className="bg-red-50 border-2 border-red-500 p-4.5 rounded-sm text-xs text-red-955 flex gap-3 shadow-[4px_4px_0_0_rgba(239,68,68,0.15)] animate-fadeIn">
          <div className="shrink-0 text-red-650 font-bold text-sm">⚠️</div>
          <div className="space-y-1">
            <h4 className="font-bold font-serif text-red-950">当前处于系统测试密钥运行状态</h4>
            <p className="leading-relaxed font-sans text-stone-800">
              系统当前未检测到自定义的 <code>LICENSE_SECRET</code> 或 <code>ADMIN_PASSCODE</code> 环境变量，已自动启用测试用密码（<code>admin888</code>）和签名密钥。
            </p>
            <p className="leading-relaxed font-bold font-sans text-stone-900 mt-1">
              【商用警告】：在正式对买家销售前，请务必前往 Vercel 项目设置中配置您专属的密钥和口令。否则买家可通过默认密码登录此后台，并可轻易伪造卡密破解授权。
            </p>
          </div>
        </div>
      )}

      {/* Title block */}
      <div className="pb-4 border-b border-black flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-sm text-[10px] font-mono tracking-wider font-bold bg-black text-[#F5F5F0]">
             APPS SHORTCUT VERIFICATION CONSOLE
          </span>
          <h2 className="text-2xl font-serif font-black text-stone-950 mt-2 tracking-tight">
            云端 HMAC 卡密下发与防盗监控中心
          </h2>
          <p className="text-xs text-stone-600 mt-1 font-mono">
            可防机制：防止一码多发、无限制盗卖、非法复制篡改。零数据库开销，由签名秘钥对校验。
          </p>
        </div>
        
        <div className="flex gap-2 shrink-0">
          <button
            onClick={handleRefreshData}
            disabled={loading}
            className="p-2 border border-black bg-white hover:bg-[#FAF9F5] text-xs font-bold rounded-sm flex items-center gap-1.5 transition cursor-pointer"
            title="刷新云端卡密和鉴权日志"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span className="font-mono text-[11px]">实时刷新</span>
          </button>
          
          <button
            onClick={() => {
              setIsAuthorized(false);
              sessionStorage.removeItem("sh_admin_session");
            }}
            className="p-2 border border-black bg-neutral-100 hover:bg-neutral-200 text-xs font-bold rounded-sm transition cursor-pointer font-serif"
          >
            退出后台
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Grid: Generate & List Keys (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Card 1: Key Generator */}
          <div className="bg-[#FAF9F5] border border-black p-5 rounded-sm shadow-[3px_3px_0px_0px_rgba(0,0,0,0.1)]">
            <h3 className="text-sm font-bold text-stone-950 font-serif flex items-center gap-2 border-b border-black/10 pb-2 mb-4">
              <Plus className="w-4 h-4 text-stone-900" />
              新建  HMAC 强签卡密激活码
            </h3>

            <form onSubmit={handleGenerateKey} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-stone-600 font-semibold block">
                    卡密有效时长：
                  </label>
                  <select
                    value={days}
                    onChange={(e) => setDays(e.target.value)}
                    className="w-full p-2.5 bg-white border border-stone-400 text-xs text-stone-900 focus:outline-none"
                  >
                    <option value="1">1 天 (超短期测试)</option>
                    <option value="7">7 天 (预售或防身应急租卡)</option>
                    <option value="30">30 天 (标准月卡密)</option>
                    <option value="365">365 天 (全包年卡密)</option>
                    <option value="18250">99 年 (模拟终身激活)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-stone-600 font-semibold block">
                    独立买家备注 / 编号：
                  </label>
                  <input
                    type="text"
                    placeholder="客户小红书名称 / 订单尾号"
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    className="w-full p-2 bg-white border border-stone-400 text-xs font-mono focus:outline-none"
                    required
                  />
                </div>
              </div>

              {generateError && (
                <p className="text-xs text-red-650 bg-red-50 p-2 border border-red-200 mt-2 font-mono">
                  {generateError}
                </p>
              )}

              <button
                type="submit"
                className="w-full py-2 bg-stone-950 hover:bg-stone-900 text-white text-xs font-mono font-bold tracking-widest uppercase rounded-sm flex items-center justify-center gap-1 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>生成并加密签署该卡密</span>
              </button>
            </form>

            {/* Display newly created key banner */}
            {newlyCreatedKey && (
              <div className="mt-4 p-4.5 bg-white border-2 border-dashed border-emerald-600 rounded-sm space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase flex items-center gap-1">
                     卡密生成成功！请复制发送给小红书客户
                  </span>
                  <span className="text-[9px] font-mono bg-emerald-100 text-emerald-800 px-1 py-0.5 rounded-sm">
                    不可篡改
                  </span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={newlyCreatedKey}
                    className="flex-1 p-2 bg-emerald-50/40 border border-emerald-300 text-xs font-mono tracking-wider text-stone-900 focus:outline-none"
                  />
                  <button
                    onClick={() => copyToClipboard(newlyCreatedKey)}
                    className="px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-sm transition flex items-center justify-center gap-1 cursor-pointer font-serif"
                  >
                    {copiedKey === newlyCreatedKey ? (
                      <Check className="w-3.5 h-3.5 animate-scaleIn" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>复制</span>
                  </button>
                </div>
                <p className="text-[10px] text-stone-500 leading-normal font-mono">
                  该卡密包含过期日期指纹和安全 HMAC 防伪尾段，客户直接复制粘贴进 iOS Shortcuts 提示框即可瞬间完成云端实名绑定。
                </p>
              </div>
            )}
          </div>

          {/* Card 2: List Current Keys */}
          <div className="bg-white border border-black p-5 rounded-sm shadow-[3px_3px_0px_0px_rgba(0,0,0,0.1)]">
            <div className="flex items-center justify-between border-b border-black/10 pb-2 mb-4">
              <h3 className="text-sm font-bold text-stone-950 font-serif flex items-center gap-2">
                <Key className="w-4 h-4 text-stone-700" />
                正在服役的卡密库明细表 ({activeKeys.length})
              </h3>
              <span className="text-[9px] bg-stone-100 border border-black/10 font-mono uppercase px-1.5 py-0.5 text-stone-500">
                内存极轻态存盘
              </span>
            </div>

            {activeKeys.length === 0 ? (
              <p className="text-xs text-stone-500 text-center py-6 font-mono font-bold">
                暂无存量卡密，请在上方签发。
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs font-mono">
                  <thead>
                    <tr className="border-b border-stone-300 bg-stone-100 text-[10px] text-stone-600 font-mono uppercase tracking-wider">
                      <th className="p-2">数字卡密 (HMAC Token)</th>
                      <th className="p-2">买家备注</th>
                      <th className="p-2">到期时刻</th>
                      <th className="p-2 text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeKeys.map((k) => {
                      const isAbused = keyAbuseStats[k.key] !== undefined;
                      return (
                        <tr key={k.key} className={`border-b border-stone-200 hover:bg-stone-50/50 ${isAbused ? "bg-red-50/50" : ""}`}>
                          <td className="p-2 font-mono tracking-tight shrink-0 max-w-[170px] truncate">
                            <span 
                              className="cursor-pointer hover:text-blue-600 flex items-center gap-1 justify-start font-bold"
                              onClick={() => copyToClipboard(k.key)}
                              title="点击复制"
                            >
                              {k.key.substring(0, 12)}...{k.key.slice(-8)}
                              {copiedKey === k.key ? (
                                <Check className="w-3 h-3 text-emerald-600 animate-scaleIn" />
                              ) : (
                                <Copy className="w-3 h-3 opacity-30 group-hover:opacity-100" />
                              )}
                            </span>
                          </td>
                          <td className="p-2 text-stone-800 text-[11px]">
                            <div className="flex flex-col">
                              <span>{k.memo}</span>
                              {isAbused && (
                                <span className="inline-flex items-center gap-1 text-[9px] text-red-600 font-bold bg-red-100 px-1 py-0.5 rounded-sm w-fit mt-0.5">
                                  <AlertTriangle className="w-2.5 h-2.5 animate-bounce" />
                                  发现多IP刷码防预警 ({keyAbuseStats[k.key]}个IP)
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-2 text-stone-500 text-[11px] whitespace-nowrap">{k.expiresAt}</td>
                          <td className="p-2 text-right">
                            <button
                              onClick={() => handleRevokeKey(k.key)}
                              className="text-stone-400 hover:text-red-600 transition p-1 hover:bg-stone-100 rounded-sm cursor-pointer"
                              title="废除该激活卡密"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

        {/* Right Grid: Verification logs & Simulation (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Section: Shortcuts API Simulation Tool */}
          <div className="bg-[#FAF9F5] border-2 border-black p-5 rounded-sm">
            <h3 className="text-xs font-mono font-bold text-stone-900 flex items-center gap-2 uppercase tracking-wider border-b border-black/10 pb-2 mb-3">
              <Smartphone className="w-4 h-4" />
              校验服务器接口极速诊断器 (苹果手机沙盒模拟)
            </h3>
            <p className="text-[11px] text-stone-600 mb-4 leading-normal font-sans">
              如果你希望模拟苹果系统自带“快捷方案”在手机启动时请求该 API, 请在此输入你生成的卡密来测试：
            </p>

            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="粘贴卡密来测试 (SHC-...)"
                  value={simulatedKey}
                  onChange={(e) => setSimulatedKey(e.target.value)}
                  className="flex-1 p-2 bg-white border border-stone-400 text-xs font-mono"
                />
                <button
                  onClick={handleSimulateCall}
                  disabled={simulating}
                  className="px-3.5 bg-black hover:bg-neutral-900 text-white text-xs font-bold font-serif transition rounded-sm cursor-pointer"
                >
                  {simulating ? "检测中" : "模拟触控"}
                </button>
              </div>

              {simulationResult && (
                <div className={`p-3 border rounded-sm text-xs font-mono leading-relaxed animate-fadeIn ${
                  simulationResult.valid 
                    ? "bg-emerald-50 border-emerald-300 text-emerald-900" 
                    : "bg-red-50 border-red-300 text-red-900"
                }`}>
                  <div className="flex items-center justify-between font-bold border-b border-black/5 pb-1 mb-1.5 uppercase [word-spacing:1px]">
                    <span>📱 苹果手机请求回应：</span>
                    <span>{simulationResult.status}</span>
                  </div>
                  <div>是否核准运行：<strong>{simulationResult.valid ? "✅ 准予启动" : "❌ 立即挂断/阻挠"}</strong></div>
                  
                  {simulationResult.valid ? (
                    <div>剩余保质截止：<span className="underline">{simulationResult.expires_at}</span></div>
                  ) : (
                    <div className="text-red-700">被劫阻原因：{simulationResult.reason}</div>
                  )}
                  <div className="text-[9px] text-stone-500 mt-1 uppercase text-right">时间戳: {simulationResult.timestamp}</div>
                </div>
              )}
            </div>
          </div>

          {/* Section: Live Auditing Logs (Anti-Resale Monitor) */}
          <div className="bg-stone-950 border border-black p-5 rounded-sm text-[#F5F5F0] shadow-[3px_3px_0px_0px_rgba(0,0,0,0.1)] relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-4">
              <h3 className="text-xs font-mono font-bold text-stone-200 uppercase tracking-widest flex items-center gap-1.5">
                <History className="w-4 h-4 text-emerald-400" />
                手机现场云校验审计流水 ({verificationLogs.length})
              </h3>
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse border border-black" />
            </div>

            {verificationLogs.length === 0 ? (
              <p className="text-[11px] text-stone-500 text-center py-8 font-mono">
                暂无实况请求，等待 iOS Shortcuts 后台触发。
              </p>
            ) : (
              <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1 no-scrollbar text-xs font-mono">
                {verificationLogs.map((log, idx) => {
                  const hasIPAbuse = keyAbuseStats[log.key] !== undefined;
                  return (
                    <div 
                      key={idx} 
                      className={`p-2.5 rounded-sm border text-[11px] space-y-1 ${
                        log.status === "success" 
                          ? "bg-stone-900/40 border-stone-800 text-stone-300" 
                          : "bg-red-950/20 border-red-900/40 text-red-200"
                      }`}
                    >
                      <div className="flex justify-between text-[10px] text-stone-500 font-mono">
                        <span>{log.timestamp}</span>
                        <span className={log.status === "success" ? "text-emerald-400" : "text-rose-500"}>
                          {log.status === "success" ? "● 核准通过" : "✕ 拦截拒发"}
                        </span>
                      </div>
                      <div className="text-[10px]">
                        卡密：<span className="font-bold underline text-stone-100">{log.key.substring(0, 10)}...{log.key.slice(-5)}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-stone-400">
                        <span>终端 IP：<span className="text-stone-300">{log.ip}</span></span>
                        <span>设备：<span className="text-stone-300 truncate max-w-[80px]" title={log.device}>{log.device}</span></span>
                      </div>
                      <div className="text-[10px] text-amber-300/90 italic mt-0.5 border-t border-white/5 pt-0.5">
                        行为监测：{log.result}
                      </div>

                      {hasIPAbuse && log.status === "success" && (
                        <div className="bg-amber-900/30 border border-amber-600/35 text-amber-200 p-1.5 rounded-sm text-[10px] mt-1 flex gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 self-start" />
                          <div>
                            <strong>警告：</strong>该密钥存在盗刷倒卖风险，检测到曾由不同 IP 地址在短时间内交叉访问。建议点左侧废除该密钥。
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Shortcuts iOS Flow Blueprint / Manual Section (High-Polish Tutorial) */}
      <div className="bg-white border border-black p-6 rounded-sm mt-8 space-y-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.15)]">
        <h3 className="text-base font-serif font-black text-stone-900 flex items-center gap-2 border-b border-black/10 pb-3">
          <FileCode className="w-5 h-5 text-stone-800" />
          二、如何将此 API 鉴权零编程拖曳配置到 iPhone 的 Shortcuts 软件内？
        </h3>
        <p className="text-xs text-stone-700 leading-relaxed font-sans">
          对于希望购买并安装此“治安保命指令”的买家，你可以制作一套包含 <strong>校验拦截</strong> 的快捷指令提供给他们，其底层设计完美避开了对传统数据库和中国大陆服务器ICP备案的硬依赖（依靠 Cloud Run / 公开 CDN 无阻校验）。配置在 2 分钟内即可配妥：
        </p>

        {/* Blueprint Flow Chart Visual Layout */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 py-4 text-xs font-mono">
          
          <div className="p-4 bg-stone-50 border border-stone-300 rounded-sm relative flex flex-col justify-between">
            <div className="absolute -top-2.5 left-3 bg-black text-white text-[9px] px-1.5 py-0.5 uppercase tracking-widest block font-bold">
              第 1 步 / 录入
            </div>
            <div className="space-y-2 mt-2">
              <strong className="text-stone-900 font-serif block text-xs">要求输入/请求输入：</strong>
              <p className="text-stone-600 text-[11px] leading-relaxed font-sans">
                快捷指令开头添加第一个动作块：<strong>“要求输入：文本”</strong>，提示语句设定为 <code>“请输入您购买此指令的卡密激活码”</code>。
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-stone-400 mt-4 self-end hidden md:block" />
          </div>

          <div className="p-4 bg-stone-50 border border-stone-300 rounded-sm relative flex flex-col justify-between">
            <div className="absolute -top-2.5 left-3 bg-black text-white text-[9px] px-1.5 py-0.5 uppercase tracking-widest block font-bold">
              第 2 步 / 发送
            </div>
            <div className="space-y-2 mt-2">
              <strong className="text-stone-900 font-serif block text-xs">获取 URL 内容 (GET)：</strong>
              <p className="text-stone-600 text-[11px] leading-relaxed font-sans">
                调用系统网络接口，参数拼接：<br />
                <code>URL = {window.location.protocol}//{window.location.host}/api/validate?key=[前面输入的内容]</code> <br />
                <span className="text-[9.5px] text-amber-700 leading-tight block mt-1">※ 这样不仅可以查询卡密，还可以秘密采集当前客户端 IP 帮助防滥刷。</span>
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-stone-400 mt-4 self-end hidden md:block" />
          </div>

          <div className="p-4 bg-stone-50 border border-stone-300 rounded-sm relative flex flex-col justify-between">
            <div className="absolute -top-2.5 left-3 bg-black text-white text-[9px] px-1.5 py-0.5 uppercase tracking-widest block font-bold">
              第 3 步 / 解析
            </div>
            <div className="space-y-2 mt-2">
              <strong className="text-stone-900 font-serif block text-xs">解析校验状态：</strong>
              <p className="text-stone-600 text-[11px] leading-relaxed font-sans">
                1. 拖入动作 <strong>“自 [URL 内容] 获取 [Dictionary] 值”</strong>，键名为 <code>valid</code>。<br />
                2. 拖入分支 <strong>“如果 [valid] 是 [是 / 真]”</strong> ➔ 执行应急治安核心动作（例如开始五分钟隐蔽极暗黑屏录音，放大法条等）。
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-stone-400 mt-4 self-end hidden md:block" />
          </div>

          <div className="p-4 bg-stone-50 border border-stone-300 rounded-sm relative flex flex-col justify-between">
            <div className="absolute -top-2.5 left-3 bg-black text-white text-[9px] px-1.5 py-0.5 uppercase tracking-widest block font-bold">
              第 4 步 / 拒绝
            </div>
            <div className="space-y-2 mt-2">
              <strong className="text-stone-900 font-serif block text-xs">否则 / 关斩中断：</strong>
              <p className="text-stone-600 text-[11px] leading-relaxed font-sans">
                在 <strong>“否则”</strong> 分支段下放置 <strong>“显示警告：卡密验证未通过！请前往小红书购买正版授权！”</strong>，紧跟着拖入 <strong>“退出快捷指令”</strong> 彻底掐断其运行。
              </p>
            </div>
            <span className="text-rose-500 font-bold text-[10px] mt-4 self-end">🔒 安全防篡改达成</span>
          </div>

        </div>

        {/* Advantages summary table */}
        <div className="bg-stone-50 p-4 border border-stone-200 text-xs rounded-sm">
          <strong className="text-stone-900 font-serif block mb-2">安全沙盒防线优势说明 (配合小红书分发场景)：</strong>
          <ul className="list-disc list-inside space-y-1.5 text-stone-700 leading-relaxed font-sans">
            <li><strong>一码防群发滥拷：</strong>通过“审计流水栏”，你可以看到某个卡密是否在 2 小时内被数十个不同的移动基站 IP 重复触发验证。一旦发现异动，你可以在激活码表格中一键撤销并拉黑它。</li>
            <li><strong>无视中国大陆备案困扰：</strong>由于使用了 Google Cloud Container / 国际主流 Serverless API 进行卡密的校验签署工作，不需要在国内进行服务器 ICP 备案，不绑定特定高成本服务器域名，极其不易被阻断拦截。</li>
            <li><strong>不可逆签名计算：</strong>卡密的格式中自带高强防盗校验段，由你设置的秘钥加密，他人自己通过改变过期时间等伪造的卡密由于签名签名不符，一律会被服务器截杀。</li>
          </ul>
        </div>
      </div>

    </div>
  );
}
