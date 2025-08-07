import { useLinkBalance } from '../../hooks/useLinkBalance';
import { LinkIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

export default function VRFMonitor() {
  const { balance, loading, error, refetch } = useLinkBalance();

  const handleRefresh = () => {
    refetch();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg mr-3">
            <LinkIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              VRF Contract LINK Balance
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Chainlink VRF Consumer Balance
            </p>
          </div>
        </div>
        
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
          title="Refresh balance"
        >
          <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">Loading...</span>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="text-red-600 dark:text-red-400 mb-2">
              <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Error loading balance
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{error}</p>
            <button
              onClick={handleRefresh}
              className="mt-2 text-sm text-orange-600 dark:text-orange-400 hover:underline"
            >
              Try again
            </button>
          </div>
        ) : (
          <>
            <div className="text-center py-4">
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-1">
                {balance ? parseFloat(balance.formatted).toFixed(4) : '0.0000'}
              </div>
              <div className="text-lg font-medium text-gray-900 dark:text-white">
                LINK
              </div>
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 dark:text-gray-400">Contract Address:</span>
                <span className="font-mono text-xs text-gray-700 dark:text-gray-300">
                  {`${VRF_CONSUMER_ADDRESS.slice(0, 6)}...${VRF_CONSUMER_ADDRESS.slice(-4)}`}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm mt-2">
                <span className="text-gray-500 dark:text-gray-400">Network:</span>
                <span className="text-gray-700 dark:text-gray-300">Sepolia Testnet</span>
              </div>
              <div className="flex justify-between items-center text-sm mt-2">
                <span className="text-gray-500 dark:text-gray-400">Auto-refresh:</span>
                <span className="text-green-600 dark:text-green-400">Every 30s</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const VRF_CONSUMER_ADDRESS = "0x9da078c09a45704d3127a4d8ac9ef366a7da3440";