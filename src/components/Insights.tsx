import React, { useMemo } from 'react';
import { Lightbulb, TrendingDown, TrendingUp, AlertTriangle, Target } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { formatCurrency, cn } from '../lib/utils';
import styles from './Insights.module.css';

export function Insights() {
  const { transactions } = useAppContext();

  const insights = useMemo(() => {
    let income = 0;
    let expenses = 0;
    const categorySpending: Record<string, number> = {};

    transactions.forEach(t => {
      if (t.type === 'income') income += t.amount;
      if (t.type === 'expense') {
        expenses += t.amount;
        categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount;
      }
    });

    const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;
    const topCategory = Object.entries(categorySpending).sort((a,b) => b[1] - a[1])[0] || ['None', 0];
    
    const generatedInsights = [];

    if (savingsRate > 20) {
      generatedInsights.push({
        id: 'savings',
        title: 'Great Savings Rate!',
        description: `Your savings rate is ${savingsRate.toFixed(1)}% this month. You're building a strong financial safety net.`,
        type: 'positive',
        icon: <TrendingUp size={24} />
      });
    } else {
      generatedInsights.push({
        id: 'savings',
        title: 'Low Savings Rate',
        description: `Your savings rate is only ${savingsRate.toFixed(1)}%. Consider cutting unnecessary expenses to reach the 20% rule of thumb.`,
        type: 'warning',
        icon: <AlertTriangle size={24} />
      });
    }

    if (topCategory[1] > 0) {
      generatedInsights.push({
        id: 'top-expense',
        title: 'Largest Expense Focus',
        description: `You've spent ${formatCurrency(topCategory[1] as number)} on ${topCategory[0]}, making it your largest expense. Review to see if optimizations can be made.`,
        type: 'danger',
        icon: <TrendingDown size={24} />
      });
    }

    const diningAmount = categorySpending['Dining'] || 0;
    if (diningAmount > 200) {
      generatedInsights.push({
        id: 'suggestion',
        title: 'Dining Optimization',
        description: `You're spending quite a bit on dining (${formatCurrency(diningAmount)}). Cooking 2 more meals at home per week could save you significantly over the next month.`,
        type: 'info',
        icon: <Lightbulb size={24} />
      });
    } else {
      generatedInsights.push({
        id: 'suggestion',
        title: 'On Track',
        description: 'Your discretionary spending looks healthy. Keep up the good habits!',
        type: 'neutral',
        icon: <Target size={24} />
      });
    }

    return generatedInsights;
  }, [transactions]);

  return (
    <div className={cn(styles.container, 'animate-slide-up')}>
      {insights.map((insight, idx) => (
        <div 
          key={insight.id} 
          className={cn(styles.card, 'animate-slide-up')}
          style={{ animationDelay: `${(idx + 1) * 0.15}s` }}
        >
          <div className={cn(styles.iconWrap, styles[insight.type as keyof typeof styles])}>
            {insight.icon}
          </div>
          <div className={styles.content}>
            <h3 className={styles.title}>{insight.title}</h3>
            <p className={styles.description}>{insight.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
