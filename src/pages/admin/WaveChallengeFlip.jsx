import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { toast } from 'react-hot-toast';
import Header from '../../components/Header';
import ContractStatusCard from '../../components/admin/ContractStatusCard';
import OwnerActions from '../../components/admin/OwnerActions';
import { waveChallengeFlipConfig } from '../../lib/contracts/waveChallengeFlip';
import { 
  CurrencyDollarIcon, 
  LinkIcon, 
  ArrowPathIcon,
  ChartBarIcon 
} from '@heroicons/react/24/outline';

export default function WaveChallengeFlip() {
  const { address, isConnected } = useAccount();
  const [loading, setLoading] = useState({});
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // Contract reads
  const { data: owner } = useReadContract({
    ...waveChallengeFlipConfig,
    functionName: 'owner',
  });

  const { data: isPaused } = useReadContract({
    ...waveChallengeFlipConfig,
    functionName: 'paused',
  });

  const { data: gameStats } = useReadContract({
    ...waveChallengeFlipConfig,
    functionName: 'getGameStats',
  });

  const { data: xpBalance } = useReadContract({
    ...waveChallengeFlipConfig,
    functionName: 'getXPBalance',
  });

  const { data: linkBalance } = useReadContract({
    ...waveChallengeFlipConfig,
    functionName: 'getLinkBalance',
  });

  const isOwner = address && owner && address.toLowerCase() === owner.toLowerCase();

  useEffect(() => {
    if (isSuccess) {
      toast.success('Transaction completed successfully!');
      setLoading({});
    }
  }, [isSuccess]);

  const handlePause = async () => {
    try {
      setLoading(prev => ({ ...prev, pause: true }));
      writeContract({
        ...waveChallengeFlipConfig,
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
        ...waveChallengeFlipConfig,
        functionName: 'unpause',
      });
    } catch (error) {
      toast.error('Failed to unpause contract');
      setLoading(prev => ({ ...prev, pause: false }));
    }
  };

  const handleWithdrawXP = async () => {
    try {
      setLoading(prev => ({ ...prev, withdrawXP: true }));
      writeContract({
        ...waveChallengeFlipConfig,
        functionName: 'withdrawXP',
      });
    } catch (error) {
      toast.error('Failed to withdraw XP');
      setLoading(prev => ({ ...prev, withdrawXP: false }));
    }
  };

  const handleWithdrawLink = async () => {
    try {
      setLoading(prev => ({ ...prev, withdrawLink: true }));
      writeContract({
        ...waveChallengeFlipConfig,
        functionName: 'withdrawLink',
      });
    } catch (error) {
      toast.error('Failed to withdraw LINK');
      setLoading(prev => ({ ...prev, withdrawLink: false }));
    }
  };

  const handleTriggerFallback = async () => {
    try {
      setLoading(prev => ({ ...prev, fallback: true }));
      writeContract({
        ...waveChallengeFlipConfig,
        functionName: 'triggerFallbackRandomness',
      });
    } catch (error) {
      toast.error('Failed to trigger fallback randomness');
      setLoading(prev => ({ ...prev, fallback: false }));
    }
  };

  const stats = {
    totalGames: gameStats?.[0] || 0,
    totalVolume: gameStats?.[1] || 0,
    xpBalance: xpBalance || 0,
    linkBalance: linkBalance || 0,
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header />
      
      <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Wave Challenge Flip Admin
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage the Wave Challenge Flip smart contract
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <ContractStatusCard
              contractName="Wave Challenge Flip"
              isPaused={isPaused}
              isOwner={isOwner}
              isConnected={isConnected}
              loading={isPending || isConfirming}
              stats={stats}
            />

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Contract Balances
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center">
                    <CurrencyDollarIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">XP Balance</span>
                  </div>
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                    {stats.xpBalance.toString()}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div className="flex items-center">
                    <LinkIcon className="w-5 h-5 text-orange-600 dark:text-orange-400 mr-2" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">LINK Balance</span>
                  </div>
                  <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                    {stats.linkBalance.toString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <OwnerActions
              isOwner={isOwner}
              isPaused={isPaused}
              onPause={handlePause}
              onUnpause={handleUnpause}
              loading={{ pause: loading.pause || isPending || isConfirming }}
            >
              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={handleWithdrawXP}
                  disabled={loading.withdrawXP || isPending || isConfirming}
                  className="flex items-center justify-center px-4 py-3 rounded-lg font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CurrencyDollarIcon className="w-5 h-5 mr-2" />
                  {loading.withdrawXP ? 'Processing...' : 'Withdraw XP'}
                </button>
                
                <button
                  onClick={handleWithdrawLink}
                  disabled={loading.withdrawLink || isPending || isConfirming}
                  className="flex items-center justify-center px-4 py-3 rounded-lg font-medium bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:hover:bg-orange-900/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <LinkIcon className="w-5 h-5 mr-2" />
                  {loading.withdrawLink ? 'Processing...' : 'Withdraw LINK'}
                </button>
                
                <button
                  onClick={handleTriggerFallback}
                  disabled={loading.fallback || isPending || isConfirming}
                  className="flex items-center justify-center px-4 py-3 rounded-lg font-medium bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowPathIcon className="w-5 h-5 mr-2" />
                  {loading.fallback ? 'Processing...' : 'Trigger Fallback Randomness'}
                </button>
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