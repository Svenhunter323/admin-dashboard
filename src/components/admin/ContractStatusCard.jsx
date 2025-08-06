import { CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

export default function ContractStatusCard({ 
  contractName, 
  isPaused, 
  isOwner, 
  isConnected, 
  loading,
  stats = {} 
}) {
  const getStatusColor = () => {
    if (loading) return 'yellow';
    if (!isConnected) return 'gray';
    if (isPaused) return 'red';
    return 'green';
  };

  const getStatusText = () => {
    if (loading) return 'Loading...';
    if (!isConnected) return 'Not Connected';
    if (isPaused) return 'Paused';
    return 'Active';
  };

  const getStatusIcon = () => {
    if (loading) return ClockIcon;
    if (!isConnected || isPaused) return XCircleIcon;
    return CheckCircleIcon;
  };

  const StatusIcon = getStatusIcon();
  const statusColor = getStatusColor();
  
  const colorClasses = {
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
    gray: 'bg-gray-50 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {contractName} Status
        </h3>
        <div className={`flex items-center px-3 py-1 rounded-full border ${colorClasses[statusColor]}`}>
          <StatusIcon className="w-4 h-4 mr-2" />
          <span className="text-sm font-medium">{getStatusText()}</span>
        </div>
      </div>

      {isConnected && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Owner Access</span>
            <span className={`text-sm font-medium ${isOwner ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {isOwner ? 'Yes' : 'No'}
            </span>
          </div>
          
          {Object.entries(stats).map(([key, value]) => (
            <div key={key} className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {typeof value === 'bigint' ? value.toString() : value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}