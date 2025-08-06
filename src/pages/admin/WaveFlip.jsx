import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { toast } from 'react-hot-toast';
import Header from '../../components/Header';
import ContractStatusCard from '../../components/admin/ContractStatusCard';
import OwnerActions from '../../components/admin/OwnerActions';
import { waveFlipConfig } from '../../lib/contracts/waveFlip';
import { 
  CurrencyDollarIcon, 
  ChartBarIcon,
  CogIcon 
} from '@heroicons/react/24/outline';

export default function WaveFlip() {
  const { address, isConnected } = useAccount();
  const [loading, setLoading] = useState({});
  const [payoutRate, setPayoutRate] = useState('');
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // Contract reads
  const { data: owner } = useReadContract({
    ...waveFlipConfig,
    functionName: 'owner',
  });

  const { data: isPaused } = useReadContract({
    ...waveFlipConfig,
    functionName: 'paused',
  });

  const { data: gameStats } = useReadContract({
    ...waveFlipConfig,
    functionName: 'getGameStats',
  });

  const { data: xpBalance } = useReadContract({
    ...waveFlipConfig,
    functionName: 'getXPBalance',
  });

  const { data: currentPayoutRate } = useReadContract({
    ...waveFlipConfig,
    functionName: 'payoutRate',
  });

  const isOwner = address && owner && address.toLowerCase() === owner.toLowerCase();

  useEffect(() => {
    if (isSuccess) {
      toast.success('Transaction completed successfully!');
      setLoading({});
    }
  }, [isSuccess]);

  useEffect(() => {
    if (currentPayoutRate) {
      setPayoutRate(currentPayoutRate.toString());
    }
  }, [currentPayoutRate]);

  const handlePause = async () => {
    try {
      setLoading(prev => ({ ...prev, pause: true }));
      writeContract({
        ...waveFlipConfig,
        functionName: 'pause',
      });
    } catch (error) {
      toast.error('Failed to pause contract');
      setLoading(prev => ({ ...prev, pause: false }));
    }
  };

  const handleUnpause = async () => {
    try {
      setLoading(prev => ({ ...prev, pause: true }));
      writeContract({
        ...waveFlipConfig,
        functionName: 'unpause',
      });
    } catch (error) {
      toast.error('Failed to unpause contract');
      setLoading(prev => ({ ...prev, pause: false }));
    }
  };

  const handleWithdrawXP = async () => {
    try {
      setLoading(prev => ({ ...prev, withdraw: true }));
      writeContract({
        ...waveFlipConfig,
        functionName: 'withdrawXP',
      });
    } catch (error) {
      toast.error('Failed to withdraw XP');
      setLoading(prev => ({ ...prev, withdraw: false }));
    }
  };

  const handleUpdatePayoutRate = async () => {
    if (!payoutRate || isNaN(payoutRate)) {
      toast.error('Please enter a valid payout rate');
      return;
    }

    try {
      setLoading(prev => ({ ...prev, config: true }));
      writeContract({
        ...waveFlipConfig,
        functionName: 'setPayoutRate',
        args: [BigInt(payoutRate)],
      });
    } catch (error) {
      toast.error('Failed to update payout rate');
      setLoading(prev => ({ ...prev, config: false }));
    }
  };

  const stats = {
    totalGames: gameStats?.[0] || 0,
    totalVolume: gameStats?.[1] || 0,
    xpBalance: xpBalance || 0,
    payoutRate: currentPayoutRate || 0,
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header />
      
      <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Wave Flip Admin
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage the Wave Flip smart contract
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <ContractStatusCard
              contractName="Wave Flip"
              isPaused={isPaused}
              isOwner={isOwner}
              isConnected={isConnected}
              loading={isPending || isConfirming}
              stats={stats}
            />

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Contract Balance
              </h3>
              <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center">
                  <CurrencyDollarIcon className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3" />
                  <span className="font-medium text-gray-900 dark:text-white">XP Balance</span>
                </div>
                <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.xpBalance.toString()}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <OwnerActions
              isOwner={isOwner}
              isPaused={isPaused}
              onPause={handlePause}
              onUnpause={handleUnpause}
              onWithdraw={handleWithdrawXP}
              loading={{ 
                pause: loading.pause || isPending || isConfirming,
                withdraw: loading.withdraw || isPending || isConfirming 
              }}
            >
              <div className="space-y-4">
                <h4 className="text-md font-semibold text-gray-900 dark:text-white">
                  Game Configuration
                </h4>
                <div className="flex space-x-3">
                  <input
                    type="number"
                    value={payoutRate}
                    onChange={(e) => setPayoutRate(e.target.value)}
                    placeholder="Payout Rate (e.g., 195 for 1.95x)"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleUpdatePayoutRate}
                    disabled={loading.config || isPending || isConfirming}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading.config ? 'Updating...' : 'Update'}
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Current payout rate: {stats.payoutRate.toString()}% (e.g., 195 = 1.95x multiplier)
                </p>
              </div>
            </OwnerActions>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Game Statistics
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Games</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {stats.totalGames.toString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Volume</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {stats.totalVolume.toString()} XP
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Payout Multiplier</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {(Number(stats.payoutRate) / 100).toFixed(2)}x
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Contract Status</span>
                  <span className={`text-sm font-medium ${isPaused ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                    {isPaused ? 'Paused' : 'Active'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}