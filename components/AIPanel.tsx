
import React, { useState } from 'react';
import { Transaction, AISimulationResult } from '../types';
import { getFinancialHealthAnalysis, runFinancialSimulation } from '../services/geminiService';

interface Props {
  transactions: Transaction[];
  netWorth: number;
}

export const AIPanel: React.FC<Props> = ({ transactions, netWorth }) => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState('');
  const [scenario, setScenario] = useState('');
  const [simResult, setSimResult] = useState<AISimulationResult | null>(null);

  const handleAnalysis = async () => {
    setLoading(true);
    const result = await getFinancialHealthAnalysis(transactions, netWorth);
    setAnalysis(result);
    setLoading(false);
  };

  const handleSimulate = async () => {
    if (!scenario) return;
    setLoading(true);
    try {
      const result = await runFinancialSimulation(scenario, { netWorth, monthlyExpense: 25000 });
      setSimResult(result);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-black text-slate-800">🕵️ 財務健康報告</h3>
          <button 
            onClick={handleAnalysis} 
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg disabled:opacity-50"
          >
            {loading ? '分析中...' : '即刻診斷'}
          </button>
        </div>
        {analysis && (
          <div className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap bg-slate-50 p-4 rounded-2xl border border-slate-100">
            {analysis}
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm">
        <h3 className="text-xl font-black text-slate-800 mb-4">🔮 「如果...會怎樣？」</h3>
        <div className="flex gap-2 mb-4">
          <input 
            type="text" 
            placeholder="例如：如果我現在買一台 $50,000 的筆電..."
            className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 outline-none focus:border-indigo-500 text-sm font-medium"
            value={scenario}
            onChange={(e) => setScenario(e.target.value)}
          />
          <button 
            onClick={handleSimulate}
            disabled={loading}
            className="p-3 bg-indigo-100 text-indigo-600 rounded-2xl hover:bg-indigo-200 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          </button>
        </div>

        {simResult && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-400">決策安全得分</span>
              <span className={`text-2xl font-black ${simResult.safetyScore > 70 ? 'text-emerald-500' : 'text-rose-500'}`}>{simResult.safetyScore} / 100</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className={`h-full transition-all duration-1000 ${simResult.safetyScore > 70 ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{ width: `${simResult.safetyScore}%` }}></div>
            </div>
            <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 text-sm italic text-indigo-900">
              <p className="font-bold mb-1">專家建議：</p>
              {simResult.recommendation}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
