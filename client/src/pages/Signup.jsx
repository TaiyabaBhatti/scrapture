import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { friendlyAuthError } from "../lib/authErrors";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (form.name.trim().length < 2) return setError("Please enter your name.");
    if (form.password.length < 6)
      return setError("Password must be at least 6 characters.");
    if (form.password !== form.confirm)
      return setError("Passwords do not match.");

    setBusy(true);
    try {
      await signup(form.name.trim(), form.email.trim(), form.password);
      navigate("/create", { replace: true });
    } catch (err) {
      setError(friendlyAuthError(err.code));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg bg-white rounded-2xl shadow-md p-8 space-y-4"
      >
        <Link to="/" className="text-sm text-bark hover:underline">
          ← Back to home
        </Link>
        <h1 className="text-2xl font-semibold text-espresso">
          Create your account
        </h1>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-x-8">
          <input
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            required
            autoComplete="name"
            className="input border-b"
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            autoComplete="email"
            className="input border-b"
          />
        </div>
        <div className="flex gap-x-8">
          <input
            name="password"
            type="password"
            placeholder="Password (min 6 characters)"
            value={form.password}
            onChange={handleChange}
            required
            autoComplete="new-password"
            className="input border-b"
          />
          <input
            name="confirm"
            type="password"
            placeholder="Confirm password"
            value={form.confirm}
            onChange={handleChange}
            required
            autoComplete="new-password"
            className="input border-b"
          />
        </div>

        <button type="submit" disabled={busy} className="btn mt-3 w-full">
          {busy ? "Creating account..." : "Sign up"}
        </button>

        <p className="text-sm text-center text-espresso">
          Already have an account?{" "}
          <Link to="/login" className="text-bark underline">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}
