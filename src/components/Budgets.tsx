import React, { useState, useMemo } from 'react';
import { AlertCircle, Trash2, Edit2, Check, Plus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { useAppContext } from '../context/AppContext';
import { formatCurrency, cn } from '../lib/utils';
import { CATEGORIES } from '../data/mock';
import styles from './Budgets.module.css';

export function Budgets() {
  const { transactions, budgets, role, setBudgetLimit, removeBudget } = useAppContext();
  
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState<string>('');
  
  const [isAdding, setIsAdding] = useState(false);
  const [newCat, setNewCat] = useState(CATEGORIES[0]);
  const [newLimit, setNewLimit] = useState('');

  const currentMonthData = useMemo(() => {
    const spending: Record<string, number> = {};
    const targetMonth = 2; // March is index 2 for our mock data
    
    transactions.filter(t => t.type === 'expense').forEach(t => {
      const d = new Date(t.date);
      if (!isNaN(d.getTime()) && d.getMonth() === targetMonth) {
        spending[t.category] = (spending[t.category] || 0) + t.amount;
      }
    });

    return Object.entries(budgets).map(([category, limit]) => {
      const spent = spending[category] || 0;
      const percentage = limit > 0 ? (spent / limit) * 100 : 0;
      return { category, limit, spent, percentage: Math.min(percentage, 100), rawPercentage: percentage };
    }).sort((a, b) => b.percentage - a.percentage);
  }, [transactions, budgets]);

  const historyData = useMemo(() => {
    const monthMap: Record<string, { month: string, spent: number, budgetTotal: number }> = {};
    const totalBudget = Object.values(budgets).reduce((acc, curr) => acc + curr, 0);

    transactions.filter(t => t.type === 'expense').forEach(t => {
      const date = new Date(t.date);
      if(isNaN(date.getTime())) return;
      
      const monthLabel = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      if (!monthMap[monthLabel]) {
        monthMap[monthLabel] = { month: monthLabel, spent: 0, budgetTotal: totalBudget };
      }
      monthMap[monthLabel].spent += t.amount;
    });

    return Object.values(monthMap).sort((a,b) => new Date(a.month).getTime() - new Date(b.month).getTime());
  }, [transactions, budgets]);


  const handleSaveEdit = (cat: string) => {
    const val = parseFloat(editAmount);
    if (!isNaN(val) && val > 0) {
      setBudgetLimit(cat, val);
    }
    setEditingCategory(null);
  };

  const handleAddBudget = () => {
    const val = parseFloat(newLimit);
    if (!isNaN(val) && val > 0 && newCat) {
      setBudgetLimit(newCat, val);
    }
    setIsAdding(false);
    setNewCat(CATEGORIES[0]);
    setNewLimit('');
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleInfo}>
          <h2>Monthly Budgets</h2>
          <p>Track your spending against limits. Editing is restricted to Admins.</p>
        </div>
        {role === 'admin' && !isAdding && (
          <button className={styles.addBtn} onClick={() => setIsAdding(true)}>
            <Plus size={18} /> Add Budget
          </button>
        )}
      </div>

      {isAdding && role === 'admin' && (
        <div className={styles.addCard}>
          <select value={newCat} onChange={e => setNewCat(e.target.value)} className={styles.select}>
            {CATEGORIES.filter(c => !budgets[c]).map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <div className={styles.editWrap}>
            <span className={styles.currencySymbol}>₹</span>
            <input 
              type="number" 
              value={newLimit} 
              onChange={e => setNewLimit(e.target.value)} 
              placeholder="Limit..."
              className={styles.input}
            />
          </div>
          <button className={styles.iconBtnPos} onClick={handleAddBudget}><Check size={18} /></button>
          <button className={styles.iconBtnNeg} onClick={() => setIsAdding(false)}>Cancel</button>
        </div>
      )}
      
      <div className={styles.grid}>
        {currentMonthData.length === 0 && !isAdding && (
          <div style={{ color: 'var(--text-secondary)'}}>No budgets set up yet.</div>
        )}
        
        {currentMonthData.map((b, idx) => {
          const isEditing = editingCategory === b.category;

          return (
            <div key={b.category} className={cn(styles.card, 'animate-slide-up')} style={{ animationDelay: `${idx * 0.05}s` }}>
              <div className={styles.cardHeader}>
                <div className={styles.categoryName}>{b.category}</div>
                <div style={{display:'flex', gap: '8px', alignItems:'center'}}>
                  {b.rawPercentage >= 100 && !isEditing && <AlertCircle size={18} className={styles.alertIcon} />}
                  {role === 'admin' && !isEditing && (
                    <>
                      <button className={styles.actionBtn} onClick={() => { setEditingCategory(b.category); setEditAmount(b.limit.toString()); }}><Edit2 size={16} /></button>
                      <button className={styles.actionBtnNeg} onClick={() => removeBudget(b.category)}><Trash2 size={16} /></button>
                    </>
                  )}
                </div>
              </div>
              
              <div className={styles.amounts}>
                <span className={styles.spent}>{formatCurrency(b.spent)}</span>
                {isEditing ? (
                  <div className={styles.editRow}>
                    <span style={{ color: 'var(--text-secondary)'}}> / ₹</span>
                    <input 
                       type="number" 
                       className={styles.input} 
                       value={editAmount} 
                       onChange={e => setEditAmount(e.target.value)} 
                    />
                    <button className={styles.iconBtnPos} onClick={() => handleSaveEdit(b.category)}><Check size={18}/></button>
                  </div>
                ) : (
                  <span className={styles.limit}> / {formatCurrency(b.limit)}</span>
                )}
              </div>

              <div className={styles.progressWrap}>
                <div 
                  className={cn(styles.progressBar, b.rawPercentage >= 100 ? styles.danger : b.rawPercentage >= 80 ? styles.warning : styles.safe)}
                  style={{ width: `${b.percentage}%` }}
                />
              </div>
              
              <div className={styles.footer}>
                <span>{Math.round(b.rawPercentage)}% used</span>
                <span>{formatCurrency(Math.max(0, b.limit - b.spent))} left</span>
              </div>
            </div>
          )
        })}
      </div>

      <div className={styles.chartCard}>
        <div className={styles.chartHeader}>Budget History</div>
        <div className={styles.chartArea}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={historyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2b303b" />
              <XAxis dataKey="month" stroke="#a1a5b0" tick={{ fill: '#a1a5b0', fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis 
                stroke="#a1a5b0" 
                tickMargin={10}
                tickFormatter={(val) => `₹${val}`} 
                tick={{ fill: '#a1a5b0', fontSize: 12 }}
                tickLine={false} axisLine={false}
              />
              <RechartsTooltip 
                  formatter={(val: any) => formatCurrency(val)}
                  contentStyle={{ backgroundColor: '#181b21', borderColor: '#2b303b', color: '#f0f2f5', borderRadius: '8px' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar dataKey="spent" name="Spent Amount" fill="#8b5cf6" radius={[4,4,0,0]} />
              <Bar dataKey="budgetTotal" name="Total Budget Capability" fill="#2b303b" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
