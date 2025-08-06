import { useState, useEffect } from 'react';
import { adminAPI } from '../api';
import { useSocket } from '../hooks/useSocket';
import { getSocket } from '../socket';
import Header from '../components/Header';
import Table from '../components/Table';
import { UserIcon, ShieldExclamationIcon } from '@heroicons/react/24/outline';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const response = await adminAPI.getUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Refresh users when updated
  useSocket('users_updated', fetchUsers);

  const handleBanUser = async (userId) => {
    try {
      await adminAPI.banUser(userId);
      
      // Emit kicked event if user is online
      const socket = getSocket();
      if (socket) {
        socket.emit('kicked', { userId });
      }
      
      fetchUsers();
    } catch (error) {
      console.error('Failed to ban user:', error);
    }
  };

  const handleUnbanUser = async (userId) => {
    try {
      await adminAPI.unbanUser(userId);
      fetchUsers();
    } catch (error) {
      console.error('Failed to unban user:', error);
    }
  };

  const columns = [
    {
      key: 'username',
      label: 'Username',
      render: (value, row) => (
        <div className="flex items-center">
          <UserIcon className="w-5 h-5 text-gray-400 mr-2" />
          <span className="font-medium">{value}</span>
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Email',
    },
    {
      key: 'banned',
      label: 'Status',
      render: (value) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            value
              ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
              : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
          }`}
        >
          {value ? 'Banned' : 'Active'}
        </span>
      ),
    },
    {
      key: 'joinedAt',
      label: 'Joined',
      render: (value) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'lastActive',
      label: 'Last Active',
      render: (value) => value ? new Date(value).toLocaleDateString() : 'Never',
    },
  ];

  const actions = (user) => (
    <>
      {user.banned ? (
        <button
          onClick={() => handleUnbanUser(user.id)}
          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/40 transition-colors"
        >
          Unban
        </button>
      ) : (
        <button
          onClick={() => handleBanUser(user.id)}
          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 transition-colors"
        >
          <ShieldExclamationIcon className="w-4 h-4 mr-1" />
          Ban
        </button>
      )}
    </>
  );

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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage user accounts and moderation actions
            </p>
          </div>

          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center">
                <UserIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{users.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                  <div className="w-3 h-3 bg-green-600 dark:bg-green-400 rounded-full"></div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {users.filter(u => !u.banned).length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center">
                <ShieldExclamationIcon className="w-8 h-8 text-red-600 dark:text-red-400" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Banned Users</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {users.filter(u => u.banned).length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Table
            columns={columns}
            data={users}
            actions={actions}
          />
        </div>
      </main>
    </div>
  );
}