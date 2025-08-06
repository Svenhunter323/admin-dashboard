import { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard({ token }) {
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({ totalUsers: 0, totalBets: 0, totalVolume: 0 });

  useEffect(() => {
    axios.get("http://localhost:5000/api/admin/history", {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setHistory(res.data)).catch(console.error);

    axios.get("http://localhost:5000/api/admin/kpis", {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setStats(res.data)).catch(console.error);
  }, [token]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">📋 Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white shadow rounded p-4">
          <p className="text-gray-500">Total Users</p>
          <h3 className="text-2xl font-bold">{stats.totalUsers}</h3>
        </div>
        <div className="bg-white shadow rounded p-4">
          <p className="text-gray-500">Total Bets</p>
          <h3 className="text-2xl font-bold">{stats.totalBets}</h3>
        </div>
        <div className="bg-white shadow rounded p-4">
          <p className="text-gray-500">Total Volume</p>
          <h3 className="text-2xl font-bold">{stats.totalVolume} XP</h3>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded shadow">
          <thead className="bg-gray-200 text-sm">
            <tr>
              <th className="text-left p-2">User</th>
              <th className="text-left p-2">Game</th>
              <th className="text-left p-2">Bet</th>
              <th className="text-left p-2">Result</th>
              <th className="text-left p-2">Time</th>
            </tr>
          </thead>
          <tbody>
            {history.map((h, i) => (
              <tr key={i} className="border-t">
                <td className="p-2">{h.username}</td>
                <td className="p-2">{h.game}</td>
                <td className="p-2">{h.amount}</td>
                <td className="p-2">{h.result}</td>
                <td className="p-2">{new Date(h.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}