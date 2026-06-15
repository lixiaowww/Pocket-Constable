/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { ActiveStage } from "./types";
import ShortcutSimulator from "./components/ShortcutSimulator";
import EmergencySection from "./components/EmergencySection";
import ConfrontationSection from "./components/ConfrontationSection";
import HospitalSection from "./components/HospitalSection";
import ClaimsSection from "./components/ClaimsSection";
import ShortcutIntroSection from "./components/ShortcutIntroSection";
import AdminConsoleSection from "./components/AdminConsoleSection";
import ActivationGate from "./components/ActivationGate";
import PwaInstallBanner from "./components/PwaInstallBanner";
import {
  hasValidLocalLicense,
  getLicenseKeyFromUrl,
  validateLicenseKey,
  stripLicenseParamsFromUrl,
} from "./lib/license";
import { 
  ShieldAlert, 
  Scale, 
  HelpCircle, 
  Volume2, 
  Share2, 
  Moon, 
  UserRoundCheck, 
  FileText, 
  DollarSign, 
  Smartphone,
  CheckCircle,
  Clock,
  Mic,
  VolumeX,
  Compass,
  Shield
} from "lucide-react";

export default function App() {
  const [activeStage, setActiveStage] = useState<ActiveStage>(ActiveStage.EMERGENCY);
  const [mockRecording, setMockRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [screenDimmed, setScreenDimmed] = useState<boolean>(false);
  const [activated, setActivated] = useState(false);
  const [checkingLicense, setCheckingLicense] = useState(true);
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [emergencyModeActive, setEmergencyModeActive] = useState<boolean>(false);
  const [showAdminTab, setShowAdminTab] = useState(false);

  useEffect(() => {
    const checkAdmin = () => {
      const params = new URLSearchParams(window.location.search);
      const isQuery = params.get("admin") === "true";
      const hasSession = typeof sessionStorage !== "undefined" && !!sessionStorage.getItem("sh_admin_session");
      if (isQuery || hasSession) {
        setShowAdminTab(true);
      }
    };
    checkAdmin();
  }, [activeStage]);

  useEffect(() => {
    let cancelled = false;

    async function initLicense() {
      if (hasValidLocalLicense()) {
        if (!cancelled) {
          setActivated(true);
          setCheckingLicense(false);
        }
        return;
      }

      const urlKey = getLicenseKeyFromUrl();
      if (urlKey) {
        const result = await validateLicenseKey(urlKey);
        stripLicenseParamsFromUrl();
        if (!cancelled) {
          setActivated(result.valid);
          setCheckingLicense(false);
        }
        return;
      }

      if (!cancelled) {
        setActivated(false);
        setCheckingLicense(false);
      }
    }

    initLicense();
    return () => {
      cancelled = true;
    };
  }, []);

  // Counter effect for simulated recording
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (mockRecording) {
      interval = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => clearInterval(interval);
  }, [mockRecording]);

  const triggerMockRecording = async () => {
    if (!mockRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Auto-detect best supported audio format (iOS Safari doesn't support webm)
        const mimeTypes = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/aac", ""];
        const mimeType = mimeTypes.find(t => !t || MediaRecorder.isTypeSupported(t)) || "";
        const options: MediaRecorderOptions = mimeType ? { mimeType } : {};
        const mediaRecorder = new MediaRecorder(stream, options);
        const chunks: Blob[] = [];
        
        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
        };
        
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: mimeType || "audio/webm" });
          const url = URL.createObjectURL(blob);
          setAudioUrl(url);
          // Stop all tracks to release the microphone
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        setRecorder(mediaRecorder);
        setAudioUrl(null); // Reset previous recording
        setScreenDimmed(true);
        setMockRecording(true);
      } catch (err) {
        console.error("无法启动录音:", err);
        alert("录音失败：请确保已授权麦克风权限。部分 iOS 浏览器可能不支持此功能。");
      }
    } else {
      if (recorder && recorder.state !== "inactive") {
        recorder.stop();
      }
      setMockRecording(false);
      setScreenDimmed(false);
    }
  };

  const handleStartEmergencyMode = async () => {
    setEmergencyModeActive(true);
    setActiveStage(ActiveStage.EMERGENCY);
    if (!mockRecording) {
      await triggerMockRecording();
    } else {
      setScreenDimmed(true);
    }
  };

  const handleStageChange = (stage: ActiveStage) => {
    setActiveStage(stage);
    
    // Auto-scroll to title when switching stages on mobile
    const titles: Record<ActiveStage, string> = {
      [ActiveStage.EMERGENCY]: "emergency-title",
      [ActiveStage.CONFRONTATION]: "confrontation-title",
      [ActiveStage.HOSPITAL]: "hospital-title",
      [ActiveStage.CLAIM]: "claims-title",
      [ActiveStage.SHORTCUT]: "shortcut-intro-title",
      [ActiveStage.ADMIN]: "admin-console-title"
    };

    setTimeout(() => {
      const element = document.getElementById(titles[stage]);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  if (checkingLicense) {
    return (
      <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center">
        <p className="text-xs font-mono tracking-widest uppercase text-stone-500">正在加载...</p>
      </div>
    );
  }

  if (!activated) {
    return <ActivationGate onActivated={() => setActivated(true)} />;
  }

  return (
    <div className="relative min-h-screen bg-[#F5F5F0] text-[#1A1A1A] transition-all duration-500 overflow-x-hidden p-3 md:p-6 lg:p-10 border-[6px] md:border-[12px] border-white font-sans selection:bg-yellow-200">
      
      {/* Simulation Screen Dimming Overlay / Emergency Mode Overlay */}
      {screenDimmed && (
        emergencyModeActive ? (
          <div 
            className="fixed inset-0 bg-black z-50 pointer-events-auto flex flex-col justify-between p-6 text-white animate-fadeIn"
          >
            {/* Top Info */}
            <div className="flex justify-between items-center text-xs font-mono border-b border-red-950/30 pb-3">
              <span className="flex items-center gap-2 text-red-500 font-bold tracking-widest animate-pulse">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
                🆘 紧急防卫取证模式中
              </span>
              <span className="bg-red-950 text-red-400 px-2 py-0.5 rounded font-mono">
                录音已运行: {Math.floor(recordingSeconds / 60)}分 {(recordingSeconds % 60).toString().padStart(2, "0")}秒
              </span>
            </div>

            {/* Core Alert Phrase in Massive Bold Red Box */}
            <div className="flex-1 flex flex-col justify-center items-center max-w-2xl mx-auto text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-red-650/10 border-2 border-red-500 flex items-center justify-center animate-pulse">
                <Mic className="w-8 h-8 text-red-500" />
              </div>
              <p className="text-stone-405 text-xs font-mono uppercase tracking-widest">
                请立刻后撤，双手举高，朝侵害人高声大吼：
              </p>
              <div className="bg-red-950/60 border border-red-900 text-red-200 p-6 rounded-xl font-bold font-serif text-xl sm:text-2xl leading-relaxed shadow-lg select-all">
                “你干嘛打人！我一直在退让劝阻！你别靠近我，有话好好说！你别动手、打人是违法的！”
              </div>
              <p className="text-[11px] text-stone-500 leading-normal max-w-md mx-auto">
                原理：高声抗议能够让设备录下清晰音轨，在警方定性时，该录音将证明您自始至终在防守、无斗殴企图，是粉碎“各打五大板”定性的核心铁证。
              </p>
            </div>

            {/* Bottom Actions */}
            <div className="border-t border-slate-900 pt-4 flex flex-col items-center gap-3">
              <button
                onClick={() => {
                  setScreenDimmed(false);
                  setEmergencyModeActive(false);
                  if (mockRecording) {
                    triggerMockRecording(); // stop recording
                  }
                }}
                className="w-full max-w-sm py-3 bg-red-600 hover:bg-red-700 text-white font-serif font-black tracking-widest text-sm rounded-sm transition cursor-pointer"
              >
                退出应急自卫模式 (停止录音)
              </button>
              <p className="text-[9px] text-stone-600 font-mono tracking-widest">
                退出后系统会自动将录制好的音频文件下载至您的本地设备
              </p>
            </div>
          </div>
        ) : (
          <div 
            onClick={() => setScreenDimmed(false)}
            className="fixed inset-0 bg-black/95 z-50 transition-all duration-300 pointer-events-auto flex flex-col items-center justify-center text-[#F5F5F0]"
          >
            <div className="max-w-md w-full px-6 text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-red-650/10 border-2 border-dashed border-red-500 mx-auto flex items-center justify-center animate-pulse">
                <Mic className="w-10 h-10 text-red-500" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-serif font-bold tracking-tight">模拟屏幕亮度: 10%</h2>
                <p className="text-xs font-mono tracking-widest uppercase opacity-80">
                  [ 录音器已静默启动: {Math.floor(recordingSeconds / 60)}分 {(recordingSeconds % 60).toString().padStart(2, "0")}秒 ]
                </p>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed max-w-sm mx-auto bg-white/5 p-5 border border-white/10 font-mono">
                系统运行参数：所有设备音频输出均已静音，屏幕背光降至最低微弱亮级。可防御在面对身体直接冲突时录音被暴徒中途夺下并强制物理删除。
              </p>
              <div className="pt-4 text-[10px] font-mono tracking-widest opacity-40 uppercase">
                - 点击或轻触屏幕任意区域 即可恢复正常显示 -
              </div>
            </div>
          </div>
        )
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto">
        
        {/* Navigation / Hero Header bar - Editorial Theme */}
        <header className="flex justify-between items-end border-b-2 border-black pb-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif font-black tracking-tighter uppercase leading-none text-[#1A1A1A]">遇袭维权锦囊</h1>
            <p className="text-[10px] sm:text-xs font-mono mt-2 tracking-widest uppercase opacity-60 italic">遇袭防身与法律维权一键导航 v3.3 / iOS 快捷指令 · 安卓 PWA</p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-xs sm:text-sm font-bold uppercase tracking-widest">紧急遇袭防身 & 民事索赔</p>
            <p className="text-xl sm:text-3xl font-serif italic leading-none mt-1">全流程维权锦囊</p>
          </div>
        </header>

        <PwaInstallBanner />

        {/* Dynamic Warning Alert on top of app - Editorial Design */}
        <div className="bg-[#FAF9F5] border-2 border-black p-5 mb-4 text-xs leading-relaxed max-w-7xl flex gap-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
          <div className="p-2 bg-black text-[#F5F5F0] rounded-sm shrink-0 self-start">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono tracking-widest uppercase block mb-1 font-bold">防殴与合法自卫说明:</span>
            <strong>法律申明与实战底线</strong>：本系统提供的抗辩术及赔偿比例，旨在辅助守法公民在面临不法物理侵害或行政执法瑕疵时，依法在体制内理性、合规地主张民事和行政权利。请坚守<strong>“先动手必然违法”、“还手极易算互殴”</strong>的现代治安红线，极力使用本导航程序，客观留存事实。
          </div>
        </div>

        {/* Legal Disclaimer Box */}
        <div className="bg-amber-50 border border-amber-300 p-4 mb-8 text-xs text-amber-950 flex gap-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)] rounded-sm">
          <div className="shrink-0 text-amber-800 font-bold mt-0.5">⚖️</div>
          <div>
            <strong>法律免责声明：</strong>
            本工具提供的法律知识、话术模板及赔偿计算仅供参考，不构成专业法律意见。具体法律事务请咨询执业律师。本工具内容最后更新于 2026 年 6 月，适用于中华人民共和国大陆地区法律体系。
          </div>
        </div>

        {/* One-Click Emergency Trigger Box */}
        <div className="mb-8 bg-red-50 border border-red-200 p-4.5 rounded-sm flex flex-col sm:flex-row justify-between items-center gap-4 shadow-[4px_4px_0px_0px_rgba(224,36,36,0.1)]">
          <div className="space-y-1">
            <h3 className="text-sm font-serif font-black text-red-950 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
              🆘 紧急肢体侵害突发？一键隐蔽取证防互殴模式
            </h3>
            <p className="text-xs text-red-900 leading-relaxed">
              立刻进入静默防守取证模式：全屏投射法庭黄金防守吼叫词并录制音频凭证，证明无互殴意图。
            </p>
          </div>
          <button
            onClick={handleStartEmergencyMode}
            className="w-full sm:w-auto py-3 px-8 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-serif font-black tracking-widest text-xs rounded-sm transition duration-200 cursor-pointer shadow-md flex items-center justify-center gap-2 shrink-0 animate-pulse"
          >
            一键应急自卫 🆘
          </button>
        </div>

        {/* Main Grid: Left is Simulator, Right is Details Panel */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Mobile Simulator View (Span 4 on large screen, first order) */}
          <div className="lg:col-span-4 lg:sticky lg:top-6 order-2 lg:order-1">
            <div className="text-center mb-3 lg:hidden">
              <span className="text-xs font-mono tracking-widest uppercase opacity-50">↓ 苹果快捷指令 iOS 运行环境模拟 ↓</span>
            </div>
            
            <ShortcutSimulator
              activeStage={activeStage}
              onStageChange={handleStageChange}
              mockRecording={mockRecording}
              recordingSeconds={recordingSeconds}
              triggerMockRecording={triggerMockRecording}
              audioUrl={audioUrl}
            />
            
            {/* Small widget note under the phone */}
            <div className="mt-5 p-4 bg-white border border-black/10 rounded-sm text-xs text-slate-550 leading-relaxed font-mono">
              <span className="text-black font-semibold uppercase block mb-1">[ 联动交互系统 ]</span>
              在左侧指令选单启动应急动作时，右侧将协同开启法律实操面板。点击录制可在浏览器内触发全黑屏隐蔽防卫取证实验。
            </div>
          </div>

          {/* Right Column: Detailed guides sheets (Span 8 on large screen) */}
          <div className="lg:col-span-8 space-y-8 order-1 lg:order-2">
            
            {/* Navigative top tabs - Responsive Editorial Design with horizontal scroll */}
            <div className="flex flex-row overflow-x-auto gap-1 bg-white p-1.5 border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] no-scrollbar shrink-0">
              
              <button
                id="btn-nav-emergency"
                onClick={() => handleStageChange(ActiveStage.EMERGENCY)}
                className={`shrink-0 py-3 px-3.5 text-[10px] md:text-[11px] tracking-widest uppercase font-mono font-bold transition duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeStage === ActiveStage.EMERGENCY 
                    ? "bg-black text-white" 
                    : "text-slate-700 hover:bg-[#F5F5F0]"
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span><span className="hidden md:inline">01. </span>冲突防卫</span>
              </button>

              <button
                id="btn-nav-confrontation"
                onClick={() => handleStageChange(ActiveStage.CONFRONTATION)}
                className={`shrink-0 py-3 px-3.5 text-[10px] md:text-[11px] tracking-widest uppercase font-mono font-bold transition duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeStage === ActiveStage.CONFRONTATION 
                    ? "bg-black text-white" 
                    : "text-slate-700 hover:bg-[#F5F5F0]"
                }`}
              >
                <UserRoundCheck className="w-3.5 h-3.5" />
                <span><span className="hidden md:inline">02. </span>抗辩施压</span>
              </button>

              <button
                id="btn-nav-hospital"
                onClick={() => handleStageChange(ActiveStage.HOSPITAL)}
                className={`shrink-0 py-3 px-3.5 text-[10px] md:text-[11px] tracking-widest uppercase font-mono font-bold transition duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeStage === ActiveStage.HOSPITAL 
                    ? "bg-black text-white" 
                    : "text-slate-700 hover:bg-[#F5F5F0]"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span><span className="hidden md:inline">03. </span>医院验伤</span>
              </button>

              <button
                id="btn-nav-claim"
                onClick={() => handleStageChange(ActiveStage.CLAIM)}
                className={`shrink-0 py-3 px-3.5 text-[10px] md:text-[11px] tracking-widest uppercase font-mono font-bold transition duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeStage === ActiveStage.CLAIM 
                    ? "bg-black text-white" 
                    : "text-slate-700 hover:bg-[#F5F5F0]"
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span><span className="hidden md:inline">04. </span>索赔测算</span>
              </button>

              <button
                id="btn-nav-shortcut"
                onClick={() => handleStageChange(ActiveStage.SHORTCUT)}
                className={`shrink-0 py-3 px-3.5 text-[10px] md:text-[11px] tracking-widest uppercase font-mono font-bold transition duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeStage === ActiveStage.SHORTCUT 
                    ? "bg-black text-white" 
                    : "text-slate-700 hover:bg-[#F5F5F0]"
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span><span className="hidden md:inline">05. </span>导入</span>
              </button>

              {showAdminTab && (
                <button
                  id="btn-nav-admin"
                  onClick={() => handleStageChange(ActiveStage.ADMIN)}
                  className={`shrink-0 py-3 px-3.5 text-[10px] md:text-[11px] tracking-widest uppercase font-mono font-bold transition duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeStage === ActiveStage.ADMIN 
                      ? "bg-black text-white" 
                      : "text-slate-700 hover:bg-[#F5F5F0]"
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span><span className="hidden md:inline">06. </span>控制台</span>
                </button>
              )}

            </div>

            {/* Stage content switch rendering */}
            <div className="bg-[#FAF9F5] p-6 border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
              {activeStage === ActiveStage.EMERGENCY && (
                <EmergencySection
                  mockRecording={mockRecording}
                  recordingSeconds={recordingSeconds}
                  triggerMockRecording={triggerMockRecording}
                  screenDimmed={screenDimmed}
                  toggleScreenDim={() => setScreenDimmed(!screenDimmed)}
                  audioUrl={audioUrl}
                />
              )}

              {activeStage === ActiveStage.CONFRONTATION && (
                <ConfrontationSection />
              )}

              {activeStage === ActiveStage.HOSPITAL && (
                <HospitalSection />
              )}

              {activeStage === ActiveStage.CLAIM && (
                <ClaimsSection />
              )}

              {activeStage === ActiveStage.SHORTCUT && (
                <ShortcutIntroSection />
              )}

              {activeStage === ActiveStage.ADMIN && (
                <AdminConsoleSection />
              )}
            </div>

            {/* Shared bottom legal help guide or tips - Editorial Design */}
            <footer className="pt-6 border-t border-black flex flex-col sm:flex-row justify-between items-center text-[10px] font-mono tracking-wide text-stone-500 gap-4">
              <span>© 民法典侵权编第1179条及处罚程序指南 · ALL DATA SECURED LOCAL</span>
              <div className="flex items-center gap-4">
                <a 
                  href="https://www.gov.cn/gongbao/content/2020/content_5521633.htm" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="hover:text-black hover:underline transition flex items-center gap-0.5"
                >
                  中华人民共和国民法典条款
                </a>
                <span>|</span>
                <a 
                  href="https://www.mps.gov.cn" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="hover:text-black hover:underline transition flex items-center gap-0.5"
                >
                  公安监督热线
                </a>
              </div>
            </footer>

          </div>

        </main>

      </div>
    </div>
  );
}
