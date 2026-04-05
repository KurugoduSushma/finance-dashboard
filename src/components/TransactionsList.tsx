import React, { useState, useMemo } from 'react';
import { Search, Trash2, Receipt, Download } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { formatCurrency, cn } from '../lib/utils';
import { CATEGORIES } from '../data/mock';
import styles from './TransactionsList.module.css';

export function TransactionsList() {
  const { transactions, role, deleteTransaction } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const filteredTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => {
        const timeA = new Date(a.date).getTime();
        const timeB = new Date(b.date).getTime();
        return (isNaN(timeB) ? 0 : timeB) - (isNaN(timeA) ? 0 : timeA);
      })
      .filter(t => {
        const searchInput = (t.description || '').toLowerCase();
        const matchesSearch = searchInput.includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'All' || t.category === categoryFilter;
        return matchesSearch && matchesCategory;
      });
  }, [transactions, searchTerm, categoryFilter]);

  const handleExportCSV = () => {
    const headers = ["Date", "Description", "Category", "Type", "Amount"];
    const csvContent = [
      headers.join(","),
      ...filteredTransactions.map(t => [t.date, `"${(t.description || '').replace(/"/g, '""')}"`, t.category, t.type, t.amount].join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getSafeDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? 'Unknown Date' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className={cn(styles.container, 'animate-slide-up')}>
      <div className={styles.header}>
        <div className={styles.title}>All Transactions</div>
        <div className={styles.filters}>
          <div className={styles.searchWrap}>
            <Search className={styles.searchIcon} size={18} />
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className={styles.selectInput}
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <button 
            className={styles.actionBtn} 
            onClick={handleExportCSV}
            title="Export as CSV"
            style={{ padding: '10px 16px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}
          >
            <Download size={18} />
          </button>
        </div>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Date</th>
              <th className={styles.th}>Description</th>
              <th className={styles.th}>Category</th>
              <th className={styles.th}>Type</th>
              <th className={styles.th}>Amount</th>
              {role === 'admin' && <th className={styles.th}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((tx, idx) => (
                <tr 
                  key={tx.id} 
                  className={cn(styles.tr, 'animate-slide-up')} 
                  style={{ animationDelay: `${(idx % 10) * 0.05}s` }}
                >
                  <td className={styles.td}>
                    {getSafeDate(tx.date)}
                  </td>
                  <td className={styles.td} style={{ fontWeight: 500 }}>{tx.description}</td>
                  <td className={styles.td}>{tx.category}</td>
                  <td className={styles.td}>
                    <span className={cn(styles.typeBadge, styles[tx.type])}>
                      {tx.type}
                    </span>
                  </td>
                  <td className={cn(styles.td, styles.amount, styles[tx.type])}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </td>
                  {role === 'admin' && (
                    <td className={styles.td}>
                      <button 
                        className={styles.actionBtn}
                        onClick={() => deleteTransaction(tx.id)}
                        title="Delete transaction"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={role === 'admin' ? 6 : 5}>
                  <div className={styles.emptyState}>
                    <Receipt size={48} className={styles.emptyIcon} />
                    <p>No transactions found matching your filters.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
