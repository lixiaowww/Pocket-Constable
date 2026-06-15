/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from "react";
import { Download, X, Smartphone } from "lucide-react";
import { isAndroid, isStandalonePwa } from "../lib/license";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [showManualHint, setShowManualHint] = useState(false);

  useEffect(() => {
    if (!isAndroid() || isStandalonePwa()) return;

    const dismissedAt = sessionStorage.getItem("pc_pwa_banner_dismissed");
    if (dismissedAt) setDismissed(true);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!isAndroid() || isStandalonePwa() || dismissed) return null;

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      setDismissed(true);
    } else {
      setShowManualHint((v) => !v);
    }
  };

  const handleDismiss = () => {
    sessionStorage.setItem("pc_pwa_banner_dismissed", "1");
    setDismissed(true);
  };

  return (
    <div className="bg-[#1A1A1A] text-[#F5F5F0] border-2 border-black p-4 mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.15)]">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-white/10 rounded-sm shrink-0">
          <Smartphone className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-serif font-bold">添加到主屏幕，像 App 一样使用</p>
          <p className="text-[11px] text-zinc-300 mt-1 leading-relaxed">
            安装后可从桌面一键打开，无需每次输入网址。
          </p>
          {showManualHint && (
            <p className="text-[10px] text-zinc-400 mt-2 leading-relaxed font-mono">
              Chrome 菜单 →「添加到主屏幕」或「安装应用」
            </p>
          )}
          <button
            type="button"
            onClick={handleInstall}
            className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-[#F5F5F0] text-black text-xs font-bold font-serif"
          >
            <Download className="w-3.5 h-3.5" />
            {deferredPrompt ? "一键安装" : "查看安装方法"}
          </button>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="关闭"
          className="p-1 text-zinc-400 hover:text-white shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
