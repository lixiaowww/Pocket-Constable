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

  const triggerMockRecording = () => {
    if (!mockRecording) {
      // Simulate dimming the screen to render Siri short experience
      setScreenDimmed(true);
      setMockRecording(true);
    } else {
      setMockRecording(false);
      setScreenDimmed(false);
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

  return (
    <div className="relative min-h-screen bg-[#F5F5F0] text-[#1A1A1A] transition-all duration-500 overflow-x-hidden p-3 md:p-6 lg:p-10 border-[6px] md:border-[12px] border-white font-sans selection:bg-yellow-200">
      
      {/* Simulation Screen Dimming Overlay */}
      {screenDimmed && (
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
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto">
        
        {/* Navigation / Hero Header bar - Editorial Theme */}
        <header className="flex justify-between items-end border-b-2 border-black pb-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif font-black tracking-tighter uppercase leading-none text-[#1A1A1A]">治安与侵权维权程序</h1>
            <p className="text-[10px] sm:text-xs font-mono mt-2 tracking-widest uppercase opacity-60 italic">快捷指令防卫与救济生命周期框架 v3.2 / iOS 运行联动</p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-xs sm:text-sm font-bold uppercase tracking-widest">治安防卫 & 民事侵权索赔</p>
            <p className="text-xl sm:text-3xl font-serif italic leading-none mt-1">全流程维权导航</p>
          </div>
        </header>

        {/* Dynamic Warning Alert on top of app - Editorial Design */}
        <div className="bg-[#FAF9F5] border-2 border-black p-5 mb-8 text-xs leading-relaxed max-w-7xl flex gap-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
          <div className="p-2 bg-black text-[#F5F5F0] rounded-sm shrink-0 self-start">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono tracking-widest uppercase block mb-1 font-bold">防殴与合法自卫说明:</span>
            <strong>法律申明与实战底线</strong>：本系统提供的抗辩术及赔偿比例，旨在辅助守法公民在面临不法物理侵害或行政执法瑕疵时，依法在体制内理性、合规地主张民事和行政权利。请坚守<strong>“先动手必然违法”、“还手极易算互殴”</strong>的现代治安红线，极力使用本导航程序，客观留存事实。
          </div>
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
            />
            
            {/* Small widget note under the phone */}
            <div className="mt-5 p-4 bg-white border border-black/10 rounded-sm text-xs text-slate-550 leading-relaxed font-mono">
              <span className="text-black font-semibold uppercase block mb-1">[ 联动交互系统 ]</span>
              在左侧指令选单启动应急动作时，右侧将协同开启法律实操面板。点击录制可在浏览器内触发全黑屏隐蔽防卫取证实验。
            </div>
          </div>

          {/* Right Column: Detailed guides sheets (Span 8 on large screen) */}
          <div className="lg:col-span-8 space-y-8 order-1 lg:order-2">
            
            {/* Navigative top tabs on desktop - Editorial Design */}
            <div className="flex flex-wrap gap-1 bg-white p-1.5 border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
              
              <button
                id="btn-nav-emergency"
                onClick={() => handleStageChange(ActiveStage.EMERGENCY)}
                className={`flex-1 py-3 px-2 text-[11px] tracking-widest uppercase font-mono font-bold transition duration-200 cursor-pointer flex items-center justify-center gap-2 ${
                  activeStage === ActiveStage.EMERGENCY 
                    ? "bg-black text-white" 
                    : "text-slate-700 hover:bg-[#F5F5F0]"
                }`}
              >
                <ShieldAlert className="w-4 h-4" />
                <span>01. 冲突防卫</span>
              </button>

              <button
                id="btn-nav-confrontation"
                onClick={() => handleStageChange(ActiveStage.CONFRONTATION)}
                className={`flex-1 py-3 px-2 text-[11px] tracking-widest uppercase font-mono font-bold transition duration-200 cursor-pointer flex items-center justify-center gap-2 ${
                  activeStage === ActiveStage.CONFRONTATION 
                    ? "bg-black text-white" 
                    : "text-slate-700 hover:bg-[#F5F5F0]"
                }`}
              >
                <UserRoundCheck className="w-4 h-4" />
                <span>02. 抗辩施压</span>
              </button>

              <button
                id="btn-nav-hospital"
                onClick={() => handleStageChange(ActiveStage.HOSPITAL)}
                className={`flex-1 py-3 px-2 text-[11px] tracking-widest uppercase font-mono font-bold transition duration-200 cursor-pointer flex items-center justify-center gap-2 ${
                  activeStage === ActiveStage.HOSPITAL 
                    ? "bg-black text-white" 
                    : "text-slate-700 hover:bg-[#F5F5F0]"
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>03. 医院验伤</span>
              </button>

              <button
                id="btn-nav-claim"
                onClick={() => handleStageChange(ActiveStage.CLAIM)}
                className={`flex-1 py-3 px-2 text-[11px] tracking-widest uppercase font-mono font-bold transition duration-200 cursor-pointer flex items-center justify-center gap-2 ${
                  activeStage === ActiveStage.CLAIM 
                    ? "bg-black text-white" 
                    : "text-slate-700 hover:bg-[#F5F5F0]"
                }`}
              >
                <DollarSign className="w-4 h-4" />
                <span>04. 索赔测算</span>
              </button>

              <button
                id="btn-nav-shortcut"
                onClick={() => handleStageChange(ActiveStage.SHORTCUT)}
                className={`py-3 px-4 text-[11px] tracking-widest uppercase font-mono font-bold transition duration-200 cursor-pointer flex items-center justify-center gap-2 ${
                  activeStage === ActiveStage.SHORTCUT 
                    ? "bg-black text-white" 
                    : "text-slate-700 hover:bg-[#F5F5F0]"
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>05. 导入</span>
              </button>

              <button
                id="btn-nav-admin"
                onClick={() => handleStageChange(ActiveStage.ADMIN)}
                className={`py-3 px-4 text-[11px] tracking-widest uppercase font-mono font-bold transition duration-200 cursor-pointer flex items-center justify-center gap-2 ${
                  activeStage === ActiveStage.ADMIN 
                    ? "bg-black text-white" 
                    : "text-slate-700 hover:bg-[#F5F5F0]"
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>06. 商家控制台</span>
              </button>

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
