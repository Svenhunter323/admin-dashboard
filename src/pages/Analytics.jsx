import { useState, useEffect } from 'react';
import { adminAPI } from '../api';
import { useSocket } from '../hooks/useSocket';
import Header from '../components/Header';
import ChartBlock from '../components/ChartBlock';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function Analytics() {
  const [analyticsData, setAnalyticsData] = useState({
    dailyStats: [],
    gameTypes: [],
    userGrowth: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const response = await adminAPI.getStats();
      // Mock analytics data - replace with real API data
      setAnalyticsData({
        dailyStats: [
          { date: '2024-01-01', bets: 120, volume: 15000, users: 45 },
          { date: '2024-01-02', bets: 150, volume: 18000, users: 52 },
          { date: '2024-01-03', bets: 180, volume: 22000, users: 48 },
          { date: '2024-01-04', bets: 200, volume: 25000, users: 65 },
          { date: '2024-01-05', bets: 175, volume: 21000, users: 58 },
          { date: '2024-01-06', bets: 220, volume: 28000, users: 72 },
          { date: '2024-01-07', bets: 195, volume: 24000, users: 61 },
        ],
        gameTypes: [
          // { name: 'Coin Flip', value: 45, count: 450 },
          { name: 'Prize Pool', value: 36, count: 150 },
          { name: 'Coin Flip', value: 64, count: 300 },
          // { name: 'Blackjack', value: 10, count: 100 },
        ],
        userGrowth: [
          { month: 'Jan', users: 100 },
          { month: 'Feb', users: 150 },
          { month: 'Mar', users: 200 },
          { month: 'Apr', users: 280 },
          { month: 'May', users: 350 },
          { month: 'Jun', users: 420 },
        ],
      });
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // Refresh analytics when users are updated
  useSocket('users_updated', fetchAnalytics);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header />
      
      <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Real-time insights and historical trends
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <ChartBlock title="Daily Betting Volume">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analyticsData.dailyStats}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    className="text-gray-600 dark:text-gray-400"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    className="text-gray-600 dark:text-gray-400"
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgb(31 41 55)',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="volume" 
                    stroke="#3B82F6" 
                    strokeWidth={3}
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartBlock>

            <ChartBlock title="Daily Active Users">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData.dailyStats}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    className="text-gray-600 dark:text-gray-400"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    className="text-gray-600 dark:text-gray-400"
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgb(31 41 55)',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white'
                    }}
                  />
                  <Bar dataKey="users" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartBlock>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartBlock title="Game Type Distribution">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analyticsData.gameTypes}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analyticsData.gameTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgb(31 41 55)',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartBlock>

            <ChartBlock title="User Growth Trend">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analyticsData.userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12 }}
                    className="text-gray-600 dark:text-gray-400"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    className="text-gray-600 dark:text-gray-400"
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgb(31 41 55)',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="users" 
                    stroke="#8B5CF6" 
                    strokeWidth={3}
                    dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartBlock>
          </div>

          <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Live Trending Stats
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">24</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Users</p>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">156</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Bets Today</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">98.5%</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Win Rate</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}