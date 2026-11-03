import { useState } from "react";
import { T } from "./i18n.js";
import { getClientId } from "./utils.js";
import Make from "./components/Make.jsx";
import Gallery from "./components/Gallery.jsx";

const LANGS = [["en", "English"]];
const TAB_BG = {
  make: "var(--color-peach)",
  mine: "var(--color-mint)",
  community: "var(--color-lav)",
};

export default function App() {
  const [lang, setLang] = useState("en");
  const [tab, setTab] = useState("make");
  const clientId = getClientId();
  const uiLang = lang === "ur" ? "ur" : "en";
  const t = T[uiLang];
  const dir = uiLang === "ur" ? "rtl" : "ltr";

  return (
    <div dir={dir} lang={uiLang} className="mx-auto max-w-4xl px-3 pb-16 pt-5">
      <header className="flex flex-wrap items-start justify-between gap-3 px-2">
        <div>
          <h1 className="font-display text-5xl font-extrabold leading-none tracking-tight sm:text-6xl">
            Scrapture
          </h1>
          <p className="tape mt-3 text-sm font-medium">{t.tagline}</p>
        </div>
        <div
          role="group"
          aria-label="Language"
          className="flex gap-1.5"
          dir="ltr"
        >
          {LANGS.map(([code, label]) => (
            <button
              key={code}
              className="chip text-sm"
              aria-pressed={lang === code}
              onClick={() => setLang(code)}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      <p className="mt-4 max-w-xl px-2 text-lg">{t.sub}</p>

      <nav className="mt-5 flex flex-wrap gap-2 px-2" aria-label="Sections">
        {[
          ["make", t.tabMake],
          ["mine", t.tabMine],
          ["community", t.tabCommunity],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            aria-current={tab === key ? "page" : undefined}
            className="rounded-lg  px-5 py-2 font-bold"
            style={{
              background: tab === key ? TAB_BG[key] : "var(--color-paper)",
            }}
          >
            {label}
          </button>
        ))}
      </nav>

      <main className="mt-8">
        <div hidden={tab !== "make"}>
          <Make t={t} lang={lang} clientId={clientId} />
        </div>
        {tab === "mine" && <Gallery scope="mine" t={t} clientId={clientId} />}
        {tab === "community" && (
          <Gallery scope="community" t={t} clientId={clientId} />
        )}
      </main>

      <footer className="mt-10 px-2 text-sm text-brown">{t.footer}</footer>
    </div>
  );
}
