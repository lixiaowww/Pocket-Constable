/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Smartphone, 
  ExternalLink, 
  SmartphoneNfc,
  Key,
  Copy,
  Check,
  RefreshCw
} from "lucide-react";
import { REAL_SHORTCUT_I_CLOUD_LINK } from "../data";

export default function ShortcutIntroSection() {
  const [buyerKey, setBuyerKey] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [pageUrlCopied, setPageUrlCopied] = useState(false);
  const [isInAppBrowser, setIsInAppBrowser] = useState(() => {
    if (typeof window !== "undefined") {
      const ua = navigator.userAgent.toLowerCase();
      return /micromessenger|xiaohongshu/i.test(ua);
    }
    return false;
  });

  const copyPageUrl = () => {
    navigator.clipboard.writeText(window.location.href.split("?")[0]);
    setPageUrlCopied(true);
    setTimeout(() => setPageUrlCopied(false), 2000);
  };

  const handleVerifyKey = async () => {
    if (!buyerKey.trim()) return;
    setIsValidating(true);
    setVerificationResult(null);
    try {
      const res = await fetch(`/api/validate?key=${encodeURIComponent(buyerKey.trim())}&device_id=网页验证端-iPhone`);
      const data = await res.json();
      setVerificationResult(data);
    } catch (e) {
      setVerificationResult({
        valid: false,
        reason: "无法连接验证服务器，请检查网络或部署状态。"
      });
    } finally {
      setIsValidating(false);
    }
  };

  const validationUrl = `${window.location.protocol}//${window.location.host}/api/validate?key=${encodeURIComponent(buyerKey.trim())}`;

  const copyValidationUrl = () => {
    navigator.clipboard.writeText(validationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* WeChat/Xiaohongshu Warning Banner */}
      {isInAppBrowser && (
        <div className="bg-amber-50 border-2 border-amber-500 rounded-sm p-5 shadow-[4px_4px_0_0_rgba(245,158,11,0.15)] space-y-3 animate-fadeIn">
          <div className="flex items-start gap-2.5">
            <span className="text-xl shrink-0">⚠️</span>
            <div className="space-y-1">
              <h4 className="font-serif font-black text-amber-955 text-sm">
                微信 / 小红书应用内浏览器限制提示
              </h4>
              <p className="text-xs text-amber-900 leading-relaxed">
                iOS 系统对快捷指令的安全性有极高要求。微信或小红书的内置浏览器会直接拦截 <strong>iCloud 导入链接</strong> 和 <strong>.shortcut 格式文件下载</strong>。
              </p>
            </div>
          </div>
          <div className="bg-white/60 p-3 rounded-sm border border-amber-200 text-xs text-amber-950 space-y-2">
            <p className="font-bold">【极速解决方式】：</p>
            <p className="leading-relaxed font-sans text-stone-850">
              1. 点击本页右上角菜单按钮 <strong>「···」</strong>，选择 <strong>「在 Safari 中打开」</strong> (iOS) 或 <strong>「在默认浏览器中打开」</strong> (安卓)。<br />
              2. 或者点击下方按钮复制本站网址，自行在 Safari 浏览器中粘贴打开：
            </p>
            <div className="pt-1 flex gap-2">
              <button
                onClick={copyPageUrl}
                className="py-1.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-serif font-bold text-xs rounded-sm transition cursor-pointer flex items-center gap-1.5 shadow-sm border border-amber-800"
              >
                {pageUrlCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>已成功复制本站网址</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>一键复制本站网址</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Title */}
      <div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm text-xs font-serif font-bold tracking-widest uppercase bg-[#EAECE6] text-[#333] border border-black/20">
          快捷指令 · 苹果生态联动
        </span>
        <h2 id="shortcut-intro-title" className="text-2xl sm:text-3xl font-serif font-black text-stone-900 mt-2 tracking-tight">
          苹果一键导入：将「遇袭维权锦囊」装进 iPhone
        </h2>
        <p className="text-sm text-stone-600 mt-2 font-mono uppercase tracking-wider text-[11px] opacity-75">
          省去复杂手动配置。点击下方一键分享链接，即可极速导入专为遇袭事件、防身保护与现场抗辩调解设计的 iOS 原生快捷指令（Shortcuts）。
        </p>
      </div>

      {/* Main Download Card - High-Fidelity iOS Style */}
      <div className="bg-[#FAF9F5] border border-black rounded-sm p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] relative overflow-hidden">
        
        {/* Apple Shortcuts Logo & Badge */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-black/10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-rose-500 to-indigo-500 flex items-center justify-center text-white font-black text-xs shadow-sm">
                
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-stone-900 font-serif">
                  遇袭维权锦囊一触即发指令包 v3.0
                </h3>
                <p className="text-[11px] text-stone-550">
                  支持设备：iPhone 全系 (iOS 14.0+) · 苹果生态原生安全阻断
                </p>
              </div>
            </div>
            <p className="text-xs text-stone-700 leading-relaxed max-w-xl">
              极简流畅设计，不含任何复杂后台网络请求。点击一键加入你的快捷指令库，无需繁琐调试即可本地化安全工作。
            </p>
          </div>

          <div className="shrink-0 w-full md:w-auto flex flex-col gap-2">
            <a
              id="link-icloud-shortcut-import"
              href={REAL_SHORTCUT_I_CLOUD_LINK}
              target="_blank"
              rel="noreferrer"
              className="w-full py-3 px-6 bg-[#007AFF] hover:bg-[#0062CC] text-white text-xs font-serif font-bold rounded-sm tracking-wide transition duration-150 inline-flex items-center justify-center gap-2 cursor-pointer shadow-sm border border-blue-800 text-center animate-pulse"
            >
              <ExternalLink className="w-4 h-4" />
              <span>方式一：iCloud 官方导入 (推荐)</span>
            </a>
            <a
              id="link-local-shortcut-download"
              href="/antiattack.shortcut"
              download="遇袭维权锦囊.shortcut"
              className="w-full py-2.5 px-6 bg-white hover:bg-stone-50 text-stone-900 text-xs font-serif font-bold rounded-sm tracking-wide transition duration-150 inline-flex items-center justify-center gap-2 cursor-pointer shadow-sm border border-black text-center"
            >
              <span>方式二：下载本地 .shortcut 安装包</span>
            </a>
          </div>
        </div>

        {/* Dynamic Action Block List (What is included - Minimal Layout) */}
        <div className="pt-6 space-y-4">
          <h4 className="text-[11px] font-bold text-stone-900 uppercase tracking-widest flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-stone-800" />
            该官方快捷指令运行时的三大极简流：
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Run Action 1 */}
            <div className="bg-white border border-black/10 rounded-sm p-4 space-y-2 relative">
              <div className="absolute top-3 right-3 text-[10px] font-mono text-stone-400">01 / 应急防卫</div>
              <div className="w-6 h-6 rounded-sm bg-stone-100 flex items-center justify-center text-stone-900 font-bold border border-black/10">
                🔈
              </div>
              <h5 className="font-bold text-stone-950 font-serif">静音防刺眼隐蔽收音</h5>
              <p className="text-[11px] text-stone-700 leading-normal">
                一键瞬间<span>拉低手机亮度和外放音量为零</span>（避免激怒加害者或引起警觉），并在后台立刻启动 5 分钟的高保真语音录音，保障最初源头铁证。
              </p>
            </div>

            {/* Run Action 2 */}
            <div className="bg-white border border-black/10 rounded-sm p-4 space-y-2 relative">
              <div className="absolute top-3 right-3 text-[10px] font-mono text-stone-400">02 / 执法对抗</div>
              <div className="w-6 h-6 rounded-sm bg-stone-100 flex items-center justify-center text-stone-900 font-bold border border-black/10">
                ⚖️
              </div>
              <h5 className="font-bold text-stone-950 font-serif">核心法条全屏大字报</h5>
              <p className="text-[11px] text-stone-700 leading-normal">
                被和稀泥时，一键即可<span>全屏放大显示“两高一部防卫标准”</span>与立案督办条例。可以直接出示给警员或自行口播，精准回击“各打五十大板”。
              </p>
            </div>

            {/* Run Action 3 */}
            <div className="bg-white border border-black/10 rounded-sm p-4 space-y-2 relative">
              <div className="absolute top-3 right-3 text-[10px] font-mono text-stone-400">03 / 一键回程</div>
              <div className="w-6 h-6 rounded-sm bg-stone-100 flex items-center justify-center text-stone-900 font-bold border border-black/10">
                📊
              </div>
              <h5 className="font-bold text-stone-950 font-serif">秒开定损理算账单</h5>
              <p className="text-[11px] text-stone-700 leading-normal">
                菜单第四项可直连本维权应用，随时进入<span>法医学伤情判定与民事和解溢价定价计算器</span>，在派出所现场给施暴者列举最严密的民事赔偿底限。
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Android PWA */}
      <div className="bg-[#FAF9F5] border border-black p-6 rounded-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] space-y-4">
        <div className="flex items-center gap-2 border-b border-black/10 pb-3">
          <SmartphoneNfc className="w-5 h-5 text-stone-900" />
          <h3 className="text-sm font-serif font-black text-stone-950 uppercase tracking-wide">
            安卓用户 · PWA 网页版安装
          </h3>
        </div>
        <p className="text-xs text-stone-600 leading-relaxed">
          安卓手机无需快捷指令。用 <strong>Chrome 浏览器</strong> 打开本站，输入卡密激活后，可「添加到主屏幕」像 App 一样使用。
        </p>
        <ol className="text-xs text-stone-700 space-y-2 list-decimal list-inside font-mono">
          <li>Chrome 打开 <span className="underline">pocket-constable.vercel.app</span></li>
          <li>首次进入输入小红书购买的卡密激活</li>
          <li>菜单 →「添加到主屏幕」或「安装应用」</li>
          <li>在「冲突防卫」页点「发起隐蔽取证」→ 允许麦克风</li>
        </ol>
        <p className="text-[10px] text-amber-800 bg-amber-50 border border-amber-200 p-3 leading-relaxed">
          安卓 PWA 版不含系统级静音/降亮度，录音在浏览器内完成，停止后自动下载录音文件。
        </p>
      </div>

      {/* Buyer Self-Service Verification & Binding Portal */}
      <div className="bg-[#FAF9F5] border border-black p-6 rounded-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] space-y-4">
        <div className="flex items-center gap-2 border-b border-black/10 pb-3">
          <Key className="w-5 h-5 text-stone-900" />
          <h3 className="text-sm font-serif font-black text-stone-950 uppercase tracking-wide">
            买家卡密自助激活与接口绑定工具
          </h3>
        </div>
        <p className="text-xs text-stone-600 leading-relaxed font-sans">
          如果您从小红书商家处购买了本指令包的卡密，可以在下方验证您的卡密状态。iPhone 用户可复制接口地址绑定快捷指令；安卓用户直接在本站激活即可。
        </p>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="请输入您的激活卡密 (格式如: SHC-...)"
              value={buyerKey}
              onChange={(e) => setBuyerKey(e.target.value)}
              className="flex-1 p-2.5 bg-white border border-stone-400 text-xs font-mono tracking-wider focus:outline-none"
            />
            <button
              onClick={handleVerifyKey}
              disabled={isValidating || !buyerKey.trim()}
              className="py-2.5 px-6 bg-black hover:bg-neutral-900 text-white text-xs font-serif font-bold tracking-widest uppercase rounded-sm flex items-center justify-center gap-2 transition duration-150 cursor-pointer disabled:opacity-50"
            >
              {isValidating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>查询中...</span>
                </>
              ) : (
                <span>验证卡密</span>
              )}
            </button>
          </div>

          {verificationResult && (
            <div className={`p-4 border rounded-sm text-xs font-mono leading-relaxed space-y-3 animate-fadeIn ${
              verificationResult.valid 
                ? "bg-emerald-50 border-emerald-300 text-emerald-900" 
                : "bg-red-50 border-red-300 text-red-950"
            }`}>
              <div className="flex items-center justify-between font-bold border-b border-black/5 pb-1.5 mb-1.5 uppercase">
                <span className="flex items-center gap-1">
                  {verificationResult.valid ? "✅ 验证通过 (ACTIVE)" : "❌ 验证失败 (EXPIRED_OR_INVALID)"}
                </span>
                <span className="text-[9.5px] px-1 py-0.5 rounded bg-black/5">
                  云端实时计算
                </span>
              </div>

              {verificationResult.valid ? (
                <div className="space-y-3">
                  <p><strong>截止有效期：</strong> <span className="underline">{verificationResult.expires_at}</span></p>
                  
                  <div className="text-[11px] text-stone-700 leading-relaxed font-sans space-y-3 bg-emerald-100/40 p-3.5 border border-emerald-200 rounded-sm">
                    <p className="font-bold text-emerald-950">🎉 卡密激活成功！请通过以下两种方式之一绑定到您的快捷指令：</p>
                    
                    <div className="space-y-1">
                      <p className="font-bold text-stone-900">方式一：极速绑定（免修改配置 · 最推荐）</p>
                      <p>
                        复制您的<strong>激活卡密本身 (SHC-...)</strong>。当您导入快捷指令时，系统会弹出<strong>「导入问题」窗口</strong>，提示“请输入激活卡密”。在此处直接粘贴卡密即可，无需任何复杂设置！
                      </p>
                      <div className="pt-1.5 flex gap-2">
                        <input
                          type="text"
                          readOnly
                          value={buyerKey.trim()}
                          className="flex-1 p-2 bg-white border border-emerald-300 text-xs font-mono text-stone-900 focus:outline-none"
                        />
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(buyerKey.trim());
                            alert("激活卡密复制成功！请在导入快捷指令时的输入框中粘贴。");
                          }}
                          className="px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-sm transition flex items-center justify-center gap-1.5 cursor-pointer font-serif whitespace-nowrap"
                        >
                          复制卡密
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1 border-t border-emerald-200/50 pt-3 mt-3">
                      <p className="font-bold text-stone-900">方式二：手动替换校验接口（高级备用）</p>
                      <p>
                        若您在非标准环境下导入，可以复制下方的<strong>专属校验接口地址</strong>，手动替换快捷指令中“获取 URL 内容”步骤中的网址：
                      </p>
                      
                      {/* Dynamic Copy URL field */}
                      <div className="flex gap-2 pt-1.5">
                        <input
                          type="text"
                          readOnly
                          value={validationUrl}
                          className="flex-1 p-2 bg-white border border-emerald-300 text-xs font-mono text-stone-900 focus:outline-none"
                        />
                        <button
                          onClick={copyValidationUrl}
                          className="px-4 bg-[#007AFF] hover:bg-[#0062CC] text-white text-xs rounded-sm transition flex items-center justify-center gap-1.5 cursor-pointer font-serif whitespace-nowrap"
                        >
                          {copied ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>已复制</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>复制链接</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="font-bold">拦截原因：</p>
                  <p className="text-red-700">{verificationResult.reason || "未知校验错误，请确认输入是否完整或联系卖家。"}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Extreme Simple Deployment Protocol */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-stone-900 uppercase tracking-widest border-l-2 border-black pl-2">
          如何绑定“轻敲手机背面三下”执行？ (苹果手机底置快捷技能)
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          
          <div className="bg-white border border-black/10 rounded-sm p-4 flex gap-3">
            <div className="w-7 h-7 rounded-sm bg-stone-950 text-white font-mono font-bold flex items-center justify-center shrink-0">
              A
            </div>
            <div className="space-y-1">
              <strong className="text-stone-900 block font-serif">A. 菜单路径：</strong>
              <p className="text-stone-700 leading-relaxed text-[11px]">
                手机打开 <strong>设置 ➔ 辅助功能 ➔ 触控 ➔ 拉到最底部选择“轻点背面”</strong>。
              </p>
            </div>
          </div>

          <div className="bg-white border border-black/10 rounded-sm p-4 flex gap-3">
            <div className="w-7 h-7 rounded-sm bg-stone-950 text-white font-mono font-bold flex items-center justify-center shrink-0">
              B
            </div>
            <div className="space-y-1">
              <strong className="text-stone-900 block font-serif">B. 勾选绑定：</strong>
              <p className="text-stone-700 leading-relaxed text-[11px]">
                在“轻点三下”中勾选已被你导入的 <strong>“遇袭维权锦囊一触即发指令包”</strong>。未来面临紧急突发状况，只需隔着衣服敲击手机背面三下，就会执行极暗静录。
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
