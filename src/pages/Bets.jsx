import { useState, useEffect } from 'react';
import { adminAPI } from '../api';
import { useSocket } from '../hooks/useSocket';
import Header from '../components/Header';
import Table from '../components/Table';
import { CurrencyDollarIcon, TrophyIcon, XCircleIcon } from '@heroicons/react/24/outline';

export default function Bets() {
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBets = async () => {
    try {
      const response = await adminAPI.getBets();
      setBets(response.data);
    } catch (error) {
      console.error('Failed to fetch bets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBets();
  }, []);

  // Live update on new bets
  useSocket('bet_placed', (newBet) => {
    setBets(prev => [newBet, ...prev.slice(0, 99)]); // Keep only latest 100
  });

  const columns = [
    {
      key: 'username',
      label: 'User',
      render: (value) => (
        <span className="font-medium text-gray-900 dark:text-white">{value}</span>
      ),
    },
    {
      key: 'gameType',
      label: 'Game',
      render: (value) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
          {value}
        </span>
      ),
    },
    {
      key: 'amount',
      label: 'Bet Amount',
      render: (value) => (
        <div className="flex items-center">
          <CurrencyDollarIcon className="w-4 h-4 text-gray-400 mr-1" />
          <span className="font-medium">{value} XP</span>
        </div>
      ),
    },
    {
      key: 'result',
      label: 'Result',
      render: (value, row) => {
        const isWin = value === 'win';
        return (
          <div className="flex items-center">
            {isWin ? (
              <TrophyIcon className="w-4 h-4 text-green-500 mr-1" />
            ) : (
              <XCircleIcon className="w-4 h-4 text-red-500 mr-1" />
            )}
            <span
              className={`font-medium ${
                isWin ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}
            >
              {isWin ? 'Win' : 'Loss'}
            </span>
            {row.payout && (
              <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                (+{row.payout} XP)
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'timestamp',
      label: 'Time',
      render: (value) => (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {new Date(value).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'multiplier',
      label: 'Multiplier',
      render: (value) => value ? `${value}x` : '-',
    },
  ];

  const totalVolume = bets.reduce((sum, bet) => sum + bet.amount, 0);
  const totalWins = bets.filter(bet => bet.result === 'win').length;
  const winRate = bets.length > 0 ? ((totalWins / bets.length) * 100).toFixed(1) : 0;

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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Bet History</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Monitor all betting activity in real-time
            </p>
          </div>

          <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center">
                <CurrencyDollarIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Bets</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{bets.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                  <CurrencyDollarIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Volume</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {totalVolume.toLocaleString()} XP
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center">
                <TrophyIcon className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Wins</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalWins}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 dark:text-purple-400 font-bold text-sm">%</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Win Rate</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{winRate}%</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-4 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Live updates enabled</span>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Showing latest {Math.min(bets.length, 100)} bets
            </span>
          </div>

          <Table columns={columns} data={bets} />
        </div>
      </main>
    </div>
  );
}