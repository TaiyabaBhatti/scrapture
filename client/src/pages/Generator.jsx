// Placeholder for your existing generator page.
// It shows the signed-in user and calls the protected /api/me route to prove the
// Firebase token is accepted by the backend. Replace the body with your current UI,
// keeping the Authorization header on every API call.
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Generator() {
  const { user, logout, getToken } = useAuth();
  const navigate = useNavigate();
  const [serverUser, setServerUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function checkSession() {
      try {
        const token = await getToken();
        const res = await fetch("/api/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Session rejected by server");
        setServerUser(await res.json());
      } catch (err) {
        setError(err.message);
      }
    }
    checkSession();
  }, [getToken]);

  async function handleLogout() {
    await logout();
    navigate("/", { replace: true });
  }

  return (
    <div className="min-h-screen bg-cream text-espresso p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Scrapture</h1>
          <button onClick={handleLogout} className="btn">Log out</button>
        </div>

        <p className="mb-2">Signed in as <strong>{user?.displayName || user?.email}</strong></p>
        {serverUser && <p className="text-sm text-green-700">Server verified your session (uid: {serverUser.uid})</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="mt-8 bg-white rounded-2xl p-6 shadow-sm">
          <p className="text-espresso/70">Your idea generator goes here.</p>
        </div>
      </div>
    </div>
  );
}
