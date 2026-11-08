import { Link, useNavigate } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

const steps = [
  {
    title: "1. Upload",
    text: "Snap a photo of the material or the space you want to fill.",
  },
  {
    title: "2. Add context",
    text: "Tell Scrapture what you have, what you need, and how much time you have.",
  },
  {
    title: "3. Make",
    text: "Get a directed idea with a preview, then make it with your own hands.",
  },
];

export default function Landing() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/", { replace: true });
  }

  return (
    <div className="min-h-screen bg-cream text-espresso">
      <header className="text-center pt-24 pb-10 px-6">
        <p className="uppercase tracking-widest text-sm text-bark mb-4">
          Craft ideas from what you already have
        </p>
        <h1 className="text-4xl md:text-5xl font-bold mb-6 max-w-3xl mx-auto">
          Stuck staring at an empty bottle or a box?
        </h1>
        <p className="text-lg max-w-2xl mx-auto mb-10">
          Upload a photo of a leftover material or an empty corner. Scrapture
          shows a directed idea you can make yourself, so you spend less time
          wondering and more time creating.
        </p>
      </header>

      <section className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6 px-6 pb-20">
        {steps.map((step) => (
          <div key={step.title} className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
            <p className="text-espresso/80">{step.text}</p>
          </div>
        ))}
      </section>

      <section className="bg-sand py-10 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            From empty bottle to decorated bottle
          </h2>
          <p className="max-w-2xl mx-auto mb-8">
            Photograph an empty bottle, a leftover roll of wool, or a bare
            corner beside your room door. Scrapture suggests what to make and
            shows you how it could look.
          </p>
          <Link to={user ? "/create" : "/signup"} className="btn">
            {user ? "Create an idea" : "Create your account"}
          </Link>
        </div>
      </section>

      <footer className="text-center text-sm py-8 text-espresso/70">
        © {new Date().getFullYear()} Scrapture
      </footer>
    </div>
  );
}
