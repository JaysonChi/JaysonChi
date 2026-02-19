
import React, { useState, useRef } from 'react';
import { parseTransactionsFromImage } from '../services/geminiService';
import { Transaction } from '../types';

interface Props {
  onImport: (transactions: Omit<Transaction, 'id'>[]) => void;
  onClose: () => void;
}

export const ImportModal: React.FC<Props> = ({ onImport, onClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [extracted, setExtracted] = useState<Partial<Transaction>[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(selected);
    }
  };

  const processImage = async () => {
    if (!preview) return;
    setLoading(true);
    try {
      const results = await parseTransactionsFromImage(preview);
      setExtracted(results);
    } catch (err) {
      alert("解析失敗，請再試一次");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    const validTransactions = extracted as Omit<Transaction, 'id'>[];
    onImport(validTransactions);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">AI 截圖自動匯入</h2>
            <p className="text-sm text-slate-500">上傳舊記帳 App 的截圖，由 AI 自動搬家</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 lg:p-10 hide-scrollbar">
          {!preview ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-4 border-dashed border-slate-100 rounded-3xl p-12 text-center hover:border-indigo-200 hover:bg-indigo-50/30 transition-all cursor-pointer group"
            >
              <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-10 h-10 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              </div>
              <p className="text-lg font-bold text-slate-700">點擊上傳截圖</p>
              <p className="text-slate-400 mt-1">支援 PNG, JPG 格式</p>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="space-y-4">
                <p className="font-bold text-slate-800">原始截圖</p>
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-inner group">
                  <img src={preview} alt="Preview" className="w-full h-auto object-contain max-h-[400px]" />
                  {loading && (
                    <div className="absolute inset-0 bg-indigo-600/10 flex items-center justify-center overflow-hidden">
                       <div className="w-full h-1 bg-white/50 absolute top-0 animate-[scan_2s_infinite]"></div>
                       <div className="bg-white/90 px-4 py-2 rounded-lg shadow-lg font-bold text-indigo-600 animate-pulse">
                         AI 正在掃描中...
                       </div>
                    </div>
                  )}
                </div>
                {!extracted.length && !loading && (
                  <button 
                    onClick={processImage}
                    className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all"
                  >
                    開始 AI 辨識
                  </button>
                )}
                <button 
                  onClick={() => {setPreview(null); setExtracted([]);}}
                  className="w-full py-3 text-slate-500 font-medium hover:text-slate-700 transition-colors"
                >
                  重新選擇圖片
                </button>
              </div>

              <div className="space-y-4">
                <p className="font-bold text-slate-800">辨識結果 ({extracted.length})</p>
                {loading ? (
                  <div className="space-y-3">
                    {[1,2,3].map(i => (
                      <div key={i} className="h-20 bg-slate-50 rounded-xl animate-pulse"></div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 hide-scrollbar">
                    {extracted.map((tx, idx) => (
                      <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                        <div>
                          <p className="text-xs text-slate-400">{tx.date}</p>
                          <p className="font-bold text-slate-700">{tx.description}</p>
                          <span className="text-[10px] px-1.5 py-0.5 bg-white border border-slate-200 rounded-md text-slate-500 uppercase">{tx.category}</span>
                        </div>
                        <p className={`font-bold ${tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {tx.type === 'income' ? '+' : '-'}${tx.amount}
                        </p>
                      </div>
                    ))}
                    {!extracted.length && !loading && (
                      <div className="h-full flex items-center justify-center py-10 border-2 border-dashed border-slate-100 rounded-2xl">
                        <p className="text-slate-400 text-sm italic">點擊「開始辨識」以提取資料</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {extracted.length > 0 && (
          <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-4">
            <button 
              onClick={onClose}
              className="flex-1 py-4 text-slate-600 font-bold bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors"
            >
              取消
            </button>
            <button 
              onClick={handleConfirm}
              className="flex-1 py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all"
            >
              確認並匯入帳本
            </button>
          </div>
        )}
      </div>
      <style>{`
        @keyframes scan {
          0% { transform: translateY(-100%); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(1000%); opacity: 0; }
        }
      `}</style>
    </div>
  );
};
