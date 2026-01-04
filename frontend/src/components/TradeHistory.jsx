import React, { useEffect, useState } from 'react';
import { History, TrendingUp, TrendingDown } from 'lucide-react';
import { api } from '../services/api';
import { formatDistanceToNow } from 'date-fns';

const TradeHistory = () => {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadTrades();
  }, []);

  const loadTrades = async () => {
    try {
      const data = await api.getTrades();
      setTrades(data || []);
    } catch (error) {
      console.error('Error loading trades:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTrades = filter === 'all' 
    ? trades 
    : trades.filter(t => t.side === filter);

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
        <h2 className="text-2xl font-bold">Trade History</h2>
        
        <div className="flex gap-2">
          {['all', 'BUY', 'SELL'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg transition-all ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {f === 'all' ? 'All' : f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900 border-b border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Wallet
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Side
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Market
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredTrades.map((trade, idx) => (
                <tr key={idx} className="hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {formatDistanceToNow(new Date(trade.timestamp), { addSuffix: true })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <code className="text-xs bg-gray-900 px-2 py-1 rounded">
                      {trade.wallet_address.slice(0, 10)}...
                    </code>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      trade.side === 'BUY' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {trade.side === 'BUY' ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {trade.side}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm max-w-xs truncate">
                    {trade.market_title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {trade.size.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    ${trade.price.toFixed(3)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">
                    ${(trade.size * trade.price).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredTrades.length === 0 && (
          <div className="p-12 text-center">
            <History className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No trades found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TradeHistory;
