import React, { createContext, useContext, useState } from 'react';
import type { Transaction } from '../data/mock';
import { INITIAL_TRANSACTIONS } from '../data/mock';

export type Role = 'viewer' | 'admin';

export type BudgetsMap = Record<string, number>;
const INITIAL_BUDGETS: BudgetsMap = {
  'Groceries': 400,
  'Rent': 2500,
  'Dining': 200,
  'Subscriptions': 100,
  'Transportation': 150,
  'Shopping': 300,
};

interface AppContextType {
  role: Role;
  setRole: (role: Role) => void;
  transactions: Transaction[];
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  budgets: BudgetsMap;
  setBudgetLimit: (category: string, limit: number) => void;
  removeBudget: (category: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>('admin'); // Defaults to admin for demonstration
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem('finance-dashboard-tx-v4');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_TRANSACTIONS;
  });

  const [budgets, setBudgets] = useState<BudgetsMap>(() => {
    try {
      const saved = localStorage.getItem('finance-dashboard-budgets-v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_BUDGETS;
  });

  // Persist transactions to local storage whenever they change
  React.useEffect(() => {
    localStorage.setItem('finance-dashboard-tx-v4', JSON.stringify(transactions));
  }, [transactions]);

  React.useEffect(() => {
    localStorage.setItem('finance-dashboard-budgets-v1', JSON.stringify(budgets));
  }, [budgets]);

  const addTransaction = (tx: Omit<Transaction, 'id'>) => {
    const newTx = { ...tx, id: Math.random().toString(36).substring(2, 9) };
    setTransactions(prev => [newTx, ...prev]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const setBudgetLimit = (category: string, limit: number) => {
    setBudgets(prev => ({ ...prev, [category]: limit }));
  };

  const removeBudget = (category: string) => {
    setBudgets(prev => {
      const next = { ...prev };
      delete next[category];
      return next;
    });
  };

  return (
    <AppContext.Provider value={{ 
      role, setRole, transactions, addTransaction, deleteTransaction,
      budgets, setBudgetLimit, removeBudget
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
