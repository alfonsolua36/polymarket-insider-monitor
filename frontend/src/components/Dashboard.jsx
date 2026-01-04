import React, { useEffect, useState } from 'react';
import { Bell, TrendingUp, Wallet, DollarSign } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = ({ alerts }) => {
  const [stats, setStats] = useState({
    totalAlerts: 0,
    activeWallets: 0,
    totalVolume: 0,
    alertsToday: 0
  });

  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    loadStats();
    loadChartData();
  }, [alerts]);

  const loadStats = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const alertsToday = alerts.filter(a => 
      new Date(a.timestamp) >= today
    ).length;

    const uniqueWallets = new Set(alerts.map(a => a.wallet)).size;
    
    const totalVolume = alerts.reduce((sum, a) => sum + (a.amount || 0), 0);

    setStats({
      totalAlerts: alerts.length,
      activeWallets: uniqueWallets,
      totalVolume,
      alertsToday
    });
  };

  const loadChartData = () => {
    const hourlyData = {};
    const now = Date.now();
    
    for (let i = 23; i >= 0; i--) {
      const hour = new Date(now - i * 60 * 60 * 1000);
      const key = hour.getHours();
      hourlyData[key] = { hour: `${key}:00`, count: 0 };
    }

    alerts.forEach(alert => {
      const alertTime = new Date(alert.timestamp);
      const hoursDiff = Math.floor((now - alertTime.getTime()) / (1000 * 60 * 60));
      if (hoursDiff < 24) {
        const hour = alertTime.getHours();
        if (hourlyData[hour]) {
          hourlyData[hour].count++;
        }
      }
    });

    setChartData(Object.values(hourlyData));
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-400 text-sm font-medium">{title}</h3>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Alerts"
          value={stats.totalAlerts}
          icon={Bell}
          color="text-red-400"
        />
        <StatCard
          title="Alerts Today"
          value={stats.alertsToday}
          icon={TrendingUp}
          color="text-green-400"
        />
        <StatCard
          title="Active Wallets"
          value={stats.activeWallets}
          icon={Wallet}
          color="text-blue-400"
        />
        <StatCard
          title="Total Volume"
          value={`$${(stats.totalVolume / 1000).toFixed(0)}K`}
          icon={DollarSign}
          color="text-yellow-400"
        />
      </div>

      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-bold mb-4">Alert Activity (24h)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="hour" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px'
              }}
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-bold mb-4">Recent Alerts</h2>
        <div className="space-y-3">
          {alerts.slice(0, 5).map((alert, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-4 bg-gray-900 rounded-lg border border-gray-700"
            >
              <div className="flex items-center gap-4">
                <div className={`w-2 h-2 rounded-full ${
                  alert.type === 'NEW_WALLET_LARGE_BET' ? 'bg-green-400' :
                  alert.type === 'RAPID_ACCUMULATION' ? 'bg-yellow-400' :
                  'bg-blue-400'
                }`} />
                <div>
                  <p className="font-semibold">{alert.type.replace(/_/g, ' ')}</p>
                  <p className="text-sm text-gray-400">{alert.market || 'N/A'}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-400">
                  ${alert.amount?.toLocaleString() || 'N/A'}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          {alerts.length === 0 && (
            <p className="text-center text-gray-400 py-8">
              No alerts yet. Monitoring in progress...
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
