import React, { useState } from 'react';
import { Bell, AlertCircle, TrendingUp, Target, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const AlertFeed = ({ alerts }) => {
  const [filter, setFilter] = useState('all');

  const getAlertIcon = (type) => {
    switch (type) {
      case 'NEW_WALLET_LARGE_BET':
        return <Bell className="w-5 h-5 text-green-400" />;
      case 'YOUNG_WALLET_LARGE_BET':
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      case 'RAPID_ACCUMULATION':
        return <TrendingUp className="w-5 h-5 text-red-400" />;
      case 'CONCENTRATED_BET':
        return <Target className="w-5 h-5 text-blue-400" />;
      default:
        return <Bell className="w-5 h-5 text-gray-400" />;
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'NEW_WALLET_LARGE_BET':
        return 'border-green-500 bg-green-500/10';
      case 'YOUNG_WALLET_LARGE_BET':
        return 'border-yellow-500 bg-yellow-500/10';
      case 'RAPID_ACCUMULATION':
        return 'border-red-500 bg-red-500/10';
      case 'CONCENTRATED_BET':
        return 'border-blue-500 bg-blue-500/10';
      default:
        return 'border-gray-500 bg-gray-500/10';
    }
  };

  const filteredAlerts = filter === 'all' 
    ? alerts 
    : alerts.filter(a => a.type === filter);

  const alertTypes = [
    { value: 'all', label: 'All Alerts' },
    { value: 'NEW_WALLET_LARGE_BET', label: 'New Wallet' },
    { value: 'YOUNG_WALLET_LARGE_BET', label: 'Young Wallet' },
    { value: 'RAPID_ACCUMULATION', label: 'Rapid Accumulation' },
    { value: 'CONCENTRATED_BET', label: 'Concentrated Bet' }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-2 border border-gray-700">
        <div className="flex flex-wrap gap-2">
          {alertTypes.map(type => (
            <button
              key={type.value}
              onClick={() => setFilter(type.value)}
              className={`px-4 py-2 rounded-lg transition-all ${
                filter === type.value
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-gray-700'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredAlerts.map((alert, idx) => (
          <div
            key={idx}
            className={`border-l-4 rounded-lg p-6 ${getAlertColor(alert.type)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className="mt-1">
                  {getAlertIcon(alert.type)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold">
                      {alert.type.replace(/_/g, ' ')}
                    </h3>
                    <span className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    {alert.amount && (
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Amount</p>
                        <p className="text-xl font-bold text-green-400">
                          ${alert.amount.toLocaleString()}
                        </p>
                      </div>
                    )}
                    
                    {alert.market && (
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Market</p>
                        <p className="font-medium">{alert.market}</p>
                      </div>
                    )}
                    
                    {alert.side && (
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Side</p>
                        <p className={`font-medium ${
                          alert.side === 'BUY' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {alert.side}
                        </p>
                      </div>
                    )}
                    
                    {alert.walletAgeDays && (
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Wallet Age</p>
                        <p className="font-medium">{alert.walletAgeDays} days</p>
                      </div>
                    )}
                    
                    {alert.concentration && (
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Concentration</p>
                        <p className="font-medium">{alert.concentration}</p>
                      </div>
                    )}
                    
                    {alert.tradeCount && (
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Trade Count</p>
                        <p className="font-medium">{alert.tradeCount}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-gray-400">Wallet:</p>
                    <code className="text-xs bg-gray-900 px-2 py-1 rounded">
                      {alert.wallet}
                    </code>
                    
                      href={`https://polygonscan.com/address/${alert.wallet}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {filteredAlerts.length === 0 && (
          <div className="bg-gray-800 rounded-lg p-12 border border-gray-700 text-center">
            <Bell className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No alerts found</p>
            <p className="text-gray-500 text-sm mt-2">
              Monitoring is active. Alerts will appear here when detected.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertFeed;
