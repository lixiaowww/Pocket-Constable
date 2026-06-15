/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Key, Shield, Loader2, AlertTriangle } from "lucide-react";
import { validateLicenseKey } from "../lib/license";

interface ActivationGateProps {
  onActivated: () => void;
}

export default function ActivationGate({ onActivated }: ActivationGateProps) {
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim()) return;

    setLoading(true);
    setError(null);

    const result = await validateLicenseKey(key);
    setLoading(false);

    if (result.valid) {
      onActivated();
    } else {
      setError(result.reason || "卡密验证失败");
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0] text-[#1A1A1A] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-black text-[#F5F5F0] flex items-center justify-center">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-serif font-black tracking-tight">遇袭维权锦囊</h1>
          <p className="text-xs font-mono tracking-widest uppercase text-stone-500">
            安卓版 · PWA 激活
          </p>
        </div>

        <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] space-y-4">
          <p className="text-sm text-stone-700 leading-relaxed">
            请输入您从小红书购买的<strong>激活卡密</strong>，验证通过后即可使用全套维权指南、法条话术与索赔计算工具。
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="license-key-input"
                className="text-[10px] font-mono tracking-widest uppercase font-bold text-stone-600 block mb-2"
              >
                卡密激活码 (SHC-...)
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  id="license-key-input"
                  type="text"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder="SHC-xxxx-xxxx-xxxx"
                  autoComplete="off"
                  autoCapitalize="characters"
                  className="w-full pl-10 pr-4 py-3 border-2 border-black text-sm font-mono focus:outline-none focus:ring-2 focus:ring-black/20"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 text-red-800 bg-red-50 border border-red-200 p-3 text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !key.trim()}
              className="w-full py-3 bg-black text-white text-sm font-serif font-bold tracking-wide disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  正在验证...
                </>
              ) : (
                "验证并激活"
              )}
            </button>
          </form>
        </div>

        <div className="text-[10px] text-stone-500 leading-relaxed space-y-1 text-center font-mono">
          <p>本工具为数字信息参考，不构成律师意见。</p>
          <p>卡密问题请联系小红书商家售后（勿公开卡密）。</p>
        </div>
      </div>
    </div>
  );
}
