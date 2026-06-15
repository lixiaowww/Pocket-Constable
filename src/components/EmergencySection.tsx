/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Mic, 
  VolumeX, 
  Sun, 
  ShieldCheck, 
  AlertTriangle, 
  Camera, 
  RefreshCw, 
  Pause, 
  Play,
  Lightbulb,
  ExternalLink
} from "lucide-react";
import { formatTime } from "../lib/utils";

interface EmergencySectionProps {
  mockRecording: boolean;
  recordingSeconds: number;
  triggerMockRecording: () => void;
  screenDimmed: boolean;
  toggleScreenDim: () => void;
  audioUrl: string | null;
}

export default function EmergencySection({
  mockRecording,
  recordingSeconds,
  triggerMockRecording,
  screenDimmed,
  toggleScreenDim,
  audioUrl,
}: EmergencySectionProps) {
  // We'll use the universal recorder from props now, but keep fallback logic
  const useRealRecorder = true; 

  const activeRecording = mockRecording;
  const activeSeconds = recordingSeconds;
  const handleRecordingToggle = triggerMockRecording;

  // Random audio visualizer heights
  const [visualizerHeights, setVisualizerHeights] = useState<number[]>([15, 8, 24, 12, 18, 6, 22, 14, 10, 20]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeRecording) {
      interval = setInterval(() => {
        setVisualizerHeights(
          Array.from({ length: 15 }, () => Math.floor(Math.random() * 28) + 4)
        );
      }, 150);
    }
    return () => clearInterval(interval);
  }, [activeRecording]);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm text-xs font-serif tracking-widest uppercase bg-[#FAF1F1] text-red-800 border border-red-200">
          <span className="w-1.5 h-1.5 rounded-full bg-red-650 animate-pulse"></span>
          步骤 01: 紧急防殴与录音取证
        </span>
        <h2 id="emergency-title" className="text-2xl sm:text-3xl font-serif font-black text-stone-900 mt-2 tracking-tight">
          被不法肢体侵害？如何低调隐蔽取证防互殴？
        </h2>
        <p className="text-sm text-stone-600 mt-2 font-mono uppercase tracking-wider text-[11px] opacity-75">
          遇到暴力冲突切忌热血冲动。极易算作互殴。请严守静默防御规范。
        </p>
      </div>

      {/* Simulator Run Block */}
      <div className="bg-white text-stone-900 rounded-sm p-4.5 border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] relative">
        <div className="absolute top-0 right-0 bg-red-100 text-red-800 text-[9px] uppercase tracking-widest px-3 py-1.5 font-bold border-l border-b border-black">
          指令.运行中
        </div>

        <h3 className="text-xs font-bold uppercase tracking-widest text-[#1A1A1A] flex items-center gap-2 mb-4">
          <Mic className="w-4 h-4 text-red-650 animate-pulse" />
          快捷动作模拟面板 · 设备运行状态
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Action Row: Volume and Brightness Dimming */}
          <div className="bg-[#FAF9F5] p-4 border border-black space-y-4 rounded-sm">
            <p className="text-[10px] font-bold text-stone-900 uppercase tracking-widest border-b border-black/10 pb-1">快捷全自动控制系统</p>
            
            <div className="flex items-center justify-between text-xs py-1">
              <span className="flex items-center gap-1.5 text-stone-700 font-serif italic">
                <VolumeX className="w-3.5 h-3.5 text-red-600" />
                系统提示音量
              </span>
              <span className="text-xs bg-red-50 text-red-800 px-2 py-0.5 border border-red-300 rounded-sm font-bold">已调至 0% (静音)</span>
            </div>

            <div className="flex items-center justify-between text-xs py-1">
              <span className="flex items-center gap-1.5 text-stone-700 font-serif italic">
                <Sun className="w-3.5 h-3.5 text-amber-600" />
                屏幕显示亮度
              </span>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold ${screenDimmed ? 'text-emerald-700 bg-emerald-50 px-1.5 py-0.5 border border-emerald-300 rounded-sm' : 'text-stone-500'}`}>
                  {screenDimmed ? "已调至 10% (暗)" : "常规 (100%)"}
                </span>
                <button
                  id="btn-toggle-screen-dim"
                  onClick={toggleScreenDim}
                  className="px-2 py-0.5 bg-black hover:bg-[#333] text-[10px] text-white transition rounded-sm cursor-pointer"
                >
                  {screenDimmed ? "还原背光" : "一键调暗"}
                </button>
              </div>
            </div>
          </div>

          {/* Action Row: Silent Recorder */}
          <div className="bg-[#FAF9F5] p-4 border border-black flex flex-col justify-between rounded-sm">
            <div>
              <p className="text-[10px] font-bold text-stone-900 uppercase tracking-widest border-b border-black/10 pb-1 mb-2">
                {useRealRecorder ? "浏览器真录音 (5分钟自动保存)" : "静默录音机制 (5分钟自动保存)"}
              </p>
              
              {activeRecording ? (
                <div className="flex items-end gap-1 h-8 my-3 px-1">
                  {visualizerHeights.map((h, idx) => (
                    <div 
                      key={idx} 
                      className="flex-1 bg-black rounded-sm transition-all duration-150"
                      style={{ height: `${h}px` }}
                    />
                  ))}
                </div>
              ) : (
                <div className="h-8 my-2 flex items-center justify-center text-xs text-stone-400 italic">
                  隐蔽录音程序暂未启动
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-black/10 mt-2">
              <span className="text-xs text-stone-700">
                录音进程: <strong className={activeRecording ? "text-red-700 font-mono font-bold" : "text-stone-400 font-mono"}>{formatTime(activeSeconds)}</strong>
              </span>
              <button
                id="btn-trigger-mock-recording"
                onClick={handleRecordingToggle}
                className={`py-1.5 px-3 text-xs transition rounded-sm cursor-pointer font-bold font-serif ${
                  activeRecording 
                    ? "bg-red-700 hover:bg-red-850 text-white" 
                    : "bg-black hover:bg-stone-900 text-white"
                }`}
              >
                {activeRecording ? "停止录音取证" : "发起隐蔽取证"}
              </button>
            </div>
            
            {audioUrl && !activeRecording && (
              <div className="mt-4 p-3 bg-emerald-50 border border-emerald-300 rounded-sm animate-fadeIn">
                <div className="flex items-center gap-2 mb-2 text-emerald-800">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-xs font-bold font-serif">音频证据已锁定 (仅限本次会话)</span>
                </div>
                <a 
                  href={audioUrl} 
                  download={`遇袭证据_${new Date().toISOString().slice(0,10)}.webm`}
                  className="block w-full text-center py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-sm transition cursor-pointer font-mono"
                >
                  立即下载 .webm 录音文件
                </a>
                <audio 
                  src={audioUrl} 
                  controls 
                  className="w-full mt-2.5 h-8 rounded-sm bg-white border border-emerald-300"
                />
              </div>
            )}

            {useRealRecorder && (
              <p className="text-[9px] text-stone-500 mt-1">停止录音后将自动下载 .webm 文件到手机</p>
            )}

            <div className="mt-3 pt-2 border-t border-black/10 text-[9px] text-amber-800 leading-normal font-sans">
              ⚖️ <strong>证据提示</strong>：录音仅在您本人是对话当事人时方可作为合法证据（最高法证据规定）。
            </div>
          </div>
        </div>

        {/* Floating warning overlay if screen dimmed */}
        {screenDimmed && (
          <p className="text-[9px] text-[#1A1A1A]/50 mt-3 text-center select-none" id="dimmed-preview-warning">
            [ 模拟极弱背光节能防护已生效 · 轻触屏幕任意区域即可恢复正常显示 ]
          </p>
        )}
      </div>

      {/* Defensive Checklist Alert - Critical Warning Speech */}
      <div className="bg-[#FAF1F1] border-l-4 border-red-600 p-5 rounded-sm border border-red-200 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)]">
        <div className="flex gap-4">
          <AlertTriangle className="w-6 h-6 text-red-700 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-mono tracking-widest uppercase font-bold text-red-950">法庭重要采信：黄金防守吼叫词！</h4>
            <div className="text-sm text-stone-800 mt-2 leading-relaxed">
              开启隐蔽音频录制后，身体迅速做出<strong>战术撤退</strong>姿态，绝对禁止推搡挑衅。双手举高并对准音轨清晰大吼：
              <div className="bg-white border border-red-300 p-4 rounded-sm my-2 font-bold font-serif text-lg text-stone-900 select-all relative group cursor-pointer inline-block w-full shadow-sm">
                “你干嘛打人！我一直在退让劝阻！你别靠近我，有话好好说！你别动手、打人是违法的！”
              </div>
              <p className="text-xs text-red-700 font-serif italic mt-2">
                * 核心原理：在法律实践中，这段公开喊话是彻底粉碎行政机关“各打五大板、推定互殴意图”的核心洗冤佐证。证明你自始至终无加害企图，唯行退避义务。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Critical Legal Doctrine: Defense vs. Mutual Combat */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Anti-Mutual Combat Cards */}
        <div className="border border-black rounded-sm p-5 bg-white space-y-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.08)]">
          <h3 className="text-sm font-mono tracking-widest uppercase font-bold text-stone-900 border-b-2 border-black pb-2 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-800" />
            100% 规避司法互殴指控三则
          </h3>
          
          <ul className="space-y-4 text-xs text-stone-700">
            <li className="flex gap-2">
              <span className="w-5 h-5 bg-stone-900 text-white font-mono text-[10px] font-bold flex items-center justify-center shrink-0">I</span>
              <div>
                <strong className="text-stone-900 font-serif block mb-0.5">绝对零出拳、零身体报复</strong>
                哪怕是极其微弱的反推反抓，也极易被视作积极加入互殴。请坚信体制的惩罚烈度，防守后撤是索赔的战略开局。
              </div>
            </li>
            <li className="flex gap-2">
              <span className="w-5 h-5 bg-stone-900 text-white font-mono text-[10px] font-bold flex items-center justify-center shrink-0">II</span>
              <div>
                <strong className="text-stone-900 font-serif block mb-0.5">高声求救以固化周边目击人证</strong>
                高呼：“大家帮帮我！他先动手打了我的脸！路过人作证！”。让在场群众和巡防监控瞬间聚焦。
              </div>
            </li>
            <li className="flex gap-2">
              <span className="w-5 h-5 bg-stone-900 text-white font-mono text-[10px] font-bold flex items-center justify-center shrink-0">III</span>
              <div>
                <strong className="text-stone-900 font-serif block mb-0.5">拒签并拒绝各打五大板调解书</strong>
                不妥协民警告知由头是纠纷互殴。依据最高人民法院司法建议，防卫行为具有制止违法侵害的目的，不因反抗动作而被推定具有互相斗殴意图。
              </div>
            </li>
          </ul>
        </div>

        {/* Surround Camera Locking Checklist */}
        <div className="border border-black rounded-sm p-4.5 bg-white space-y-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.08)]">
          <h3 className="text-sm font-mono tracking-widest uppercase font-bold text-stone-900 border-b-2 border-black pb-2 flex items-center gap-2">
            <Camera className="w-5 h-5" />
            锁定五类监控
          </h3>
          
          <p className="text-[11px] text-stone-500 font-mono">
            冲突一旦发生，行为轨迹极其迅速，事后查找极易由于存储天数或人为删除导致灭失。立刻定位并盘点：
          </p>
 
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="bg-[#FAF9F5] p-2.5 border border-black/10 flex items-center gap-2 rounded-sm">
              <span className="w-1.5 h-1.5 bg-black rounded-full shrink-0"></span>
              <div>
                <p className="font-bold text-stone-900 font-serif">十字路口监控</p>
                <p className="text-stone-500 text-[9px] font-mono">天网系统，公安直接调取</p>
              </div>
            </div>
            
            <div className="bg-[#FAF9F5] p-2.5 border border-black/10 flex items-center gap-2 rounded-sm">
              <span className="w-1.5 h-1.5 bg-black rounded-full shrink-0"></span>
              <div>
                <p className="font-bold text-stone-900 font-serif">沿路商铺监控</p>
                <p className="text-stone-500 text-[9px] font-mono">极易被循环覆盖，尽早去求助</p>
              </div>
            </div>
 
            <div className="bg-[#FAF9F5] p-2.5 border border-black/10 flex items-center gap-2 rounded-sm">
              <span className="w-1.5 h-1.5 bg-black rounded-full shrink-0"></span>
              <div>
                <p className="font-bold text-stone-900 font-serif">行车记录仪</p>
                <p className="text-stone-500 text-[9px] font-mono">拍下路过车辆，争取记录仪</p>
              </div>
            </div>
 
            <div className="bg-[#FAF9F5] p-2.5 border border-black/10 flex items-center gap-2 rounded-sm">
              <span className="w-1.5 h-1.5 bg-black rounded-full shrink-0"></span>
              <div>
                <p className="font-bold text-stone-900 font-serif">物业园区探头</p>
                <p className="text-stone-500 text-[9px] font-mono">保安岗亭存证，口头要求调阅</p>
              </div>
            </div>
          </div>
 
          <div className="bg-[#FAF9F5] p-3 border-l-2 border-black flex gap-2 rounded-sm">
            <Lightbulb className="w-4 h-4 text-stone-700 shrink-0 mt-0.5" />
            <p className="text-[10px] text-stone-700 leading-normal">
              <strong>周边车辆行车记录仪锁定技巧</strong>：被打冲突一般发生极快。最快还原现场真相的方案，是起身后当即录像、拍下周边所有停泊车辆的车牌号与车头位置。事后可通过民警依车牌协查记录仪前后录制的碰撞或冲突盲区内容。
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
