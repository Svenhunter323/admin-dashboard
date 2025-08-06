import { useState } from "react";
import axios from "axios";

export default function Login({ setToken }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const login = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/admin/login", { username, password });
      setToken(res.data.token);
      localStorage.setItem("token", res.data.token);
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-20 bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Admin Login</h2>
      <input className="w-full border p-2 mb-2" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
      <input className="w-full border p-2 mb-4" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
      <button onClick={login} className="w-full bg-blue-600 text-white py-2 rounded">Login</button>
      {error && <p className="mt-3 text-red-600 text-sm">{error}</p>}
    </div>
  );
}