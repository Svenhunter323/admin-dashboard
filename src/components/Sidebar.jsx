import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  ChartBarIcon,
  HomeIcon,
  UsersIcon,
  CurrencyDollarIcon,
  CogIcon,
  ArrowRightCircleIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
  { name: 'Users', href: '/users', icon: UsersIcon },
  { name: 'Bets', href: '/bets', icon: CurrencyDollarIcon },
  { 
    name: 'Smart Contracts', 
    icon: CogIcon,
    children: [
      { name: 'Wave Challenge Flip', href: '/admin/wave-challenge-flip' },
      // { name: 'Wave Flip', href: '/admin/wave-flip' },
      { name: 'Wave Prize Pool', href: '/admin/wave-prize-pool' },
    ]
  },
];

export default function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [expandedItems, setExpandedItems] = useState({});

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleExpanded = (itemName) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemName]: !prev[itemName]
    }));
  };
  return (
    <div className="flex flex-col w-64 bg-gray-900 dark:bg-gray-800">
      <div className="flex items-center justify-center h-16 px-4 bg-gray-800 dark:bg-gray-700">
        <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => (
          <div key={item.name}>
            {item.children ? (
              <>
                <button
                  onClick={() => toggleExpanded(item.name)}
                  className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors"
                >
                  <div className="flex items-center">
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </div>
                  <svg
                    className={`w-4 h-4 transition-transform ${expandedItems[item.name] ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedItems[item.name] && (
                  <div className="ml-8 mt-2 space-y-1">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.name}
                        to={child.href}
                        className={({ isActive }) =>
                          `block px-4 py-2 text-sm rounded-lg transition-colors ${
                            isActive
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                          }`
                        }
                      >
                        {child.name}
                      </NavLink>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <NavLink
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`
                }
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </NavLink>
            )}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-300 rounded-lg hover:bg-red-600 hover:text-white transition-colors"
        >
          <ArrowRightCircleIcon className="w-5 h-5 mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
}