import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAutoKick } from './hooks/useAutoKick';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Users from './pages/Users';
import Bets from './pages/Bets';
import WaveChallengeFlip from './pages/admin/WaveChallengeFlip';
import WaveFlip from './pages/admin/WaveFlip';
import WavePrizePool from './pages/admin/WavePrizePool';
import Login from './pages/Login';

function AppContent() {
  useAutoKick();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
              <Sidebar />
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/users" element={<Users />} />
                <Route path="/bets" element={<Bets />} />
                <Route path="/admin/wave-challenge-flip" element={<WaveChallengeFlip />} />
                <Route path="/admin/wave-flip" element={<WaveFlip />} />
                <Route path="/admin/wave-prize-pool" element={<WavePrizePool />} />
              </Routes>
            </div>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}