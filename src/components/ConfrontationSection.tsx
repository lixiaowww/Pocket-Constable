/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { COPING_EXCUSES } from "../data";
import { CopingExcuse } from "../types";
import { 
  Copy, 
  Check, 
  Volume2, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp, 
  PhoneCall, 
  BookOpen, 
  ShieldAlert 
} from "lucide-react";

export default function ConfrontationSection() {
  const [activeExcuseId, setActiveExcuseId] = useState<string>("mutual_combat");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const activeExcuse = COPING_EXCUSES.find(e => e.id === activeExcuseId) || COPING_EXCUSES[0];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm text-xs font-serif tracking-widest uppercase bg-[#FAF6ED] text-amber-800 border border-amber-300">
          步骤 02: 拒绝派出所不作为与各打五大板
        </span>
        <h2 id="confrontation-title" className="text-2xl sm:text-3xl font-serif font-black text-stone-900 mt-2 tracking-tight">
          对峙和稀泥：在派出所如何依法自我抗辩？
        </h2>
        <p className="text-sm text-stone-600 mt-2 font-mono uppercase tracking-wider text-[11px] opacity-75">
          办案人员如为息事宁人强推各打五百行政和解。点击以下场景进行严肃反击。
        </p>
      </div>

      {/* Interactive Anti-Compromise Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Side: Excuse triggers */}
        <div className="lg:col-span-5 space-y-2">
          <p className="text-[10px] text-stone-500 uppercase tracking-widest font-mono font-bold">[ 警民场景对抗选单 ]</p>
          {COPING_EXCUSES.map((item) => {
            const isSelected = item.id === activeExcuseId;
            return (
              <button
                key={item.id}
                id={`btn-excuse-${item.id}`}
                onClick={() => setActiveExcuseId(item.id)}
                className={`w-full text-left p-3.5 rounded-sm border text-xs transition duration-200 cursor-pointer flex items-center justify-between ${
                  isSelected 
                    ? "bg-black border-black text-white font-bold"
                    : "bg-white hover:bg-[#FAF9F5] border-stone-300 text-stone-700"
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className={`w-1.5 h-1.5 rounded-full mt-1 shrink-0 ${isSelected ? "bg-white animate-pulse" : "bg-stone-300"}`} />
                  <p className="line-clamp-2 leading-relaxed font-serif text-[12px]">{item.excuse}</p>
                </div>
                {isSelected ? <ChevronUp className="w-4 h-4 text-white shrink-0 ml-1" /> : <ChevronDown className="w-4 h-4 text-stone-400 shrink-0 ml-1" />}
              </button>
            );
          })}
        </div>

        {/* Right Side: Elaborate Fightback Panel */}
        <div className="lg:col-span-7" id="confrontation-response-panel">
          <div className="bg-white text-stone-900 rounded-sm p-5 border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.15)] flex flex-col justify-between h-full space-y-5">
            
            {/* Core Speech Section */}
            <div>
              <div className="flex items-center justify-between border-b border-black/10 pb-3 mb-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900">
                  <Volume2 className="w-4 h-4 text-stone-850 animate-pulse" />
                  <span>[ 现场直接口头宣读的抗辩话术 ]</span>
                </div>
                <button
                  id="btn-copy-counter-speech"
                  onClick={() => handleCopy(activeExcuse.response, activeExcuse.id)}
                  className="px-2.5 py-1 bg-black hover:bg-neutral-900 text-white rounded-sm text-[11px] font-sans font-bold transition cursor-pointer flex items-center gap-1"
                >
                  {copiedId === activeExcuse.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>复制成功</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>一键复制</span>
                    </>
                  )}
                </button>
              </div>

              {/* Text Area */}
              <div className="bg-[#FAF9F5] border border-black/15 p-4 rounded-sm relative">
                <p className="text-[13px] sm:text-sm font-medium leading-relaxed text-stone-950 font-serif underline decoration-stone-300 decoration-dotted">
                   {activeExcuse.response}
                </p>
                <span className="absolute bottom-2 right-2 text-[9px] text-stone-400 select-none">
                  (长按/双击选择)
                </span>
              </div>
            </div>

            {/* Legal Basis and Tips */}
            <div className="space-y-4">
              {/* Legal basis */}
              <div className="bg-[#FAF9F5] border-l-2 border-black pl-3 py-1.5 text-xs rounded-sm">
                <h4 className="font-bold text-stone-900 flex items-center gap-1.5 mb-1 text-[10px]">
                  <BookOpen className="w-3.5 h-3.5 text-stone-700" />
                  抗辩法律依据 / 法定抗辩权
                </h4>
                <p className="text-stone-700 leading-normal text-[11px]">{activeExcuse.legalBasis}</p>
              </div>

              {/* Operational Tips */}
              <div className="bg-[#FAF9F5] p-3 border border-black/10 rounded-sm text-xs">
                <h4 className="font-bold text-stone-900 flex items-center gap-1 text-[10px] mb-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                  实操避坑贴士 / 核心纠偏
                </h4>
                <p className="text-[#333] leading-relaxed text-[11px]">{activeExcuse.tips}</p>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* 12389 Complaint Help Line Guide */}
      <div className="bg-[#FAF9F5] border border-black rounded-sm p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <h3 className="text-base font-serif font-black text-stone-900 flex items-center gap-2">
              <PhoneCall className="w-5 h-5 text-red-700" />
              启动国家督办专线：12389 举报不作为行为
            </h3>
            <p className="text-xs text-stone-605 leading-relaxed max-w-3xl">
              12389 为<strong>公安部设置的警务督察、民警违法违纪不作为扫黑专网</strong>。拨打口号直指问题核心，以下三项应以书面化事实精准口述：
            </p>
            <div className="inline-flex flex-wrap gap-2 pt-1 font-mono text-[11px]">
              <span className="bg-white px-2.5 py-1.5 rounded-sm border border-stone-300 text-stone-800 font-bold">1. 发生地XXX市级分局XXX派出所</span>
              <span className="bg-white px-2.5 py-1.5 rounded-sm border border-stone-300 text-stone-800 font-bold">2. 接报案公安民警警号 XXX、姓名 XXX</span>
              <span className="bg-white px-2.5 py-1.5 rounded-sm border border-stone-300 text-stone-800 font-bold">3. 民警不履职、拒不开具正式受案回执</span>
            </div>
          </div>
          
          <div className="bg-black text-[#F5F5F0] border-2 border-black rounded-sm px-6 py-4 text-center shrink-0 w-full md:w-auto">
            <p className="text-[10px] font-bold tracking-widest uppercase opacity-70">警务督察热线</p>
            <p className="text-3xl font-serif font-black my-1">12389</p>
            <p className="text-[10px] tracking-wider opacity-60">或拨 12345 市政政务热线</p>
          </div>
        </div>
      </div>

    </div>
  );
}
