
import React, { useState } from 'react';
import { CATEGORIES, THEME_CONFIGS } from '../constants';
import { Transaction, TransactionType, AppTheme, Account } from '../types';

interface Props {
  onSave: (transaction: Omit<Transaction, 'id'> | Transaction) => void;
  onClose: () => void;
  initialData?: Transaction | null;
  theme: AppTheme;
  accounts: Account[];
}

export const TransactionForm: React.FC<Props> = ({ onSave, onClose, initialData, theme, accounts }) => {
  const [type, setType] = useState<TransactionType>(initialData?.type || 'expense');
  const [amount, setAmount] = useState(initialData?.amount.toString() || '');
  const [category, setCategory] = useState(initialData?.category || CATEGORIES[0]);
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState(initialData?.description || '');
  const [accountId, setAccountId] = useState(initialData?.accountId || accounts[0].id);

  const config = THEME_CONFIGS[theme];
  const hourlyWage = 200; // 假設時薪 200

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) return;
    const baseData = { type, amount: Number(amount), category, date, description, accountId };
    if (initialData) onSave({ ...baseData, id: initialData.id } as Transaction);
    else onSave(baseData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-200">
      <div className={`bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 border-4 ${config.border}`}>
        <div className="p-8 border-b border-slate-50 flex justify-between items-center">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">
            {initialData ? '✍️ 編輯明細' : '➕ 新增記帳'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          <div className="flex bg-slate-100 p-1 rounded-2xl">
            <button type="button" onClick={() => setType('expense')} className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${type === 'expense' ? 'bg-white text-rose-600 shadow-md' : 'text-slate-500'}`}>支出</button>
            <button type="button" onClick={() => setType('income')} className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${type === 'income' ? 'bg-white text-emerald-600 shadow-md' : 'text-slate-500'}`}>收入</button>
          </div>

          <div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400">$</span>
              <input
                type="number" required autoFocus
                value={amount} onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-10 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:border-indigo-500 outline-none transition-all font-black text-3xl"
                placeholder="0"
              />
            </div>
            {amount && type === 'expense' && (
              <p className="mt-2 text-xs text-slate-400 font-bold px-2">
                ⏳ 此消費等同於勞動：<span className="text-rose-500">{(Number(amount) / hourlyWage).toFixed(1)} 小時</span>
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <select value={accountId} onChange={(e) => setAccountId(e.target.value)} className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold text-sm">
              {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
            </select>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold text-sm">
              {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold text-sm" />

          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none h-24 font-bold resize-none" placeholder="想說點什麼..." />

          <button type="submit" className={`w-full py-5 ${config.primary} text-white font-black rounded-3xl transition-all shadow-xl active:scale-95 text-lg uppercase tracking-widest`}>
            {initialData ? '更新數據' : '確認入帳'}
          </button>
        </form>
      </div>
    </div>
  );
};
