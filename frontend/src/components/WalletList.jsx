import React, { useEffect, useState } from 'react';
import { Wallet, ExternalLink, Clock } from 'lucide-react';
import { api } from '../services/api';
import { formatDistanceToNow } from 'date-fns';

const WalletList = () => {
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWallets();
  }, []);

  const loadWallets = async () => {
    try {
      const data = await api.getWallets();
      setWallets(data || []);
    } catch (error) {
      console.error('Error loading wallets:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Tracked Wallets</h2>
        <span className="text-gray-400">{wallets.length} wallets</span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {wallets.map((wallet, idx) => (
          <div
            key={idx}
            className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Wallet className="w-6 h-6 text-blue-400" />
                <div>
                  <code className="text-sm bg-gray-900 px-3 py-1 rounded">
                    {wallet.address}
                  </code>
                  <div className="flex items-center gap-2 mt-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-400">
                      First seen {formatDistanceToNow(new Date(wallet.first_seen), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>
              
              
                href={`https://polygonscan.com/address/${wallet.address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">First Trade Market</p>
                <p className="font-medium">{wallet.first_trade_market || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">First Trade Amount</p>
                <p className="font-bold text-green-400">
                  ${wallet.first_trade_amount?.toLocaleString() || '0'}
                </p>
              </div>
            </div>
          </div>
        ))}

        {wallets.length === 0 && (
          <div className="bg-gray-800 rounded-lg p-12 border border-gray-700 text-center">
            <Wallet className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No wallets tracked yet</p>
            <p className="text-gray-500 text-sm mt-2">
              Wallets will appear here once the monitor detects activity
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletList;
