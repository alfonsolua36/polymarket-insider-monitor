import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import AlertFeed from './components/AlertFeed';
import WalletList from './components/WalletList';
import TradeHistory from './components/TradeHistory';
import Settings from './components/Settings';
import { useAlerts } from './hooks/useAlerts';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { alerts, addAlert } = useAlerts();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <Toaster position="top-right" />
      
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="container mx-auto px-4 py-8">
        {activeTab === 'dashboard' && <Dashboard alerts={alerts} />}
        {activeTab === 'alerts' && <AlertFeed alerts={alerts} />}
        {activeTab === 'wallets' && <WalletList />}
        {activeTab === 'trades' && <TradeHistory />}
        {activeTab === 'settings' && <Settings />}
      </main>
    </div>
  );
}

export default App;
