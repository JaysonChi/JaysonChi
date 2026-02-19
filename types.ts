
export type TransactionType = 'income' | 'expense';
export type AppTheme = 'classic' | 'dragonball' | 'mha' | 'shinchan';
export type AccountType = 'cash' | 'bank' | 'e-pay' | 'credit' | 'investment';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
}

export interface Budget {
  category: string;
  limit: number;
  spent: number;
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  category: string;
  description: string;
  type: TransactionType;
  accountId: string;
  mood?: string; // 記錄消費時的心情
  merchant?: string;
}

export interface RecurringRule {
  id: string;
  description: string;
  amount: number;
  category: string;
  frequency: 'monthly' | 'weekly' | 'yearly';
  nextDate: string;
  accountId: string;
}

export interface AISimulationResult {
  scenario: string;
  impactOnCashFlow: string;
  recommendation: string;
  safetyScore: number;
}

export interface SummaryStats {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  netWorth: number;
}
