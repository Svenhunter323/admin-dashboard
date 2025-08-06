import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from './useSocket';

export const useAutoKick = () => {
  const { logout } = useAuth();

  useSocket('kicked', () => {
    logout();
    window.location.href = '/login';
  });

  useSocket('disconnect', (reason) => {
    if (reason === 'io server disconnect') {
      // Server disconnected the client, likely due to auth issues
      logout();
    }
  });
};