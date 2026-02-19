
import React from 'react';
import { Transaction, Budget, SummaryStats } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

interface Props {
  transactions: Transaction[];
  budgets: Budget[];
  stats: SummaryStats;
}

const COLORS = ['#6366f1', '#f43f5e', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

export const Dashboard: React.FC<Props> = ({ transactions, budgets, stats }) => {
  const expenseByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const pieData = Object.entries(expenseByCategory).map(([name, value]) => ({ name, value }));

  const barData = budgets.map(b => ({
    name: b.category,
    已用: b.spent,
    預算: b.limit,
  }));

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border-2 border-slate-100 flex flex-col items-center">
          <p className="text-xs font-black text-slate-400 mb-2 uppercase tracking-widest">總收入</p>
          <p className="text-3xl font-black text-emerald-600">${stats.totalIncome.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border-2 border-slate-100 flex flex-col items-center">
          <p className="text-xs font-black text-slate-400 mb-2 uppercase tracking-widest">總支出</p>
          <p className="text-3xl font-black text-rose-600">${stats.totalExpense.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border-2 border-slate-100 flex flex-col items-center">
          <p className="text-xs font-black text-slate-400 mb-2 uppercase tracking-widest">當前結餘</p>
          <p className="text-3xl font-black text-slate-900">${stats.balance.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border-2 border-slate-100">
          <h3 className="text-lg font-black text-slate-800 mb-6">支出比例分析</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Budget vs Spent */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border-2 border-slate-100">
          <h3 className="text-lg font-black text-slate-800 mb-6">預算達標進度</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="已用" fill="#f43f5e" radius={[0, 8, 8, 0]} />
                <Bar dataKey="預算" fill="#f1f5f9" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
