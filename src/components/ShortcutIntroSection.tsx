/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  Download, 
  Settings, 
  Smartphone, 
  HeartHandshake, 
  ExternalLink, 
  Share2,
  VolumeX,
  Sun,
  SmartphoneNfc,
  CheckCircle2
} from "lucide-react";
import { SAMPLE_SHORTCUT_CODE, REAL_SHORTCUT_I_CLOUD_LINK } from "../data";

export default function ShortcutIntroSection() {
  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm text-xs font-serif font-bold tracking-widest uppercase bg-[#EAECE6] text-[#333] border border-black/20">
          快捷指令 · 苹果生态联动
        </span>
        <h2 id="shortcut-intro-title" className="text-2xl sm:text-3xl font-serif font-black text-stone-900 mt-2 tracking-tight">
          苹果官方一键导入：将硬核法律维权装进 iPhone
        </h2>
        <p className="text-sm text-stone-600 mt-2 font-mono uppercase tracking-wider text-[11px] opacity-75">
          省去复杂手动配置。点击下方官方分享链接，即可极速导入专为治安事件、防身保护与现场抗辩调解设计的 iOS 原生快捷指令（Shortcuts）。
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
                  治安保命与法治维权一触即发指令包 v3.0
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

          <div className="shrink-0 w-full md:w-auto">
            <a
              id="link-icloud-shortcut-import"
              href={REAL_SHORTCUT_I_CLOUD_LINK}
              target="_blank"
              rel="noreferrer"
              className="w-full md:w-auto py-3 px-6 bg-[#007AFF] hover:bg-[#0062CC] text-white text-xs font-serif font-bold rounded-sm tracking-wide transition duration-150 inline-flex items-center justify-center gap-2 cursor-pointer shadow-sm border border-blue-800"
            >
              <ExternalLink className="w-4 h-4" />
              <span>苹果 iCloud 官方一键导入</span>
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
                在“轻点三下”中勾选已被你导入的 <strong>“治安保命与法治维权一触即发指令包”</strong>。未来面临紧急突发状况，只需隔着衣服敲击手机背面三下，就会执行极暗静录。
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
