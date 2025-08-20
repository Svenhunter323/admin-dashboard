import { useState, useEffect, useCallback } from 'react';
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
    dailyStats: [],   // [{ date:'YYYY-MM-DD', bets, volume, users }]
    gameTypes: [],    // [{ name, value, count }]
    userGrowth: [],   // [{ month:'Jan', users }]
    live: {           // optional live KPIs
      activeUsers: 0,
      betsToday: 0,
      winRate: 0,
    },
  });
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async (days = 7) => {
    try {
      setLoading(true);
      // If you added adminAPI.getAnalytics, you can call that instead:
      // const res = await adminAPI.getAnalytics(days);
      // const res = await adminAPI.get('/analytics', { params: { days } });
      const res = await adminAPI.getAnalytics('/api/admin/analytics', { params: { day: days } });
      // Be defensive about shape
      const data = res?.data || {};
      setAnalyticsData({
        dailyStats: Array.isArray(data.dailyStats) ? data.dailyStats : [],
        gameTypes: Array.isArray(data.gameTypes) ? data.gameTypes : [],
        userGrowth: Array.isArray(data.userGrowth) ? data.userGrowth : [],
        live: {
          activeUsers: Number(data?.live?.activeUsers ?? 0),
          betsToday: Number(data?.live?.betsToday ?? 0),
          winRate: Number(data?.live?.winRate ?? 0),
        },
      });
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchAnalytics(7);
  }, [fetchAnalytics]);

  // Live updates from backend (debounced + pushed by server)
  useSocket('analytics_updated', (payload) => {
    // payload shape matches GET /analytics response
    setAnalyticsData({
      dailyStats: Array.isArray(payload?.dailyStats) ? payload.dailyStats : [],
      gameTypes: Array.isArray(payload?.gameTypes) ? payload.gameTypes : [],
      userGrowth: Array.isArray(payload?.userGrowth) ? payload.userGrowth : [],
      live: {
        activeUsers: Number(payload?.live?.activeUsers ?? 0),
        betsToday: Number(payload?.live?.betsToday ?? 0),
        winRate: Number(payload?.live?.winRate ?? 0),
      },
    });
  });

  // Fallback: if other admin events happen, you can refresh on those too
  useSocket('users_updated', () => fetchAnalytics(7));
  useSocket('bet_placed',   () => fetchAnalytics(7)); // optional if you prefer pull over push
  useSocket('liveHistory',  () => fetchAnalytics(7)); // optional

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const live = analyticsData.live || {};
  const activeUsers = Number(live.activeUsers ?? 0);
  const betsToday   = Number(live.betsToday ?? 0);
  const winRate     = Number(live.winRate ?? 0);

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
                  {/* Backend should return `users` in dailyStats; defaults to 0 otherwise */}
                  <Bar dataKey={(row) => Number(row.users ?? 0)} fill="#10B981" radius={[4, 4, 0, 0]} />
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
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {activeUsers.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Users</p>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {betsToday.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Bets Today</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {Number.isFinite(winRate) ? `${winRate}%` : '0%'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Win Rate</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
