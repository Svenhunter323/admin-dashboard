import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { toast } from 'react-hot-toast';
import Header from '../../components/Header';
import ContractStatusCard from '../../components/admin/ContractStatusCard';
import OwnerActions from '../../components/admin/OwnerActions';
import { wavePrizePoolConfig } from '../../lib/contracts/wavePrizePool';
import { 
  CurrencyDollarIcon, 
  TrophyIcon,
  PlusIcon,
  MinusIcon 
} from '@heroicons/react/24/outline';

export default function WavePrizePool() {
  const { address, isConnected } = useAccount();
  const [loading, setLoading] = useState({});
  const [depositAmount, setDepositAmount] = useState('');
  const [prizeAmount, setPrizeAmount] = useState('');
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // Contract reads
  const { data: owner } = useReadContract({
    ...wavePrizePoolConfig,
    functionName: 'owner',
  });

  const { data: isPaused } = useReadContract({
    ...wavePrizePoolConfig,
    functionName: 'paused',
  });

  const { data: poolStats } = useReadContract({
    ...wavePrizePoolConfig,
    functionName: 'getPoolStats',
  });

  const { data: currentPrize } = useReadContract({
    ...wavePrizePoolConfig,
    functionName: 'currentPrizeAmount',
  });

  const { data: totalDeposits } = useReadContract({
    ...wavePrizePoolConfig,
    functionName: 'totalDeposits',
  });

  const { data: totalWithdrawn } = useReadContract({
    ...wavePrizePoolConfig,
    functionName: 'totalWithdrawn',
  });

  const isOwner = address && owner && address.toLowerCase() === owner.toLowerCase();

  useEffect(() => {
    if (isSuccess) {
      toast.success('Transaction completed successfully!');
      setLoading({});
      setDepositAmount('');
      setPrizeAmount('');
    }
  }, [isSuccess]);

  const handlePause = async () => {
    try {
      setLoading(prev => ({ ...prev, pause: true }));
      writeContract({
        ...wavePrizePoolConfig,
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
        ...wavePrizePoolConfig,
        functionName: 'unpause',
      });
    } catch (error) {
      toast.error('Failed to unpause contract');
      setLoading(prev => ({ ...prev, pause: false }));
    }
  };

  const handleWithdraw = async () => {
    try {
      setLoading(prev => ({ ...prev, withdraw: true }));
      writeContract({
        ...wavePrizePoolConfig,
        functionName: 'withdrawPrizePool',
      });
    } catch (error) {
      toast.error('Failed to withdraw prize pool');
      setLoading(prev => ({ ...prev, withdraw: false }));
    }
  };

  const handleDepositXP = async () => {
    if (!depositAmount || isNaN(depositAmount) || Number(depositAmount) <= 0) {
      toast.error('Please enter a valid deposit amount');
      return;
    }

    try {
      setLoading(prev => ({ ...prev, deposit: true }));
      writeContract({
        ...wavePrizePoolConfig,
        functionName: 'depositXP',
        args: [parseEther(depositAmount)],
      });
    } catch (error) {
      toast.error('Failed to deposit XP');
      setLoading(prev => ({ ...prev, deposit: false }));
    }
  };

  const handleSetPrizeAmount = async () => {
    if (!prizeAmount || isNaN(prizeAmount) || Number(prizeAmount) <= 0) {
      toast.error('Please enter a valid prize amount');
      return;
    }

    try {
      setLoading(prev => ({ ...prev, config: true }));
      writeContract({
        ...wavePrizePoolConfig,
        functionName: 'setPrizeAmount',
        args: [parseEther(prizeAmount)],
      });
    } catch (error) {
      toast.error('Failed to set prize amount');
      setLoading(prev => ({ ...prev, config: false }));
    }
  };

  const stats = {
    currentPrize: currentPrize || 0,
    totalDeposits: totalDeposits || 0,
    totalWithdrawn: totalWithdrawn || 0,
    poolBalance: (totalDeposits || 0) - (totalWithdrawn || 0),
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header />
      
      <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Wave Prize Pool Admin
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage the Wave Prize Pool smart contract
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <ContractStatusCard
              contractName="Wave Prize Pool"
              isPaused={isPaused}
              isOwner={isOwner}
              isConnected={isConnected}
              loading={isPending || isConfirming}
              stats={stats}
            />

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Prize Pool Overview
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="flex items-center">
                    <TrophyIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Current Prize</span>
                  </div>
                  <span className="text-sm font-bold text-yellow-600 dark:text-yellow-400">
                    {stats.currentPrize.toString()} XP
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center">
                    <PlusIcon className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Total Deposits</span>
                  </div>
                  <span className="text-sm font-bold text-green-600 dark:text-green-400">
                    {stats.totalDeposits.toString()} XP
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="flex items-center">
                    <MinusIcon className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Total Withdrawn</span>
                  </div>
                  <span className="text-sm font-bold text-red-600 dark:text-red-400">
                    {stats.totalWithdrawn.toString()} XP
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
              onWithdraw={handleWithdraw}
              loading={{ 
                pause: loading.pause || isPending || isConfirming,
                withdraw: loading.withdraw || isPending || isConfirming 
              }}
            >
              <div className="space-y-4">
                <h4 className="text-md font-semibold text-gray-900 dark:text-white">
                  Pool Management
                </h4>
                
                {/* Deposit XP */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Deposit XP to Pool
                  </label>
                  <div className="flex space-x-3">
                    <input
                      type="number"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      placeholder="Amount in XP"
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleDepositXP}
                      disabled={loading.deposit || isPending || isConfirming}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading.deposit ? 'Depositing...' : 'Deposit'}
                    </button>
                  </div>
                </div>

                {/* Set Prize Amount */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Set Prize Amount
                  </label>
                  <div className="flex space-x-3">
                    <input
                      type="number"
                      value={prizeAmount}
                      onChange={(e) => setPrizeAmount(e.target.value)}
                      placeholder="Prize amount in XP"
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleSetPrizeAmount}
                      disabled={loading.config || isPending || isConfirming}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading.config ? 'Setting...' : 'Set Prize'}
                    </button>
                  </div>
                </div>
              </div>
            </OwnerActions>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Pool Statistics
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Pool Balance</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {stats.poolBalance.toString()} XP
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Current Prize</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {stats.currentPrize.toString()} XP
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Deposits</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {stats.totalDeposits.toString()} XP
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