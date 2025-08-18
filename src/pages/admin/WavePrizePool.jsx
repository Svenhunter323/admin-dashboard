import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { readContract } from '@wagmi/core';
import { parseEther } from 'viem';
import { toast } from 'react-hot-toast';
import Header from '../../components/Header';
import ContractStatusCard from '../../components/admin/ContractStatusCard';
import OwnerActions from '../../components/admin/OwnerActions';
import Table from '../../components/Table';
import { wavePrizePoolConfig } from '../../lib/contracts/wavePrizePool';
import { config } from "../../config.jsx";
import { 
  CurrencyDollarIcon, 
  TrophyIcon,
  PlusIcon,
  MinusIcon,
  ChartBarIcon,
  UserGroupIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

export default function WavePrizePool() {
  const chainId = config.chains[0].id;
  const { address, isConnected } = useAccount();
  const [loading, setLoading] = useState({});
  const [activeTab, setActiveTab] = useState('overview');
  const [pools, setPools] = useState([]);
  const [depositAmount, setDepositAmount] = useState('');
  const [prizeAmount, setPrizeAmount] = useState('');
  const [poolForm, setPoolForm] = useState({
    baseToken: '',
    burnFee: '',
    treasuryFee: '',
    limitAmount: '',
    ticketPrice: '',
    poolType: true // true for daily, false for weekly
  });
  
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

  const { data: poolIds } = useReadContract({
    ...wavePrizePoolConfig,
    functionName: 'getAllPoolIds',
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

  const { data: treasury } = useReadContract({
    ...wavePrizePoolConfig,
    functionName: 'treasury',
  });

  const isOwner = address && owner && address.toLowerCase() === owner.toLowerCase();

  // Set default base token from environment variable
  useEffect(() => {
    if (import.meta.env.BASE_TOKEN && !poolForm.baseToken) {
      setPoolForm(prev => ({ ...prev, baseToken: import.meta.env.BASE_TOKEN }));
    }
  }, []);

  // Fetch pools data
  useEffect(() => {
    const fetchPools = async () => {
      if (!poolIds || poolIds.length === 0) return;
      
      const poolsData = [];
      for (const poolId of poolIds) {
        try {
          const poolState = await readContract(config, {
            ...wavePrizePoolConfig,
            functionName: 'getPoolState',
            args: [poolId],
            chainId: chainId
          });
          
          poolsData.push({
            poolId,
            totalXpAmount: poolState[0],
            users: poolState[1],
            winner: poolState[2],
            isActive: poolState[2].user === '0x0000000000000000000000000000000000000000'
          });
        } catch (error) {
          console.error('Error fetching pool state:', error);
        }
      }
      setPools(poolsData);
    };

    fetchPools();
  }, [poolIds]);

  useEffect(() => {
    if (isSuccess) {
      toast.success('Transaction completed successfully!');
      setLoading({});
      setDepositAmount('');
      setPrizeAmount('');
      setPoolForm({
        baseToken: '',
        burnFee: '',
        treasuryFee: '',
        limitAmount: '',
        ticketPrice: '',
        poolType: true
      });
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

  const handleCreatePool = async () => {
    const { baseToken, burnFee, treasuryFee, limitAmount, ticketPrice, poolType } = poolForm;
    
    if (!baseToken || !burnFee || !treasuryFee || !ticketPrice) {
      toast.error('Please fill all required pool creation fields');
      return;
    }

    if (parseInt(burnFee) + parseInt(treasuryFee) > 100) {
      toast.error('Total fees cannot exceed 100%');
      return;
    }

    try {
      setLoading(prev => ({ ...prev, createPool: true }));
      writeContract({
        ...wavePrizePoolConfig,
        functionName: 'createPool',
        args: [
          baseToken,
          parseInt(burnFee),
          parseInt(treasuryFee),
          limitAmount ? parseEther(limitAmount) : 0,
          parseEther(ticketPrice),
          poolType
        ],
      });
    } catch (error) {
      toast.error('Failed to create pool');
      setLoading(prev => ({ ...prev, createPool: false }));
    }
  };

  const handleDrawWinner = async (poolId) => {
    try {
      setLoading(prev => ({ ...prev, [`draw_${poolId}`]: true }));
      writeContract({
        ...wavePrizePoolConfig,
        functionName: 'drawWinner',
        args: [poolId],
      });
    } catch (error) {
      toast.error('Failed to draw winner');
      setLoading(prev => ({ ...prev, [`draw_${poolId}`]: false }));
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

  const poolColumns = [
    {
      key: 'poolId',
      label: 'Pool ID',
      render: (value) => (
        <span className="font-mono text-xs text-gray-600 dark:text-gray-400">
          {value.slice(0, 8)}...{value.slice(-6)}
        </span>
      ),
    },
    {
      key: 'totalXpAmount',
      label: 'Total XP',
      render: (value) => `${(Number(value) / 1e18).toFixed(2)} XP`,
    },
    {
      key: 'users',
      label: 'Participants',
      render: (value) => value.length,
    },
    {
      key: 'winner',
      label: 'Winner',
      render: (value) => (
        value.user !== '0x0000000000000000000000000000000000000000' ? (
          <span className="font-mono text-xs text-green-600 dark:text-green-400">
            {value.user.slice(0, 6)}...{value.user.slice(-4)}
          </span>
        ) : (
          <span className="text-gray-400 text-sm">Not drawn</span>
        )
      ),
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (value) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            value
              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
          }`}
        >
          {value ? 'Active' : 'Completed'}
        </span>
      ),
    },
  ];

  const poolActions = (pool) => (
    pool.isActive && isOwner ? (
      <button
        onClick={() => handleDrawWinner(pool.poolId)}
        disabled={loading[`draw_${pool.poolId}`] || isPending || isConfirming}
        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:hover:bg-yellow-900/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <TrophyIcon className="w-4 h-4 mr-1" />
        {loading[`draw_${pool.poolId}`] ? 'Drawing...' : 'Draw Winner'}
      </button>
    ) : null
  );

  const stats = {
    totalPools: pools.length,
    activePools: pools.filter(p => p.isActive).length,
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
              Manage prize pools, participants, and smart contract operations
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="mb-6">
            <nav className="flex space-x-8">
              {[
                { id: 'overview', name: 'Overview', icon: ChartBarIcon },
                { id: 'pools', name: 'Prize Pools', icon: TrophyIcon },
                { id: 'create', name: 'Create Pool', icon: PlusIcon },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <tab.icon className="w-5 h-5 mr-2" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                    Contract Information
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex items-center">
                        <CurrencyDollarIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Treasury</span>
                      </div>
                      <span className="text-sm font-bold text-blue-600 dark:text-blue-400 font-mono">
                        {treasury?.slice(0, 6)}...{treasury?.slice(-4)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="flex items-center">
                        <TrophyIcon className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Total Pools</span>
                      </div>
                      <span className="text-sm font-bold text-green-600 dark:text-green-400">
                        {stats.totalPools}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <div className="flex items-center">
                        <ClockIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Active Pools</span>
                      </div>
                      <span className="text-sm font-bold text-yellow-600 dark:text-yellow-400">
                        {stats.activePools}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

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
            </div>
          )}

          {/* Pools Tab */}
          {activeTab === 'pools' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Prize Pools ({pools.length})
                </h3>
                <Table columns={poolColumns} data={pools} actions={poolActions} />
              </div>
            </div>
          )}

          {/* Create Pool Tab */}
          {activeTab === 'create' && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  Create New Prize Pool
                </h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Base Token Address *
                    </label>
                    <input
                      type="text"
                      value={poolForm.baseToken}
                      onChange={(e) => setPoolForm(prev => ({ ...prev, baseToken: e.target.value }))}
                      placeholder="0x..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Burn Fee (%) *
                      </label>
                      <input
                        type="number"
                        value={poolForm.burnFee}
                        onChange={(e) => setPoolForm(prev => ({ ...prev, burnFee: e.target.value }))}
                        placeholder="5"
                        min="0"
                        max="100"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Treasury Fee (%) *
                      </label>
                      <input
                        type="number"
                        value={poolForm.treasuryFee}
                        onChange={(e) => setPoolForm(prev => ({ ...prev, treasuryFee: e.target.value }))}
                        placeholder="5"
                        min="0"
                        max="100"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Limit Amount (XP)
                      </label>
                      <input
                        type="number"
                        value={poolForm.limitAmount}
                        onChange={(e) => setPoolForm(prev => ({ ...prev, limitAmount: e.target.value }))}
                        placeholder="0 (no limit)"
                        step="0.1"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Ticket Price (XP) *
                      </label>
                      <input
                        type="number"
                        value={poolForm.ticketPrice}
                        onChange={(e) => setPoolForm(prev => ({ ...prev, ticketPrice: e.target.value }))}
                        placeholder="10.0"
                        step="0.1"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Pool Type
                    </label>
                    <div className="flex space-x-4">
                      <button
                        onClick={() => setPoolForm(prev => ({ ...prev, poolType: true }))}
                        className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                          poolForm.poolType
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300'
                        }`}
                      >
                        Daily Pool
                      </button>
                      <button
                        onClick={() => setPoolForm(prev => ({ ...prev, poolType: false }))}
                        className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                          !poolForm.poolType
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300'
                        }`}
                      >
                        Weekly Pool
                      </button>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={handleCreatePool}
                      disabled={loading.createPool || isPending || isConfirming || !isOwner}
                      className="w-full flex items-center justify-center px-4 py-3 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <PlusIcon className="w-5 h-5 mr-2" />
                      {loading.createPool ? 'Creating Pool...' : 'Create Prize Pool'}
                    </button>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                      * Required fields. Total fees (burn + treasury) cannot exceed 100%.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}