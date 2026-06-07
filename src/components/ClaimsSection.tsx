/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Calculator, 
  TrendingUp, 
  Gavel, 
  AlertTriangle, 
  CheckCircle, 
  UserX, 
  HelpCircle,
  FileSpreadsheet,
  Coins,
  ShieldCheck,
  Lightbulb
} from "lucide-react";
import { CompensationData } from "../types";

export default function ClaimsSection() {
  const [formData, setFormData] = useState<CompensationData>(() => {
    try {
      const saved = localStorage.getItem("claims_calculator_data");
      return saved ? JSON.parse(saved) : {
        medicalFee: 850,
        missedIncomeDayRate: 350,
        missedDays: 7,
        transportFee: 150,
        caregiverDayRate: 150,
        caregiverDays: 3,
        nutritionFee: 200,
        propertyLoss: 1200,
        mentalPainFee: 5000
      };
    } catch {
      return {
        medicalFee: 850,
        missedIncomeDayRate: 350,
        missedDays: 7,
        transportFee: 150,
        caregiverDayRate: 150,
        caregiverDays: 3,
        nutritionFee: 200,
        propertyLoss: 1200,
        mentalPainFee: 5000
      };
    }
  });

  const [activePath, setActivePath] = useState<"path_a" | "path_b">("path_a");

  useEffect(() => {
    localStorage.setItem("claims_calculator_data", JSON.stringify(formData));
  }, [formData]);

  const handleInputChange = (field: keyof CompensationData, value: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: isNaN(value) ? 0 : value
    }));
  };

  const handleReset = () => {
    setFormData({
      medicalFee: 0,
      missedIncomeDayRate: 0,
      missedDays: 0,
      transportFee: 0,
      caregiverDayRate: 0,
      caregiverDays: 0,
      nutritionFee: 0,
      propertyLoss: 0,
      mentalPainFee: 0
    });
  };

  // 基础计算
  const medicalTotal = formData.medicalFee;
  const missedIncomeTotal = formData.missedIncomeDayRate * formData.missedDays;
  const caregiverTotal = formData.caregiverDayRate * formData.caregiverDays;
  const transportTotal = formData.transportFee;
  const nutritionTotal = formData.nutritionFee;
  const propertyTotal = formData.propertyLoss;
  const mentalTotal = formData.mentalPainFee;

  const totalCompensation = medicalTotal + missedIncomeTotal + caregiverTotal + transportTotal + nutritionTotal + propertyTotal + mentalTotal;
  
  // 法理实战索赔建议溢价：治安调解具有拘留阻断杠杆，价格通常锚定在侵权真实损失的 3 到 8 倍
  const settlementMin = Math.round(Math.max(totalCompensation * 3, 5000));
  const settlementMax = Math.round(Math.max(totalCompensation * 8, 30000));

  const dataParts = [
    { name: "医药医疗费用", val: medicalTotal },
    { name: "实际误工损失", val: missedIncomeTotal },
    { name: "随身财产折损", val: propertyTotal },
    { name: "陪看陪护补偿", val: caregiverTotal },
    { name: "交通及营养费", val: transportTotal + nutritionTotal },
    { name: "精神损害抚慰", val: mentalTotal },
  ];

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm text-xs font-serif tracking-widest uppercase bg-[#EAECE6] text-[#333] border border-black/20">
          步骤 04: 法理依据索赔清单
        </span>
        <h2 id="claims-title" className="text-2xl sm:text-3xl font-serif font-black text-stone-900 mt-2 tracking-tight">
          法理索赔账单：如何依法索要你应得的全部损失？
        </h2>
        <p className="text-sm text-stone-600 mt-2 font-mono uppercase tracking-wider text-[11px] opacity-75">
          民事索赔非胡乱开价。出具一份证据确凿、法条详实、完全凭凭证支撑的《人身侵害赔偿主张清单》能让施暴方直接理亏。
        </p>
      </div>

      {/* 核心计算器网格 */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        
        {/* 左侧卡片：表单输入 */}
        <div className="xl:col-span-7 bg-white border border-black rounded-sm p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.08)] space-y-4">
          <div className="flex items-center justify-between border-b-2 border-black pb-3">
            <h3 className="text-sm font-bold uppercase text-stone-900 flex items-center gap-2 font-serif">
              <Calculator className="w-5 h-5 text-stone-900" />
              民事侵害损失核算计算器
            </h3>
            <button
              id="btn-reset-calculator"
              onClick={handleReset}
              className="text-xs font-serif font-bold text-red-700 hover:underline cursor-pointer"
            >
              [ 清空数据 ]
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* 输入项目 1 */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-stone-700">1. 医疗诊断自付费（元）</label>
              <input
                id="input-medical-fee"
                type="number"
                value={formData.medicalFee || ""}
                onChange={(e) => handleInputChange("medicalFee", parseFloat(e.target.value))}
                placeholder="发票、收据合计数"
                className="w-full px-3 py-2 text-sm bg-[#FAF9F5] border border-black/30 rounded-sm focus:outline-none focus:border-black font-mono text-stone-900 font-bold"
              />
              <p className="text-[10px] text-stone-550">须凭实体门诊发票、医用收据原件核算</p>
            </div>

            {/* 输入项目 2 */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-stone-700">2. 随身公私财产损（元）</label>
              <input
                id="input-property-loss"
                type="number"
                value={formData.propertyLoss || ""}
                onChange={(e) => handleInputChange("propertyLoss", parseFloat(e.target.value))}
                placeholder="眼镜/手机/衣物折旧估损"
                className="w-full px-3 py-2 text-sm bg-[#FAF9F5] border border-black/30 rounded-sm focus:outline-none focus:border-black font-mono text-stone-900 font-bold"
              />
              <p className="text-[10px] text-stone-550">实务中眼镜等常主张原价或新购同款清退</p>
            </div>

            {/* 输入项目 3 */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-[#1A1A1A]">3. 本人工作日均薪酬（元/天）</label>
              <input
                id="input-missed-income-rate"
                type="number"
                value={formData.missedIncomeDayRate || ""}
                onChange={(e) => handleInputChange("missedIncomeDayRate", parseFloat(e.target.value))}
                placeholder="月税后薪资除以 21.75"
                className="w-full px-3 py-2 text-sm bg-[#FAF9F5] border border-black/30 rounded-sm focus:outline-none focus:border-black font-mono text-stone-900 font-bold"
              />
              <p className="text-[10px] text-stone-550">需开具公司误工证明及银行近三个月工资流水</p>
            </div>

            {/* 输入项目 4 */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-[#1A1A1A]">4. 医生开具建议休假（天数）</label>
              <input
                id="input-missed-days"
                type="number"
                value={formData.missedDays || ""}
                onChange={(e) => handleInputChange("missedDays", parseFloat(e.target.value))}
                placeholder="诊断证明全休假天数"
                className="w-full px-3 py-2 text-sm bg-[#FAF9F5] border border-black/30 rounded-sm focus:outline-none focus:border-black font-mono text-stone-900 font-bold"
              />
              <p className="text-[10px] text-stone-550">病历卡须开具明确“建议全休X天描述”</p>
            </div>

            {/* 输入项目 5 */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-stone-700">5. 护理/看陪人员日均薪酬（元/天）</label>
              <input
                id="input-caregiver-rate"
                type="number"
                value={formData.caregiverDayRate || ""}
                onChange={(e) => handleInputChange("caregiverDayRate", parseFloat(e.target.value))}
                placeholder="看护工日薪或家属误工"
                className="w-full px-3 py-2 text-sm bg-[#FAF9F5] border border-black/30 rounded-sm focus:outline-none focus:border-black font-mono text-stone-900 font-bold"
              />
              <p className="text-[10px] text-stone-550">家属看陪的，提供其工资误工或以本地护工水准计</p>
            </div>

            {/* 输入项目 6 */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-stone-700">6. 医院确认需陪护时间（天数）</label>
              <input
                id="input-caregiver-days"
                type="number"
                value={formData.caregiverDays || ""}
                onChange={(e) => handleInputChange("caregiverDays", parseFloat(e.target.value))}
                placeholder="住院卧床或生活受限阶段"
                className="w-full px-3 py-2 text-sm bg-[#FAF9F5] border border-black/30 rounded-sm focus:outline-none focus:border-black font-mono text-stone-900 font-bold"
              />
              <p className="text-[10px] text-stone-550">须有医嘱证明：‘住院/治疗期间需一人看护’</p>
            </div>

            {/* 输入项目 7 */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-stone-700">7. 复查复诊差旅交通费（元）</label>
              <input
                id="input-transport-fee"
                type="number"
                value={formData.transportFee || ""}
                onChange={(e) => handleInputChange("transportFee", parseFloat(e.target.value))}
                placeholder="打车、公共交通行程发票"
                className="w-full px-3 py-2 text-sm bg-[#FAF9F5] border border-black/30 rounded-sm focus:outline-none focus:border-black font-mono text-stone-900 font-bold"
              />
              <p className="text-[10px] text-stone-550">只认定与医院诊断/复查之日同频发生的交通路线</p>
            </div>

            {/* 输入项目 8 */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-stone-700">8. 营养补给与餐食补贴（元）</label>
              <input
                id="input-nutrition-fee"
                type="number"
                value={formData.nutritionFee || ""}
                onChange={(e) => handleInputChange("nutritionFee", parseFloat(e.target.value))}
                placeholder="自选主张额：30-100元"
                className="w-full px-3 py-2 text-sm bg-[#FAF9F5] border border-black/30 rounded-sm focus:outline-none focus:border-black font-mono text-stone-900 font-bold"
              />
              <p className="text-[10px] text-stone-550">法医如鉴定涉及骨折或重大软组织创伤可高配</p>
            </div>

          </div>

          {/* 输入项目 9 */}
          <div className="space-y-1 pt-3 border-t border-black/10">
            <div className="flex justify-between items-center">
              <label className="block text-[11px] font-bold text-stone-900">9. 主张人身精神损害抚慰金（元）</label>
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#B22222] bg-red-50 border border-red-200 px-2 py-0.5 rounded-sm">
                专属博弈溢价
              </span>
            </div>
            <input
              id="input-mental-pain-fee"
              type="number"
              value={formData.mentalPainFee || ""}
              onChange={(e) => handleInputChange("mentalPainFee", parseFloat(e.target.value))}
              placeholder="加害施暴极其折损人身尊严，主张此项用于谈判博弈"
              className="w-full px-3 py-2 text-sm bg-[#FAF9F5] border border-black/30 rounded-sm focus:outline-none focus:border-black font-mono text-stone-900 font-bold"
            />
            <p className="text-[10px] text-stone-550">
              司法诉讼中判定此项往往标准严苛，但在<strong>派出所治安和解中，此项作为主观谈判筹码，可足额列入起步价。</strong>
            </p>
          </div>

        </div>

        {/* 右侧卡片：计算结果实时面板 */}
        <div className="xl:col-span-5 flex flex-col justify-between" id="claims-results-dashboard">
          <div className="bg-[#FAF9F5] text-[#1A1A1A] rounded-sm p-5 border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.15)] space-y-4 h-full flex flex-col justify-between">
            
            {/* 损失累计总额 */}
            <div className="space-y-1">
              <span className="text-[10px] text-stone-600 uppercase tracking-widest font-bold">完全合乎凭票主张的物质损失清单小计</span>
              <div className="flex items-baseline justify-between border-b-2 border-black pb-2">
                <span className="text-3xl font-serif font-black text-stone-500">¥ {totalCompensation.toLocaleString()}</span>
                <span className="text-[10px] text-red-950 font-bold tracking-widest uppercase bg-red-100 border border-red-300 px-2 py-0.5 rounded-sm">
                  真金损失底限
                </span>
              </div>
            </div>

            {/* 柱状分部占比 */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-bold text-stone-900 uppercase tracking-widest border-b border-black/10 pb-1">各项损失科目比重与合理性核算</h4>
              
              <div className="space-y-3.5 text-xs">
                {dataParts.map((item, idx) => {
                  const percent = totalCompensation > 0 ? (item.val / totalCompensation) * 100 : 0;
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-stone-700 font-bold flex items-center gap-1.5 font-serif italic">
                          <span className="w-1.5 h-1.5 bg-black" />
                          {item.name}
                        </span>
                        <span className="text-stone-950 font-bold">
                          ¥ {item.val.toLocaleString()}{" "}
                          <span className="text-[10px] text-stone-500 font-normal">({percent.toFixed(1)}%)</span>
                        </span>
                      </div>
                      <div className="w-full bg-stone-200 rounded-sm h-1.5 overflow-hidden border border-black/10">
                        <div 
                          className="bg-black h-1.5 transition-all duration-300"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 派出所和解区间 */}
            <div className="bg-white border text-stone-900 border-black p-4 mt-2 rounded-sm shadow-sm space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#E63946] flex items-center gap-1.5 font-serif">
                <TrendingUp className="w-4 h-4 text-red-700" />
                治安调解建议起步和解索赔开价
              </h4>
              <p className="text-[10px] text-stone-600 leading-relaxed">
                施暴者为阻断行政拘留处罚（进而保住工作、规避留档影响子女考公政审），治安大队内博弈杠杆极大。因此，和解价应锚定在<strong>真实侵权额的 3 至 8 倍：</strong>
              </p>
              <div className="flex items-center justify-between bg-[#FAF9F5] px-3.5 py-3 border border-stone-800 text-center">
                <span className="text-xs font-bold text-stone-700">和解威慑合理定价：</span>
                <span className="text-lg sm:text-xl font-serif font-black text-red-800">
                  ¥ {settlementMin.toLocaleString()} ~ ¥ {settlementMax.toLocaleString()}
                </span>
              </div>
              <p className="text-[9px] text-red-850 leading-normal font-serif italic border-t border-black/5 pt-1.5">
                * 心理学底层逻辑：该两极区间基于软组织受损或耳膜穿孔等治安案例的极值博弈概率得出。不赔妥绝不在调解书盖章签字，其社会工作和政审链条将全线遭遇大范围破坏。
              </p>
            </div>

          </div>
        </div>

      </div>

      {/* 两大刚性维权路径选择 */}
      <div className="border border-black rounded-sm overflow-hidden bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
        
        {/* 指标切换按钮 */}
        <div className="flex border-b border-black">
          <button
            id="btn-path-a"
            onClick={() => setActivePath("path_a")}
            className={`flex-1 py-4 text-center text-xs font-serif tracking-wider font-bold flex items-center justify-center gap-2 border-r border-black transition duration-200 cursor-pointer ${
              activePath === "path_a" 
                ? "bg-black text-white" 
                : "bg-white text-stone-600 hover:bg-[#FAF9F5]"
            }`}
          >
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>路径 A：治安行政拘留反制（调解未果，重拳行政送拘）</span>
          </button>
          
          <button
            id="btn-path-b"
            onClick={() => setActivePath("path_b")}
            className={`flex-1 py-4 text-center text-xs font-serif tracking-wider font-bold flex items-center justify-center gap-2 transition duration-200 cursor-pointer ${
              activePath === "path_b" 
                ? "bg-black text-white" 
                : "bg-white text-stone-600 hover:bg-[#FAF9F5]"
            }`}
          >
            <Gavel className="w-4 h-4 shrink-0" />
            <span>路径 B：民事确权强制执行（对方耍赖，清算名下资产）</span>
          </button>
        </div>

        {/* 路径详情展示面板 */}
        <div className="p-6">
          {activePath === "path_a" ? (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-sm bg-red-100 text-red-800 font-bold text-[10px] tracking-wider border border-red-300">行政威慑</span>
                <h3 className="text-base font-serif font-black text-stone-900">“不同意清单数额？申请立刻终止调解，移送送拘！”</h3>
              </div>
              
              <p className="text-sm font-serif text-stone-700 leading-relaxed">
                轻微伤及违法施暴一旦坐实，将面临我国《治安管理处罚法》第四十三条的行政拘留高压规约。受害者拒绝在调解书上达成合意并签字，公安机关将依法立即下达《行政处罚决定书》，对施暴者送进拘留所执行行拘。
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-1 text-xs">
                
                <div className="bg-[#FAF9F5] border border-black/10 rounded-sm p-4 space-y-1">
                  <h4 className="font-bold text-stone-950 font-serif border-b border-black/10 pb-1 mb-1">1. 行拘案底终身保留（株连效应）</h4>
                  <p className="text-stone-700 leading-normal text-[11px]">
                    治安行政拘留并非普通拘禁。该处罚决定会终身载入公安警务骨干网主库中。在现实政审中，将直接掐断其子女或近亲属报考核心涉密体制岗位、入党及参军入伍考核。
                  </p>
                </div>

                <div className="bg-[#FAF9F5] border border-black/10 rounded-sm p-4 space-y-1">
                  <h4 className="font-bold text-stone-950 font-serif border-b border-black/10 pb-1 mb-1">2. 协议签字前必须完成物理转账结清</h4>
                  <p className="text-stone-700 leading-normal text-[11px]">
                    拒绝轻信施暴方的“口头答应、立字据打欠条、分期退赔”等空话。凡在派出所签署和解撤回文书，其资金款项必须在民警在场时当场通过网银、微信实付款清。
                  </p>
                </div>

                <div className="bg-[#FAF9F5] border border-black/10 rounded-sm p-4 space-y-1">
                  <h4 className="font-bold text-stone-950 font-serif border-b border-black/10 pb-1 mb-1">3. “以拘促谈”：立下强硬止损防线</h4>
                  <p className="text-stone-700 leading-normal text-[11px]">
                    当终止调解申请送出后，施暴者所任职的公司或家中长辈、伴侣在得知被行拘释放后饭碗不保时，往往会在48小时内急迫筹集溢价赔偿金，求你给出一份行政谅解声明。
                  </p>
                </div>

              </div>

              <div className="bg-[#FAF1F1] border-l-4 border-red-650 p-4 rounded-sm flex gap-3 text-xs border border-red-200">
                <AlertTriangle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
                <div className="text-red-950">
                  <p className="font-bold uppercase tracking-wider text-[11.5px]">实战抗辩谈判心理技巧：</p>
                  <p className="mt-1 text-[11px] leading-relaxed">
                    在派出所遭遇无赖嘲讽“我宁可进去躺几天一毛不赔”时，不要丧气争吵。平静转告承办民警：“既然违法者完全无对等调解和正视事实的诚意，我方即刻依法申请终止治安调解，请公安部门立即下达《行政处罚决定书》对其强制拘留。我将随后开启路径B在法院网格中冻结清算对方的所有名下资产！”
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-sm bg-black text-white font-bold text-[10px] tracking-wider">民事确权</span>
                <h3 className="text-base font-serif font-black text-stone-900">“关完出来继续清算：民事诉讼判决，终身套紧老赖资产”</h3>
              </div>
              
              <p className="text-sm font-serif text-stone-700 leading-relaxed">
                施暴者往往天真地以为“拘留期满后侵权民事债务就一笔勾销”，极其荒谬。行政处罚是其触犯《治安管理处罚法》向国家接受的秩序规束惩罚；而非法伤害你身体和财产造成的医疗及衣服损物属于《民法典》规范，责令赔偿一文不能少。
              </p>

              <div className="bg-[#FAF9F5] border border-black rounded-sm p-5 text-xs text-stone-700 space-y-4 select-all">
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-sm bg-stone-900 text-white font-mono font-bold flex items-center justify-center shrink-0">1</div>
                  <div className="space-y-0.5">
                    <strong className="text-stone-900 block font-serif">第一步：行拘执行完毕后，前往派出所调取全套笔录与违法处罚单原件复印本</strong>
                    <p className="text-stone-550 leading-relaxed">
                      该《行政处罚决定书》是国家机关盖印的公权力行政处罚文书。在我国司法审判实践中，该案涉事实属于“绝对免证证明事实”！这意味着开庭审理时对方再怎么捏造歪嘴，法官也会直接全信案涉记录。
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-sm bg-stone-900 text-white font-mono font-bold flex items-center justify-center shrink-0">2</div>
                  <div className="space-y-0.5">
                    <strong className="text-stone-900 block font-serif">第二步：向对方户籍所在地或案发发生地的基层法院提起“人身侵权、健康权之诉”</strong>
                    <p className="text-stone-550 leading-relaxed">
                      普通身体侵权属浅显简易案件，诉讼表格去法院前台或通过网上诉服小程序即可一键填妥，不需要耗资上万请律师。打赢此司胜诉费仅约50元，在审结后由败诉施暴者全额负担。
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-sm bg-stone-900 text-white font-mono font-bold flex items-center justify-center shrink-0">3</div>
                  <div className="space-y-0.5">
                    <strong className="text-stone-900 block font-serif">第三步：调取资产、申请强制执行，套上下半生失信人天网</strong>
                    <p className="text-stone-550 leading-relaxed">
                      判决出具后对方耍赖不赔，立刻移交法院执行局立项。强制执行启动后，施暴者将被套上失信限高枷锁：1) 限制高消费，终身坐不了高铁一等座、飞机，子女上不了贵族私立私校。2) 自动执行系统密织：扣划封锁其微信、支付宝钱包、储蓄卡，阻断正常电子买单金融流通。3) 法院有权对对方持有的房产、机动车折现拍卖偿还！不赔钱其生活就将在物理层面彻底卡死。
                    </p>
                  </div>
                </div>

              </div>

              <div className="bg-[#FAF1F1] border-l-4 border-red-650 p-4 rounded-sm flex gap-3 text-xs border border-red-200">
                <UserX className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
                <div className="text-red-950">
                  <p className="font-bold uppercase tracking-wider text-[11.5px]">施暴者自傲耍赖的终极无解套牢：</p>
                  <p className="mt-1 text-[11px] leading-relaxed">
                    他以为坐完几天牢就“赚了不用赔”，事实上他的民事侵权赔偿债务终身存在，不以被执行过行政强制拘留而消亡。每当临近年关或银行信用盘点、微信买单高发期，其账户随时可能因法院调令直接封止断流。这就是轻率对守法公民施暴所要承担的，长达数十年的社会性失信酷刑。
                  </p>
                </div>
              </div>

            </div>
          )}
        </div>

      </div>

    </div>
  );
}
