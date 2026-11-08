import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { friendlyAuthError } from "../lib/authErrors";

export default function Login() {
  const { login, resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || "/create";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setInfo("");
    setBusy(true);
    try {
      await login(email.trim(), password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(friendlyAuthError(err.code));
    } finally {
      setBusy(false);
    }
  }

  async function handleReset() {
    setError("");
    setInfo("");
    if (!email.trim()) {
      setError("Enter your email above first, then click Forgot password.");
      return;
    }
    try {
      await resetPassword(email.trim());
      setInfo("Password reset email sent. Check your inbox.");
    } catch (err) {
      setError(friendlyAuthError(err.code));
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white rounded-2xl shadow-md p-8 space-y-4"
      >
        <Link to="/" className="text-sm text-bark hover:underline">
          ← Back
        </Link>
        <h1 className="text-2xl font-semibold text-espresso mt-2">
          Welcome back
        </h1>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {info && <p className="text-sm text-green-700">{info}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className="input border-b"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          className="input border-b"
        />

        <button type="submit" disabled={busy} className="btn w-full">
          {busy ? "Logging in..." : "Log in"}
        </button>

        <p className="text-sm text-center text-espresso">
          New to Scrapture?{" "}
          <Link to="/signup" className="text-bark underline">
            Create an account
          </Link>
        </p>
        <button
          type="button"
          onClick={handleReset}
          className="text-sm text-end w-full hover:underline"
        >
          Forgot password?
        </button>
      </form>
    </div>
  );
}
