import { useState } from "react";
import axios from "axios";

export default function Profile({ token }) {
  const [newUsername, setNewUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  const updateProfile = async () => {
    try {
      const res = await axios.patch("http://localhost:5000/api/admin/update", {
        currentPassword,
        newUsername,
        newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage("✅ Admin info updated!");
    } catch (err) {
      setMessage("❌ Update failed: " + err.response?.data?.error || "Unknown error");
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 bg-white shadow p-6 rounded">
      <h2 className="text-xl font-bold mb-4">Update Admin Info</h2>

      <input className="w-full border p-2 mb-2" placeholder="New Username (optional)" value={newUsername} onChange={e => setNewUsername(e.target.value)} />
      <input className="w-full border p-2 mb-2" type="password" placeholder="Current Password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
      <input className="w-full border p-2 mb-4" type="password" placeholder="New Password (optional)" value={newPassword} onChange={e => setNewPassword(e.target.value)} />

      <button className="w-full bg-blue-600 text-white py-2 rounded" onClick={updateProfile}>Update</button>
      {message && <p className="mt-4 text-sm text-gray-700">{message}</p>}
    </div>
  );
}
