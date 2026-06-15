/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { ActiveStage } from "../types";
import { 
  ShieldAlert, 
  UserRoundCheck, 
  FileText, 
  DollarSign, 
  Compass, 
  VolumeX, 
  Smartphone, 
  Download,
  Clock
} from "lucide-react";

interface ShortcutSimulatorProps {
  activeStage: ActiveStage;
  onStageChange: (stage: ActiveStage) => void;
  mockRecording: boolean;
  recordingSeconds: number;
  triggerMockRecording: () => void;
  audioUrl: string | null;
}

export default function ShortcutSimulator({
  activeStage,
  onStageChange,
  mockRecording,
  recordingSeconds,
  triggerMockRecording,
  audioUrl,
}: ShortcutSimulatorProps) {
  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="w-full max-w-sm mx-auto bg-black border-4 border-black rounded-[40px] shadow-[8px_8px_0px_0px_rgba(0,0,0,0.15)] overflow-hidden relative aspect-[9/19] flex flex-col font-sans ring-4 ring-neutral-200">
      {/* Notch / Speaker block */}
      <div className="absolute top-0 inset-x-0 h-7 bg-black flex justify-center items-end z-30 pb-0.5">
        <div className="w-28 h-4 bg-neutral-900 rounded-full flex items-center justify-between px-3 text-[9px] text-stone-500 font-mono">
          <span>{new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
        </div>
      </div>

      {/* Screen Container */}
      <div className="flex-1 pt-8 px-4 pb-6 flex flex-col justify-between overflow-y-auto no-scrollbar bg-[#FDFDFB] text-stone-900">
        
        {/* iOS StatusBar Simulated and Header */}
        <div className="mb-4">
          <div className="flex items-center justify-between mt-2 mb-4 text-xs">
            <div className="flex items-center gap-1 font-bold text-stone-900">
              <Compass className="w-3.5 h-3.5 text-stone-900" />
              <span className="font-mono tracking-tight text-[11px]">维权程序 · 快捷指令</span>
            </div>
            <div className="flex items-center gap-1.5 text-[9px] font-mono bg-black text-white px-2 py-0.5 rounded-sm">
              <span>系统运行状态：活跃</span>
            </div>
          </div>

          <div className="bg-[#FAF9F5] rounded-sm p-4 border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]">
            <h3 className="text-xs font-mono font-bold text-stone-900 flex items-center gap-1.5 uppercase [word-spacing:1px]">
              <Smartphone className="w-4 h-4" />
              iPhone 维权快捷动作流
            </h3>
            <p className="text-[11px] text-stone-650 mt-2 leading-relaxed">
              这是高度集成的快捷指令菜单结构。轻按以下节点，可同步右侧的具体法条抗辩及算件明细。
            </p>
          </div>
        </div>

        {/* Dynamic Island style action banner when simulating recording */}
        {mockRecording && (
          <div className="mb-4 bg-rose-50 border border-red-500 rounded-sm p-3 flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-650"></span>
              </span>
              <div className="text-[11px]">
                <p className="font-bold text-red-950 font-serif italic">实时音频取证中...</p>
                <p className="text-[9px] text-red-700 font-mono flex items-center gap-1">
                  <VolumeX className="w-3 h-3" />
                  [ 正在写入浏览器缓存 ]
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs bg-black text-[#F5F5F0] px-2 py-0.5 rounded-sm flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatTime(recordingSeconds)}
              </span>
              <button 
                onClick={triggerMockRecording}
                className="text-[10px] bg-red-700 hover:bg-red-800 text-white px-2 py-1 rounded-sm font-bold transition cursor-pointer font-serif"
              >
                结束
              </button>
            </div>
          </div>
        )}

        {/* Download Link when audio is ready */}
        {!mockRecording && audioUrl && (
          <div className="mb-4 bg-emerald-50 border border-emerald-500 rounded-sm p-3 animate-fadeIn">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-emerald-600 text-white rounded-full">
                  <Download className="w-3 h-3" />
                </div>
                <span className="text-[11px] font-bold text-emerald-900 font-serif italic">取证音频已就绪</span>
              </div>
              <span className="text-[9px] font-mono text-emerald-600 bg-white px-1 border border-emerald-200 uppercase">无痕保存</span>
            </div>
            <a 
              href={audioUrl} 
              download={`遇袭证据_${new Date().toISOString().slice(0,10)}_${new Date().toTimeString().slice(0,5).replace(':','-')}.webm`}
              className="block w-full text-center py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-sm transition cursor-pointer font-mono"
            >
              点击下载加密录音至本地
            </a>
            <p className="text-[8px] text-emerald-700 mt-2 leading-tight text-center opacity-70">
              提示：音频仅存在于当前浏览器内存中，刷新页面将永久消失，请立即保存。
            </p>
          </div>
        )}

        {/* Siri / Widget Menu Panel */}
        <div className="flex-1 flex flex-col justify-center space-y-3 py-2">
          <p className="text-[10px] uppercase tracking-widest text-[#1A1A1A]/60 font-mono font-bold px-1">
            [ 维权联动动作菜单 · 请选择 ]
          </p>

          {/* Menu Option 1 */}
          <button
            id="btn-shortcut-stage-emergency"
            onClick={() => onStageChange(ActiveStage.EMERGENCY)}
            className={`w-full text-left p-3 rounded-sm border transition-all duration-300 flex items-center justify-between relative group cursor-pointer ${
              activeStage === ActiveStage.EMERGENCY
                ? "bg-[#FAF1F1] border-red-600 text-red-950 shadow-[3px_3px_0px_0px_rgba(224,36,36,0.3)]"
                : "bg-white hover:bg-[#FAF9F5] border-stone-300 text-stone-800"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-1.5 transition ${
                activeStage === ActiveStage.EMERGENCY ? "bg-red-800 text-white" : "bg-[#FAF9F5] text-stone-500 border border-stone-300"
              }`}>
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[12px] font-bold font-serif flex items-center gap-1.5">
                  <span>阶段 1：我刚刚被打伤</span>
                  <span className="text-[9px] font-mono bg-red-100 text-red-800 px-1 rounded-sm">立即执行</span>
                </div>
                <div className="text-[10px] text-stone-500 mt-0.5 font-mono">秒启极暗静默录制 / 避免互殴</div>
              </div>
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-stone-400 group-hover:bg-red-650 transition" />
          </button>

          {/* Menu Option 2 */}
          <button
            id="btn-shortcut-stage-confrontation"
            onClick={() => onStageChange(ActiveStage.CONFRONTATION)}
            className={`w-full text-left p-3 rounded-sm border transition-all duration-300 flex items-center justify-between relative group cursor-pointer ${
              activeStage === ActiveStage.CONFRONTATION
                ? "bg-[#FAF6ED] border-amber-600 text-amber-950 shadow-[3px_3px_0px_0px_rgba(217,119,6,0.3)]"
                : "bg-white hover:bg-[#FAF9F5] border-stone-300 text-stone-800"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-1.5 transition ${
                activeStage === ActiveStage.CONFRONTATION ? "bg-amber-800 text-white" : "bg-[#FAF9F5] text-stone-500 border border-stone-300"
              }`}>
                <UserRoundCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[12px] font-bold font-serif">阶段 2：对抗不作为/施压</p>
                <p className="text-[10px] text-stone-500 mt-0.5 font-mono">投诉12389，拒绝草率结案</p>
              </div>
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-stone-400 group-hover:bg-amber-600 transition" />
          </button>

          {/* Menu Option 3 */}
          <button
            id="btn-shortcut-stage-hospital"
            onClick={() => onStageChange(ActiveStage.HOSPITAL)}
            className={`w-full text-left p-3 rounded-sm border transition-all duration-300 flex items-center justify-between relative group cursor-pointer ${
              activeStage === ActiveStage.HOSPITAL
                ? "bg-[#EDF7F1] border-emerald-600 text-emerald-950 shadow-[3px_3px_0px_0px_rgba(16,185,129,0.3)]"
                : "bg-white hover:bg-[#FAF9F5] border-stone-300 text-stone-800"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-1.5 transition ${
                activeStage === ActiveStage.HOSPITAL ? "bg-emerald-800 text-white" : "bg-[#FAF9F5] text-stone-500 border border-stone-300"
              }`}>
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[12px] font-bold font-serif">阶段 3：医院验伤避坑防漏</p>
                <p className="text-[10px] text-stone-500 mt-0.5 font-mono">精细项目自查，拒绝轻伤误诊</p>
              </div>
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-stone-400 group-hover:bg-emerald-600 transition" />
          </button>

          {/* Menu Option 4 */}
          <button
            id="btn-shortcut-stage-claim"
            onClick={() => onStageChange(ActiveStage.CLAIM)}
            className={`w-full text-left p-3 rounded-sm border transition-all duration-300 flex items-center justify-between relative group cursor-pointer ${
              activeStage === ActiveStage.CLAIM
                ? "bg-[#EDF5F7] border-cyan-600 text-cyan-950 shadow-[3px_3px_0px_0px_rgba(6,182,212,0.3)]"
                : "bg-white hover:bg-[#FAF9F5] border-stone-300 text-stone-800"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-1.5 transition ${
                activeStage === ActiveStage.CLAIM ? "bg-cyan-800 text-white" : "bg-[#FAF9F5] text-stone-500 border border-stone-300"
              }`}>
                <DollarSign className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[12px] font-bold font-serif">阶段 4：索赔清单及算件明细</p>
                <p className="text-[10px] text-stone-500 mt-0.5 font-mono">法条追索：误工、伙食、精神慰藉</p>
              </div>
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-stone-400 group-hover:bg-cyan-600 transition" />
          </button>
        </div>

        {/* Shortcuts iCloud standard installation link */}
        <div className="mt-4 pt-4 border-t border-stone-200 text-center">
          <button
            id="btn-shortcut-stage-shortcut"
            onClick={() => onStageChange(ActiveStage.SHORTCUT)}
            className="w-full py-2.5 px-4 bg-black text-[#F5F5F0] hover:bg-neutral-900 text-xs font-serif font-bold rounded-sm inline-flex items-center justify-center gap-2 transition duration-200 shadow-sm cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>获取快捷指令安装包</span>
          </button>
          <p className="text-[9px] text-stone-500 mt-1.5 leading-tight font-sans">
            专为 iOS 快捷指令原生联动分发设计。请在 iPhone 的 Safari 浏览器中浏览打开。
          </p>
        </div>
      </div>

      {/* Home Indicator bar */}
      <div className="h-4 bg-black flex items-center justify-center">
        <div className="w-28 h-1 bg-stone-700 rounded-full" />
      </div>
    </div>
  );
}
