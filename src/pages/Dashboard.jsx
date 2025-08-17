import { useState, useEffect, use } from 'react';
import { adminAPI } from '../api';
import { useSocket } from '../hooks/useSocket';
import VRFMonitor from '../components/admin/VRFMonitor';
import KPIBlock from '../components/KPIBlock';
import Header from '../components/Header';
import {
  UsersIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  CubeTransparentIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBets: 0,
    totalVolume: 0,
    bannedUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const response = await adminAPI.getStats();
      // console.log('Fetched stats:', response.data);
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Refresh stats when new data comes in
  useSocket('users_updated', fetchStats);
  useSocket('bet_placed', fetchStats);

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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Monitor your platform's key metrics and performance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <KPIBlock
              title="Total Users"
              value={stats.totalUsers}
              icon={UsersIcon}
              color="blue"
              trend={12}
            />
            <KPIBlock
              title="Total Bets"
              value={stats.totalBets}
              icon={CurrencyDollarIcon}
              color="green"
              trend={8}
            />
            <KPIBlock
              title="Total Volume"
              value={`${stats.totalVolume/1e18} XP`}
              icon={ChartBarIcon}
              color="yellow"
              trend={-3}
            />
            <KPIBlock
              title="Banned Users"
              value={stats.bannedUsers}
              icon={ExclamationTriangleIcon}
              color="red"
            />
          </div>

          <div className="mb-8">
            <VRFMonitor />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Recent Activity
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">New user registered</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">2 minutes ago</p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                    User
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 ">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">High volume bet placed</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">5 minutes ago</p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                    Bet
                  </span>
                </div>
                {/* <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">User banned for violation</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">10 minutes ago</p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                    Moderation
                  </span>
                </div> */}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                System Status
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">API Status</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                    Online
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Database</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                    Connected
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Socket.IO</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                    Connected
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Uptime</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">99.9%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}