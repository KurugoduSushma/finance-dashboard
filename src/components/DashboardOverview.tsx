import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Wallet, AlertCircle } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { formatCurrency, cn } from '../lib/utils';
import styles from './DashboardOverview.module.css';

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1'];

export function DashboardOverview() {
  const { transactions, budgets } = useAppContext();

  // Compute stats
  const stats = useMemo(() => {
    let income = 0;
    let expenses = 0;
    
    transactions.forEach(t => {
      if (t.type === 'income') income += t.amount;
      if (t.type === 'expense') expenses += t.amount;
    });

    return {
      balance: income - expenses,
      income,
      expenses
    };
  }, [transactions]);

  // Compute trend data safely
  const trendData = useMemo(() => {
    const sorted = [...transactions].sort((a, b) => {
      const timeA = new Date(a.date).getTime();
      const timeB = new Date(b.date).getTime();
      return (isNaN(timeA) ? 0 : timeA) - (isNaN(timeB) ? 0 : timeB);
    });
    let currentBalance = 0;
    
    return sorted.map(t => {
      if (t.type === 'income') currentBalance += t.amount;
      else currentBalance -= t.amount;
      const d = new Date(t.date);
      return {
        date: isNaN(d.getTime()) ? 'Unknown' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        balance: currentBalance,
      };
    });
  }, [transactions]);

  const categoryData = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const categories: Record<string, number> = {};
    
    expenses.forEach(t => {
      categories[t.category] = (categories[t.category] || 0) + t.amount;
    });

    return Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  const budgetAlerts = useMemo(() => {
    const spending: Record<string, number> = {};
    const targetMonth = 2; // March is index 2
    transactions.filter(t => t.type === 'expense').forEach(t => {
      const d = new Date(t.date);
      if (!isNaN(d.getTime()) && d.getMonth() === targetMonth) {
        spending[t.category] = (spending[t.category] || 0) + t.amount;
      }
    });

    const alerts: string[] = [];
    Object.entries(budgets).forEach(([cat, limit]) => {
      const sp = spending[cat] || 0;
      const perc = Math.round((sp / limit) * 100);
      if (perc >= 100) {
        alerts.push(`Critical: You have exceeded your ${cat} budget (${perc}% used).`);
      } else if (perc >= 80) {
        alerts.push(`Warning: You have used ${perc}% of your ${cat} budget.`);
      }
    });
    return alerts;
  }, [transactions, budgets]);

  return (
    <div className={styles.container}>
      <div className={styles.statsGrid}>
        <div className={cn(styles.statCard, 'animate-slide-up', 'delay-1')}>
          <div className={styles.statHeader}>
            <span>Total Balance</span>
            <div className={cn(styles.statIcon, styles.primary)}><Wallet size={20} /></div>
          </div>
          <div className={styles.statValue}>{formatCurrency(stats.balance)}</div>
        </div>
        
        <div className={cn(styles.statCard, 'animate-slide-up', 'delay-2')}>
          <div className={styles.statHeader}>
            <span>Total Income</span>
            <div className={cn(styles.statIcon, styles.success)}><ArrowUpRight size={20} /></div>
          </div>
          <div className={styles.statValue}>{formatCurrency(stats.income)}</div>
        </div>

        <div className={cn(styles.statCard, 'animate-slide-up', 'delay-3')}>
          <div className={styles.statHeader}>
            <span>Total Expenses</span>
            <div className={cn(styles.statIcon, styles.danger)}><ArrowDownRight size={20} /></div>
          </div>
          <div className={styles.statValue}>{formatCurrency(stats.expenses)}</div>
        </div>
      </div>

      {budgetAlerts.length > 0 && (
        <div className={cn(styles.alertsContainer, 'animate-slide-up', 'delay-4')}>
          {budgetAlerts.map((alert, i) => (
            <div key={i} className={cn(styles.alertBanner, alert.startsWith('Critical') ? styles.alertCritical : styles.alertWarning)}>
              <AlertCircle size={20} />
              <span>{alert}</span>
            </div>
          ))}
        </div>
      )}

      <div className={styles.chartsGrid}>
        <div className={cn(styles.chartCard, 'animate-scale-in', 'delay-5')}>
          <div className={styles.chartHeader}>Balance Trend</div>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2b303b" />
              <XAxis dataKey="date" stroke="#a1a5b0" tick={{ fill: '#a1a5b0', fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis 
                stroke="#a1a5b0" 
                tickMargin={10}
                tickFormatter={(value) => `₹${value}`} 
                tick={{ fill: '#a1a5b0', fontSize: 12 }}
                tickLine={false} axisLine={false}
              />
              <RechartsTooltip 
                contentStyle={{ backgroundColor: '#181b21', borderColor: '#2b303b', color: '#f0f2f5', borderRadius: '8px' }}
                itemStyle={{ color: '#8b5cf6' }}
              />
              <Area type="monotone" dataKey="balance" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorBalance)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className={cn(styles.chartCard, 'animate-scale-in', 'delay-5')}>
          <div className={styles.chartHeader}>Expenses by Category</div>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {categoryData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  formatter={(value: any) => formatCurrency(value)}
                  contentStyle={{ backgroundColor: '#181b21', borderColor: '#2b303b', color: '#f0f2f5', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)'}}>
              No expenses yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
