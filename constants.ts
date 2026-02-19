
export const CATEGORIES = [
  '餐飲食品', '交通運輸', '購物休閒', '娛樂生活', 
  '居家住宅', '公共帳單', '醫療保健', '薪資收入', 
  '投資獲利', '訂閱服務', '手續費', '其他'
];

export const THEME_CONFIGS = {
  classic: {
    primary: 'bg-indigo-600',
    secondary: 'bg-indigo-50',
    text: 'text-indigo-600',
    border: 'border-indigo-100',
    accent: 'indigo',
    font: 'Inter'
  },
  dragonball: {
    primary: 'bg-orange-500',
    secondary: 'bg-blue-50',
    text: 'text-orange-600',
    border: 'border-orange-300',
    accent: 'orange',
    font: 'sans-serif'
  },
  mha: {
    primary: 'bg-red-600',
    secondary: 'bg-slate-200',
    text: 'text-red-600',
    border: 'border-blue-900',
    accent: 'red',
    font: 'Impact'
  },
  shinchan: {
    primary: 'bg-yellow-400',
    secondary: 'bg-emerald-50',
    text: 'text-yellow-700',
    border: 'border-yellow-200',
    accent: 'yellow',
    font: 'cursive'
  }
};

export const INITIAL_ACCOUNTS: any[] = [
  { id: 'acc1', name: '現金', type: 'cash', balance: 5000 },
  { id: 'acc2', name: '中信銀行', type: 'bank', balance: 150000 },
  { id: 'acc3', name: '玉山信用卡', type: 'credit', balance: -12000 },
  { id: 'acc4', name: '台股投資', type: 'investment', balance: 300000 }
];
