
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Transaction, Account, SummaryStats, AppTheme } from './types';
import { INITIAL_ACCOUNTS, THEME_CONFIGS } from './constants';
import { Dashboard } from './components/Dashboard';
import { TransactionForm } from './components/TransactionForm';
import { AIPanel } from './components/AIPanel';
import { ImportModal } from './components/ImportModal';
import { AccountManager } from './components/AccountManager';
import { parseNaturalLanguageTransaction } from './services/geminiService';

const App: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>(INITIAL_ACCOUNTS);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isQuickInputOpen, setIsQuickInputOpen] = useState(false);
  const [quickInputText, setQuickInputText] = useState('');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'ai' | 'trans' | 'wealth'>('home');
  const [theme, setTheme] = useState<AppTheme>('classic');
  const [isProcessingAI, setIsProcessingAI] = useState(false);

  const longPressTimer = useRef<any>(null);

  useEffect(() => {
    const savedTransactions = localStorage.getItem('transactions');
    const savedAccounts = localStorage.getItem('accounts');
    const savedTheme = localStorage.getItem('appTheme') as AppTheme;
    if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
    if (savedAccounts) setAccounts(JSON.parse(savedAccounts));
    if (savedTheme) setTheme(savedTheme);
  }, []);

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
    localStorage.setItem('accounts', JSON.stringify(accounts));
    localStorage.setItem('appTheme', theme);
  }, [transactions, accounts, theme]);

  const stats = useMemo(() => {
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const netWorth = accounts.reduce((s, a) => s + a.balance, 0);
    return { totalIncome, totalExpense, balance: totalIncome - totalExpense, netWorth };
  }, [transactions, accounts]);

  // 長按 FAB 觸發 AI 快搜
  const startLongPress = () => {
    longPressTimer.current = setTimeout(() => {
      setIsQuickInputOpen(true);
    }, 500);
  };

  const endLongPress = () => {
    clearTimeout(longPressTimer.current);
  };

  const handleQuickInputSubmit = async () => {
    if (!quickInputText) return;
    setIsProcessingAI(true);
    const result = await parseNaturalLanguageTransaction(quickInputText);
    if (result.amount) {
      const newTx: Transaction = {
        id: Math.random().toString(36).substr(2, 9),
        date: new Date().toISOString().split('T')[0],
        amount: result.amount,
        category: result.category || '其他',
        description: result.description || quickInputText,
        type: (result.type as any) || 'expense',
        accountId: accounts[0].id // 默認現金
      };
      setTransactions(prev => [newTx, ...prev]);
      updateAccountBalance(newTx.accountId, newTx.type === 'income' ? newTx.amount : -newTx.amount);
      setQuickInputText('');
      setIsQuickInputOpen(false);
    }
    setIsProcessingAI(false);
  };

  const updateAccountBalance = (accId: string, diff: number) => {
    setAccounts(prev => prev.map(acc => acc.id === accId ? { ...acc, balance: acc.balance + diff } : acc));
  };

  const handleSaveTransaction = (data: Transaction | Omit<Transaction, 'id'>) => {
    if ('id' in data) {
      const old = transactions.find(t => t.id === data.id);
      if (old) {
        updateAccountBalance(old.accountId, old.type === 'income' ? -old.amount : old.amount);
      }
      setTransactions(prev => prev.map(t => t.id === data.id ? (data as Transaction) : t));
      updateAccountBalance(data.accountId, data.type === 'income' ? data.amount : -data.amount);
    } else {
      const newTx = { ...data, id: Math.random().toString(36).substr(2, 9) } as Transaction;
      setTransactions(prev => [newTx, ...prev]);
      updateAccountBalance(newTx.accountId, newTx.type === 'income' ? newTx.amount : -newTx.amount);
    }
  };

  const themeConfig = THEME_CONFIGS[theme];

  return (
    <div className={`min-h-screen ${theme === 'dragonball' ? 'bg-orange-50' : theme === 'shinchan' ? 'bg-yellow-50' : 'bg-slate-50'} transition-all duration-500`}>
      {/* 頂部主題切換 */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex justify-between items-center border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 ${themeConfig.primary} rounded-lg shadow-lg`}></div>
          <span className="font-black text-slate-800 tracking-tight">SMART AI FINANCE</span>
        </div>
        <div className="flex gap-2">
          {(['classic', 'dragonball', 'mha', 'shinchan'] as AppTheme[]).map(t => (
            <button key={t} onClick={() => setTheme(t)} className={`w-6 h-6 rounded-full border-2 ${theme === t ? 'border-indigo-500 scale-125' : 'border-transparent'}`} style={{ backgroundColor: THEME_CONFIGS[t].primary.replace('bg-', '') }}></button>
          ))}
        </div>
      </header>

      <main className="max-w-xl mx-auto p-4 space-y-6">
        {activeTab === 'home' && (
          <>
            <AccountManager accounts={accounts} onUpdate={updateAccountBalance} />
            <Dashboard transactions={transactions} budgets={[]} stats={stats} />
          </>
        )}

        {activeTab === 'trans' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center px-2">
              <h3 className="text-xl font-black text-slate-800">歷史明細</h3>
              <button onClick={() => setIsImportOpen(true)} className="text-sm font-bold text-indigo-600 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path></svg>
                AI 截圖辨識
              </button>
            </div>
            {transactions.map(tx => (
              <div key={tx.id} onClick={() => setEditingTransaction(tx)} className="bg-white p-5 rounded-3xl border-2 border-slate-100 hover:border-indigo-200 transition-all cursor-pointer flex justify-between items-center group">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${tx.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    {tx.category.charAt(0)}
                  </div>
                  <div>
                    <p className="font-black text-slate-800">{tx.description || tx.category}</p>
                    <p className="text-[10px] text-slate-400 font-bold">{tx.date} • {accounts.find(a => a.id === tx.accountId)?.name}</p>
                  </div>
                </div>
                <p className={`text-lg font-black ${tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {tx.type === 'income' ? '+' : '-'}${tx.amount.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'ai' && <AIPanel transactions={transactions} netWorth={stats.netWorth} />}
      </main>

      {/* 底部迷你導覽 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-100 px-6 py-4 z-50">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <button onClick={() => setActiveTab('home')} className={`p-2 transition-all ${activeTab === 'home' ? 'text-indigo-600 scale-110' : 'text-slate-300'}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
          </button>
          <button onClick={() => setActiveTab('trans')} className={`p-2 transition-all ${activeTab === 'trans' ? 'text-indigo-600 scale-110' : 'text-slate-300'}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
          </button>
          
          {/* 特殊加號按鈕：點擊新增，長按 AI */}
          <div className="relative -mt-12">
            <button 
              onMouseDown={startLongPress}
              onMouseUp={endLongPress}
              onTouchStart={startLongPress}
              onTouchEnd={endLongPress}
              onClick={() => setIsFormOpen(true)}
              className={`w-16 h-16 rounded-full ${themeConfig.primary} text-white shadow-2xl flex items-center justify-center transform hover:scale-110 transition-all active:scale-95`}
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M12 4v16m8-8H4"></path></svg>
            </button>
          </div>

          <button onClick={() => setActiveTab('ai')} className={`p-2 transition-all ${activeTab === 'ai' ? 'text-indigo-600 scale-110' : 'text-slate-300'}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          </button>
          <button onClick={() => setActiveTab('wealth')} className={`p-2 transition-all ${activeTab === 'wealth' ? 'text-indigo-600 scale-110' : 'text-slate-300'}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path></svg>
          </button>
        </div>
      </nav>

      {/* AI 極速語義輸入 Modal */}
      {isQuickInputOpen && (
        <div className="fixed inset-0 bg-indigo-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in zoom-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 space-y-4 shadow-2xl">
            <h3 className="text-xl font-black text-slate-800 text-center">🤖 告訴 AI 你花了什麼？</h3>
            <textarea 
              autoFocus
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl p-6 h-32 outline-none focus:border-indigo-500 font-bold"
              placeholder="例如：剛剛在超商買了 80 元午餐..."
              value={quickInputText}
              onChange={(e) => setQuickInputText(e.target.value)}
            />
            <div className="flex gap-4">
              <button onClick={() => setIsQuickInputOpen(false)} className="flex-1 py-4 text-slate-400 font-bold">取消</button>
              <button 
                onClick={handleQuickInputSubmit} 
                disabled={isProcessingAI}
                className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-100 disabled:opacity-50"
              >
                {isProcessingAI ? '解析中...' : '提交'}
              </button>
            </div>
          </div>
        </div>
      )}

      {(isFormOpen || editingTransaction) && (
        <TransactionForm
          onSave={handleSaveTransaction}
          onClose={() => { setIsFormOpen(false); setEditingTransaction(null); }}
          initialData={editingTransaction}
          theme={theme}
          accounts={accounts}
        />
      )}

      {isImportOpen && (
        <ImportModal
          onImport={(txs) => {
            txs.forEach(t => handleSaveTransaction({...t, accountId: accounts[0].id}));
            setIsImportOpen(false);
          }}
          onClose={() => setIsImportOpen(false)}
        />
      )}
    </div>
  );
};

export default App;
