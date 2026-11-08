import { Link, useNavigate } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/", { replace: true });
  }

  return (
    <header className="sticky top-0 z-50 bg-cream/90 backdrop-blur border-b border-sand">
      <nav className="max-w-6xl mx-auto flex items-center justify-between p-6">
        <Link to="/" className="text-xl font-bold">
          <h1 className="font-display text-5xl font-extrabold leading-none tracking-tight sm:text-6xl">
            Scrapture
          </h1>
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link to="/create" className="btn">
                Open app
              </Link>
              <div className="flex items-center gap-2 text-sm" dir="ltr">
                <span>{user.displayName || user.email}</span>
                <button
                  onClick={handleLogout}
                  aria-label="Log out"
                  title="Log out"
                  className="text-lg cursor-pointer hover:bg-amber-100 p-2 rounded-lg"
                >
                  <FiLogOut />
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:underline">
                Log in
              </Link>
              <Link to="/signup" className="btn">
                Get started
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
