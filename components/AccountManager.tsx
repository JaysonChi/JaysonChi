
import React from 'react';
import { Account } from '../types';

interface Props {
  accounts: Account[];
  onUpdate: (id: string, amount: number) => void;
}

export const AccountManager: React.FC<Props> = ({ accounts, onUpdate }) => {
  const netWorth = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  return (
    <div className="space-y-6">
      <div className="bg-indigo-600 p-8 rounded-[2.5rem] shadow-2xl shadow-indigo-200 text-white relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-indigo-100 font-bold text-sm tracking-widest uppercase mb-1">總淨資產 (Net Worth)</p>
          <h2 className="text-4xl font-black mb-6 tracking-tight">${netWorth.toLocaleString()}</h2>
          <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
            {accounts.map(acc => (
              <div key={acc.id} className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl flex-shrink-0 min-w-[120px] border border-white/20">
                <p className="text-[10px] text-white/60 font-black uppercase mb-1">{acc.name}</p>
                <p className="font-bold text-sm">${acc.balance.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
        {/* 背景裝飾 */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {accounts.map(acc => (
          <div key={acc.id} className="bg-white p-4 rounded-3xl border-2 border-slate-100 shadow-sm flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${acc.type === 'credit' ? 'bg-rose-50 text-rose-500' : 'bg-indigo-50 text-indigo-500'}`}>
              {acc.type === 'cash' ? '💵' : acc.type === 'bank' ? '🏦' : acc.type === 'credit' ? '💳' : '📈'}
            </div>
            <div>
              <p className="text-xs font-black text-slate-400">{acc.name}</p>
              <p className="font-bold text-slate-800 text-sm">${acc.balance.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
