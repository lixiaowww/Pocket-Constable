/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { HOSPITAL_ITEMS } from "../data";
import { 
  FileCheck, 
  Stethoscope, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  HelpCircle,
  Clock,
  Briefcase
} from "lucide-react";

export default function HospitalSection() {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [artifactChecks, setArtifactChecks] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem("hospital_briefcase_checks");
      return saved ? JSON.parse(saved) : {
        register_slip: false,
        medical_record_book: false,
        diagnosis_desc: false,
        invoice_original: false,
        ct_film: false,
        forensic_letter: false
      };
    } catch {
      return {
        register_slip: false,
        medical_record_book: false,
        diagnosis_desc: false,
        invoice_original: false,
        ct_film: false,
        forensic_letter: false
      };
    }
  });

  const [expandedItemId, setExpandedItemId] = useState<string>("hosp_ear");

  useEffect(() => {
    localStorage.setItem("hospital_briefcase_checks", JSON.stringify(artifactChecks));
  }, [artifactChecks]);

  const toggleArtifact = (id: string) => {
    setArtifactChecks(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleResetArtifacts = () => {
    setArtifactChecks({
      register_slip: false,
      medical_record_book: false,
      diagnosis_desc: false,
      invoice_original: false,
      ct_film: false,
      forensic_letter: false
    });
  };

  const totalCollected = Object.values(artifactChecks).filter(Boolean).length;
  const progressPercent = Math.round((totalCollected / 6) * 100);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
          阶段 3: 去医院验伤与法医鉴定
        </span>
        <h2 id="hospital-title" className="text-2xl font-bold text-slate-950 mt-2 font-display tracking-tight">
          去医院验伤与鉴定：如何保留无可挑剔的医学铁证？
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          伤情判定是决定对方是“行政拘留”还是“赔偿几万/十万元”最高效的和谈底牌。切勿因一时疏忽遗落隐匿伤情。
        </p>
      </div>

      {/* Critical Medical Wording Warning Box */}
      <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-5 shadow-sm">
        <div className="flex gap-4">
          <div className="p-2.5 bg-emerald-100 text-emerald-850 rounded-xl shrink-0 h-fit mt-0.5">
            <Stethoscope className="w-5 h-5 text-emerald-700" />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-emerald-900">
              重中之重：监督医生在《急诊病历》上的手写措辞！
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              很多急诊医生工作忙碌，往往习惯写：<strong>“自述被打伤一小时”</strong>、或简单写<strong>“头部外伤”</strong>。在法律、商业险及司法责任查明实践中，“自述”无法完全等同于医学因果判定。
            </p>
            <div className="bg-white p-3 rounded-xl border border-emerald-100 flex flex-col md:flex-row gap-3 md:gap-6 justify-between text-xs">
              <div className="space-y-1">
                <span className="inline-block px-2 py-0.5 rounded-full bg-red-50 text-rose-700 font-bold text-[10px]">❌ 错误、危险写法</span>
                <p className="font-mono text-slate-500 italic">“患者自述被打，伴头痛。” (保险公司可能免赔、对方律师会挑刺归咎为你之前旧伤)</p>
              </div>
              <div className="space-y-1 border-t md:border-t-0 md:border-l border-slate-100 pt-2 md:pt-0 md:pl-4">
                <span className="inline-block px-2 py-0.5 rounded-full bg-green-50 text-green-700 font-bold text-[10px]">✅ 标准、防御型写法</span>
                <p className="font-mono text-slate-900 font-semibold">“头部因遭外力打击致皮下组织水肿/皮外淤血，伴眩晕震荡反应，留科观察建议静养休假。”</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hospital Focus items Selector & briefcase check */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Widget: Body part examiner */}
        <div className="lg:col-span-7 space-y-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">人体关键损伤审查指南 (身体重点防线)</p>
          
          <div className="space-y-2">
            {HOSPITAL_ITEMS.map((item) => {
              const isExpanded = item.id === expandedItemId;
              return (
                <div 
                  key={item.id} 
                  className={`border rounded-xl overflow-hidden transition-all duration-300 ${
                    isExpanded 
                      ? "bg-white border-emerald-500 shadow-md" 
                      : "bg-slate-50 border-slate-200 hover:bg-slate-100/50"
                  }`}
                >
                  <button
                    id={`btn-hospital-item-${item.id}`}
                    onClick={() => setExpandedItemId(item.id)}
                    className="w-full text-left p-4 flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-lg text-xs font-semibold ${isExpanded ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-700"}`}>
                        {item.part[0]}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{item.part}</h4>
                        <p className="text-xs text-slate-500 font-mono mt-0.5 line-clamp-1">{item.concern}</p>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400 font-medium">
                      {isExpanded ? "收起明细 -" : "点击查看明细 +"}
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 border-t border-slate-100 space-y-3.5 animate-fadeIn">
                      <div className="text-xs space-y-1">
                        <strong className="text-slate-800 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          可能存在的伤情核查：
                        </strong>
                        <p className="text-slate-600 pl-4.5 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-normal">{item.concern}</p>
                      </div>

                      <div className="text-xs space-y-1">
                        <strong className="text-rose-700 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          不重视的法律代价 (极重要)：
                        </strong>
                        <p className="text-slate-600 pl-4.5 bg-rose-50/20 p-2.5 rounded-lg border border-rose-100 leading-normal">{item.impactOfNeglect}</p>
                      </div>

                      <div className="text-xs space-y-1">
                        <strong className="text-indigo-950 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                          需敦促医生做到的医学检测项目及病历手写：
                        </strong>
                        <p className="text-slate-700 font-medium pl-4.5 bg-indigo-50/20 p-2.5 rounded-lg border border-indigo-100 leading-normal">{item.examinationRequired}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Widget: Digital Legal Briefcase checkbox */}
        <div className="lg:col-span-5" id="briefcase-widget">
          <div className="bg-slate-950 text-slate-100 rounded-2xl p-5 border border-slate-800 shadow-md flex flex-col justify-between h-full space-y-4">
            
            <div>
              {/* Header Box */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4" />
                  <span>随身法务大底包 / 证明材料核查</span>
                </span>
                <button
                  id="btn-reset-briefcase"
                  onClick={handleResetArtifacts}
                  className="text-[10px] text-slate-500 hover:text-rose-400 transition"
                >
                  重置收集
                </button>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
                点击标记你在医院现场正收集妥当的证明原件，以防在日后定损核查中缺失关键纸质发票、复核件。
              </p>

              {/* Progress Bar */}
              <div className="space-y-1.5 mb-5 bg-gradient-to-r from-emerald-900/10 to-teal-900/10 p-3 rounded-xl border border-emerald-500/10">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-400 font-mono">收集归档进度</span>
                  <span className="text-emerald-400 font-bold font-mono">{progressPercent}% ({totalCollected}/6 已拿全)</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500 ease-out" 
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* List of checks */}
              <div className="space-y-3">
                
                {/* 1 */}
                <button
                  id="btn-checkbox-register-slip"
                  onClick={() => toggleArtifact("register_slip")}
                  className={`w-full text-left p-2.5 rounded-xl border transition flex items-center justify-between cursor-pointer ${
                    artifactChecks.register_slip 
                      ? "bg-emerald-950/40 border-emerald-500/80 text-emerald-200" 
                      : "bg-slate-900/40 hover:bg-slate-900 border-slate-800 text-slate-400"
                  }`}
                >
                  <div className="flex items-center gap-2.5 text-xs">
                    <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${artifactChecks.register_slip ? "bg-emerald-500 border-emerald-500 text-slate-950" : "border-slate-700"}`}>
                      {artifactChecks.register_slip && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <span>原件或复印件 1：挂号复查单</span>
                  </div>
                  <span className="text-[9px] text-slate-500">门急诊号/日期对齐</span>
                </button>

                {/* 2 */}
                <button
                  id="btn-checkbox-medical-record-book"
                  onClick={() => toggleArtifact("medical_record_book")}
                  className={`w-full text-left p-2.5 rounded-xl border transition flex items-center justify-between cursor-pointer ${
                    artifactChecks.medical_record_book 
                      ? "bg-emerald-950/40 border-emerald-500/80 text-emerald-200" 
                      : "bg-slate-900/40 hover:bg-slate-900 border-slate-800 text-slate-400"
                  }`}
                >
                  <div className="flex items-center gap-2.5 text-xs">
                    <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${artifactChecks.medical_record_book ? "bg-emerald-500 border-emerald-500 text-slate-950" : "border-slate-700"}`}>
                      {artifactChecks.medical_record_book && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <span>原件或复印件 2：急诊病历本</span>
                  </div>
                  <span className="text-[9px] text-rose-400 font-semibold font-mono">核对无‘自述’</span>
                </button>

                {/* 3 */}
                <button
                  id="btn-checkbox-diagnosis-desc"
                  onClick={() => toggleArtifact("diagnosis_desc")}
                  className={`w-full text-left p-2.5 rounded-xl border transition flex items-center justify-between cursor-pointer ${
                    artifactChecks.diagnosis_desc 
                      ? "bg-emerald-950/40 border-emerald-500/80 text-emerald-200" 
                      : "bg-slate-900/40 hover:bg-slate-900 border-slate-800 text-slate-400"
                  }`}
                >
                  <div className="flex items-center gap-2.5 text-xs">
                    <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${artifactChecks.diagnosis_desc ? "bg-emerald-500 border-emerald-500 text-slate-950" : "border-slate-700"}`}>
                      {artifactChecks.diagnosis_desc && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <span>原件或复印件 3：医生诊断证明书</span>
                  </div>
                  <span className="text-[9px] text-slate-500">须盖医院公章</span>
                </button>

                {/* 4 */}
                <button
                  id="btn-checkbox-invoice-original"
                  onClick={() => toggleArtifact("invoice_original")}
                  className={`w-full text-left p-2.5 rounded-xl border transition flex items-center justify-between cursor-pointer ${
                    artifactChecks.invoice_original 
                      ? "bg-emerald-950/40 border-emerald-500/80 text-emerald-200" 
                      : "bg-slate-900/40 hover:bg-slate-900 border-slate-800 text-slate-400"
                  }`}
                >
                  <div className="flex items-center gap-2.5 text-xs">
                    <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${artifactChecks.invoice_original ? "bg-emerald-500 border-emerald-500 text-slate-950" : "border-slate-700"}`}>
                      {artifactChecks.invoice_original && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <span>原件或复印件 4：医疗费发票原件</span>
                  </div>
                  <span className="text-[9px] text-slate-550">或加盖财务章电子票</span>
                </button>

                {/* 5 */}
                <button
                  id="btn-checkbox-ct-film"
                  onClick={() => toggleArtifact("ct_film")}
                  className={`w-full text-left p-2.5 rounded-xl border transition flex items-center justify-between cursor-pointer ${
                    artifactChecks.ct_film 
                      ? "bg-emerald-950/40 border-emerald-500/80 text-emerald-200" 
                      : "bg-slate-900/40 hover:bg-slate-900 border-slate-800 text-slate-400"
                  }`}
                >
                  <div className="flex items-center gap-2.5 text-xs">
                    <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${artifactChecks.ct_film ? "bg-emerald-500 border-emerald-500 text-slate-950" : "border-slate-700"}`}>
                      {artifactChecks.ct_film && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <span>原件或复印件 5：各类检查影像胶片/光盘</span>
                  </div>
                  <span className="text-[9px] text-slate-500">CT、核磁、彩超报告</span>
                </button>

                {/* 6 */}
                <button
                  id="btn-checkbox-forensic-letter"
                  onClick={() => toggleArtifact("forensic_letter")}
                  className={`w-full text-left p-2.5 rounded-xl border transition flex items-center justify-between cursor-pointer ${
                    artifactChecks.forensic_letter 
                      ? "bg-emerald-950/40 border-emerald-500/80 text-emerald-200" 
                      : "bg-slate-900/40 hover:bg-slate-900 border-slate-800 text-slate-400"
                  }`}
                >
                  <div className="flex items-center gap-2.5 text-xs">
                    <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${artifactChecks.forensic_letter ? "bg-emerald-500 border-emerald-500 text-slate-950" : "border-slate-700"}`}>
                      {artifactChecks.forensic_letter && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <span>原件或复印件 6：派出所验伤鉴定书</span>
                  </div>
                  <span className="text-[9px] text-amber-400 font-bold">由法医鉴定出具</span>
                </button>

              </div>
            </div>

            <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-[10px] text-slate-400 leading-normal mt-4">
              💡 <strong>保存提示</strong>：您的复复选状态已通过 `localStorage` 自动锁死存在当前浏览器。即使关闭浏览器、刷新页面或点击菜单，数据依然完整保留。
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
