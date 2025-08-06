import { useState } from 'react';
import { 
  PlayIcon, 
  PauseIcon, 
  BanknotesIcon, 
  CogIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';

export default function OwnerActions({ 
  isOwner, 
  isPaused, 
  onPause, 
  onUnpause, 
  onWithdraw, 
  onConfigUpdate,
  loading = {},
  children 
}) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(null);

  const handleAction = async (action, actionFn) => {
    setShowConfirmDialog(null);
    if (actionFn) {
      await actionFn();
    }
  };

  const ConfirmDialog = ({ action, onConfirm, onCancel }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center mb-4">
          <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500 mr-3" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Confirm Action
          </h3>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Are you sure you want to {action}? This action cannot be undone.
        </p>
        <div className="flex space-x-3">
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Confirm
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  if (!isOwner) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center py-8">
          <ExclamationTriangleIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Access Denied
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            You must be the contract owner to perform these actions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Owner Actions
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Pause/Unpause */}
          <button
            onClick={() => setShowConfirmDialog(isPaused ? 'unpause' : 'pause')}
            disabled={loading.pause}
            className={`flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-colors ${
              isPaused
                ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/40'
                : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:hover:bg-yellow-900/40'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isPaused ? (
              <PlayIcon className="w-5 h-5 mr-2" />
            ) : (
              <PauseIcon className="w-5 h-5 mr-2" />
            )}
            {loading.pause ? 'Processing...' : (isPaused ? 'Unpause Contract' : 'Pause Contract')}
          </button>

          {/* Withdraw */}
          {onWithdraw && (
            <button
              onClick={() => setShowConfirmDialog('withdraw')}
              disabled={loading.withdraw}
              className="flex items-center justify-center px-4 py-3 rounded-lg font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <BanknotesIcon className="w-5 h-5 mr-2" />
              {loading.withdraw ? 'Processing...' : 'Withdraw Funds'}
            </button>
          )}

          {/* Config Update */}
          {onConfigUpdate && (
            <button
              onClick={() => setShowConfirmDialog('config')}
              disabled={loading.config}
              className="flex items-center justify-center px-4 py-3 rounded-lg font-medium bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:hover:bg-purple-900/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CogIcon className="w-5 h-5 mr-2" />
              {loading.config ? 'Processing...' : 'Update Config'}
            </button>
          )}
        </div>

        {/* Custom Actions */}
        {children && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            {children}
          </div>
        )}
      </div>

      {/* Confirmation Dialogs */}
      {showConfirmDialog === 'pause' && (
        <ConfirmDialog
          action="pause the contract"
          onConfirm={() => handleAction('pause', onPause)}
          onCancel={() => setShowConfirmDialog(null)}
        />
      )}
      {showConfirmDialog === 'unpause' && (
        <ConfirmDialog
          action="unpause the contract"
          onConfirm={() => handleAction('unpause', onUnpause)}
          onCancel={() => setShowConfirmDialog(null)}
        />
      )}
      {showConfirmDialog === 'withdraw' && (
        <ConfirmDialog
          action="withdraw funds"
          onConfirm={() => handleAction('withdraw', onWithdraw)}
          onCancel={() => setShowConfirmDialog(null)}
        />
      )}
      {showConfirmDialog === 'config' && (
        <ConfirmDialog
          action="update configuration"
          onConfirm={() => handleAction('config', onConfigUpdate)}
          onCancel={() => setShowConfirmDialog(null)}
        />
      )}
    </>
  );
}