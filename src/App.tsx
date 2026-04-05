import React, { useState } from 'react';
import { LayoutDashboard, Receipt, Wallet, Target, Lightbulb, Plus } from 'lucide-react';
import { useAppContext } from './context/AppContext';
import { cn } from './lib/utils';
import styles from './App.module.css';

import { DashboardOverview } from './components/DashboardOverview';
import { TransactionsList } from './components/TransactionsList';
import { Budgets } from './components/Budgets';
import { Insights } from './components/Insights';
import { AddTransactionModal } from './components/AddTransactionModal';

type Tab = 'dashboard' | 'transactions' | 'budgets' | 'insights';

function App() {
  const { role, setRole } = useAppContext();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);

  const getPageTitle = (tab: Tab) => {
    switch(tab) {
      case 'dashboard': return 'Dashboard Overview';
      case 'transactions': return 'Transactions';
      case 'budgets': return 'Monthly Budgets';
      case 'insights': return 'Financial Insights';
    }
  }

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard': return <DashboardOverview />;
      case 'transactions': return <TransactionsList />;
      case 'budgets': return <Budgets />;
      case 'insights': return <Insights />;
    }
  }

  return (
    <div className={styles.layout}>
      {isAddingTransaction && <AddTransactionModal onClose={() => setIsAddingTransaction(false)} />}
      
      {role === 'admin' && (
        <button className={styles.fab} onClick={() => setIsAddingTransaction(true)}>
          <Plus size={32} />
        </button>
      )}

      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarTitle}>
          <Wallet className={styles.sidebarTitleIcon} size={28} />
          <span>Finez.</span>
        </div>
        
        <nav className={styles.nav}>
          <button 
            className={cn(styles.navItem, activeTab === 'dashboard' && styles.active)}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={20} />
            Overview
          </button>
          <button 
            className={cn(styles.navItem, activeTab === 'transactions' && styles.active)}
            onClick={() => setActiveTab('transactions')}
          >
            <Receipt size={20} />
            Transactions
          </button>
          <button 
            className={cn(styles.navItem, activeTab === 'budgets' && styles.active)}
            onClick={() => setActiveTab('budgets')}
          >
            <Target size={20} />
            Budgets
          </button>
          <button 
            className={cn(styles.navItem, activeTab === 'insights' && styles.active)}
            onClick={() => setActiveTab('insights')}
          >
            <Lightbulb size={20} />
            Insights
          </button>
        </nav>

        <div className={styles.userProfile}>
          <div className={styles.userAvatar}>SJ</div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>Steve Jobs</span>
            <span className={styles.userRole}>{role}</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.main}>
        {/* Header */}
        <header className={styles.header}>
          <h1 className={styles.title}>
            {getPageTitle(activeTab)}
          </h1>
          
          <div className={styles.headerRight}>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>View as:</div>
            <select 
              className={styles.roleSelect} 
              value={role} 
              onChange={(e) => setRole(e.target.value as 'viewer' | 'admin')}
            >
              <option value="viewer">Viewer</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className={styles.content}>
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default App;
