import { createContext, useContext, useState, useEffect } from 'react';
import { initializeSocket, disconnectSocket, getSocket } from '../socket';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('adminToken'));
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      // Verify token validity
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp * 1000 < Date.now()) {
          logout();
        } else {
          setIsAuthenticated(true);
          initializeSocket(token);
          
          // Setup socket listeners
          const socket = getSocket();
          if (socket) {
            socket.connect();
            
            socket.on('kicked', () => {
              logout();
            });
          }
        }
      } catch (error) {
        logout();
      }
    }
    setLoading(false);
  }, [token]);

  const login = (newToken) => {
    localStorage.setItem('adminToken', newToken);
    setToken(newToken);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    setToken(null);
    setIsAuthenticated(false);
    disconnectSocket();
  };

  const value = {
    token,
    isAuthenticated,
    loading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};