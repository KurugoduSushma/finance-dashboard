export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  category: string;
  type: TransactionType;
  description: string;
}

export const INITIAL_TRANSACTIONS: Transaction[] = [
  // Jan 2026
  { id: 'j1', date: '2026-01-05', amount: 2200, category: 'Rent', type: 'expense', description: 'Apartment Rent' },
  { id: 'j2', date: '2026-01-10', amount: 350, category: 'Groceries', type: 'expense', description: 'Whole Foods' },
  { id: 'j3', date: '2026-01-15', amount: 150, category: 'Dining', type: 'expense', description: 'Restaurant' },
  { id: 'j4', date: '2026-01-28', amount: 5500, category: 'Salary', type: 'income', description: 'Salary' },
  
  // Feb 2026
  { id: 'f1', date: '2026-02-05', amount: 2200, category: 'Rent', type: 'expense', description: 'Apartment Rent' },
  { id: 'f2', date: '2026-02-12', amount: 410, category: 'Groceries', type: 'expense', description: 'Trader Joes' },
  { id: 'f3', date: '2026-02-20', amount: 380, category: 'Dining', type: 'expense', description: 'Steakhouse & Fast Food' },
  { id: 'f4', date: '2026-02-28', amount: 5500, category: 'Salary', type: 'income', description: 'Salary' },
  { id: 'f5', date: '2026-02-14', amount: 120, category: 'Shopping', type: 'expense', description: 'Valentines Gift' },

  // Mar 2026
  { id: '1', date: '2026-03-01', amount: 5500, category: 'Salary', type: 'income', description: 'Monthly Salary' },
  { id: '2', date: '2026-03-02', amount: 150, category: 'Groceries', type: 'expense', description: 'Whole Foods' },
  { id: '3', date: '2026-03-05', amount: 2200, category: 'Rent', type: 'expense', description: 'Apartment Rent' },
  { id: '4', date: '2026-03-06', amount: 45, category: 'Subscriptions', type: 'expense', description: 'Netflix & Spotify' },
  { id: '5', date: '2026-03-08', amount: 450, category: 'Freelance', type: 'income', description: 'UI Design Project' },
  { id: '6', date: '2026-03-10', amount: 95, category: 'Dining', type: 'expense', description: 'Dinner with friends' },
  { id: '7', date: '2026-03-12', amount: 35, category: 'Transportation', type: 'expense', description: 'Uber Rides' },
  { id: '8', date: '2026-03-15', amount: 210, category: 'Shopping', type: 'expense', description: 'New Winter Jacket' },
  { id: '9', date: '2026-03-20', amount: 500, category: 'Investments', type: 'expense', description: 'ETF Deposit' },
  { id: '10', date: '2026-03-25', amount: 180, category: 'Groceries', type: 'expense', description: 'Trader Joes' },
  { id: '11', date: '2026-03-28', amount: 60, category: 'Dining', type: 'expense', description: 'Coffee Shop out' },
];

export const CATEGORIES = [
  'Salary', 'Freelance', 'Investments', 'Groceries', 'Rent', 'Subscriptions', 'Dining', 'Transportation', 'Shopping', 'Other'
];
