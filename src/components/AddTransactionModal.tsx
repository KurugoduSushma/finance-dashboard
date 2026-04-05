import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { CATEGORIES } from '../data/mock';
import type { TransactionType } from '../data/mock';
import { cn } from '../lib/utils';
import styles from './AddTransactionModal.module.css';

interface Props {
  onClose: () => void;
}

export function AddTransactionModal({ onClose }: Props) {
  const { addTransaction } = useAppContext();
  
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Groceries');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) return;
    
    addTransaction({
      amount: parseFloat(amount),
      description,
      category: type === 'income' ? 'Salary' : category, // Default assumption for the mock
      date,
      type
    });
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}><X size={20} /></button>
        <h2 className={styles.title}>New Transaction</h2>
        
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Type</label>
            <div className={styles.typeToggle}>
              <button type="button" className={cn(styles.typeBtn, type === 'expense' && styles.activeExpense)} onClick={() => setType('expense')}>Expense</button>
              <button type="button" className={cn(styles.typeBtn, type === 'income' && styles.activeIncome)} onClick={() => setType('income')}>Income</button>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Amount (₹)</label>
            <input type="number" step="0.01" required value={amount} onChange={(e) => setAmount(e.target.value)} className={styles.input} placeholder="0.00" />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Description</label>
            <input type="text" required value={description} onChange={(e) => setDescription(e.target.value)} className={styles.input} placeholder="e.g. Morning Coffee" />
          </div>

          {type === 'expense' && (
            <div className={styles.formGroup}>
              <label className={styles.label}>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className={styles.select}>
                {CATEGORIES.filter(c => c !== 'Salary' && c !== 'Freelance').map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          )}

          <div className={styles.formGroup}>
            <label className={styles.label}>Date</label>
            <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className={styles.input} />
          </div>

          <button type="submit" className={styles.submitBtn}>Save Transaction</button>
        </form>
      </div>
    </div>
  );
}
