import { useState, useEffect } from "react";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Analytics from "./pages/Analytics";

function decodeJWT(token) {
  try {
    const base64 = token.split('.')[1];
    const json = JSON.parse(atob(base64));
    return json;
  } catch {
    return null;
  }
}

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [view, setView] = useState("dashboard");
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("dark") === "1");

  useEffect(() => {
    if (token) {
      const decoded = decodeJWT(token);
      if (decoded?.exp && Date.now() >= decoded.exp * 1000) {
        setToken(null);
        localStorage.removeItem("token");
      }
    }
  }, [token]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("dark", darkMode ? "1" : "0");
  }, [darkMode]);

  if (!token) return <Login setToken={setToken} />;

  return (
    <div className="flex h-screen dark:bg-gray-900 dark:text-white">
      <aside className="w-60 bg-gray-800 text-white p-4 space-y-4">
        <h1 className="text-2xl font-bold mb-6">Admin</h1>
        <nav className="space-y-2">
          <button onClick={() => setView("dashboard")} className="block w-full text-left px-3 py-2 rounded hover:bg-gray-700">📋 Dashboard</button>
          <button onClick={() => setView("analytics")} className="block w-full text-left px-3 py-2 rounded hover:bg-gray-700">📊 Analytics</button>
          <button onClick={() => setView("profile")} className="block w-full text-left px-3 py-2 rounded hover:bg-gray-700">👤 Profile</button>
          <button onClick={() => setDarkMode(d => !d)} className="block w-full text-left px-3 py-2 rounded hover:bg-gray-700">
            {darkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
          </button>
          <button
            onClick={() => {
              setToken(null);
              localStorage.removeItem("token");
            }}
            className="block w-full text-left px-3 py-2 rounded bg-red-600 hover:bg-red-700 mt-8"
          >
            🔓 Logout
          </button>
        </nav>
      </aside>

      <main className="flex-1 p-6 overflow-y-auto">
        {view === "dashboard" && <Dashboard token={token} />}
        {view === "analytics" && <Analytics token={token} />}
        {view === "profile" && <Profile token={token} />}
      </main>
    </div>
  );
}