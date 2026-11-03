import { useEffect, useRef, useState } from "react";
import { getIdea, getVisual } from "../api.js";
import { resizeImage } from "../utils.js";
import { BUDGETS, STYLE_KEYS } from "../i18n.js";
import Result from "./Result.jsx";

export default function Make({ t, lang, clientId }) {
  const [mode, setMode] = useState("object");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [context, setContext] = useState("");
  const [style, setStyle] = useState("truckart");
  const [budget, setBudget] = useState(500);
  const [phase, setPhase] = useState(null); // null | 'idea' | 'visual'
  const [idea, setIdea] = useState(null);
  const [after, setAfter] = useState(null);
  const [blob, setBlob] = useState(null);
  const [error, setError] = useState("");
  const resultRef = useRef(null);

  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  function onPick(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setIdea(null);
    setAfter(null);
    setError("");
  }

  async function drawPicture(currentIdea, currentBlob) {
    setPhase("visual");
    setAfter(null);
    try {
      const fd = new FormData();
      fd.append("image", currentBlob, "photo.jpg");
      fd.append(
        "visualPrompt",
        currentIdea.visualPrompt || currentIdea.summary || ""
      );
      fd.append("mode", mode);
      fd.append("style", style);
      const r = await getVisual(fd);
      setAfter(r.image);
    } catch (e) {
      setError(e.message);
    } finally {
      setPhase(null);
    }
  }

  async function run(avoidTitle = "") {
    if (!file) return;
    setError("");
    setIdea(null);
    setAfter(null);
    setPhase("idea");
    try {
      const small = await resizeImage(file);
      setBlob(small);
      const fd = new FormData();
      fd.append("image", small, "photo.jpg");
      fd.append("mode", mode);
      fd.append("context", context);
      fd.append("style", style);
      fd.append("budget", String(budget));
      fd.append("lang", lang);
      if (avoidTitle) fd.append("avoid", avoidTitle);
      const { idea: got } = await getIdea(fd);
      setIdea(got);
      setTimeout(
        () =>
          resultRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          }),
        50
      );
      await drawPicture(got, small);
    } catch (e) {
      setError(e.message);
      setPhase(null);
    }
  }

  const busy = phase !== null;

  return (
    <div className="">
      <div
        className="patch patch-lg rounded-lg"
        style={{ "--patch-bg": "var(--color-peach)" }}
      >
        <div role="group" aria-label="Type" className="flex flex-wrap gap-2">
          {[
            ["object", t.modeObject],
            ["space", t.modeSpace],
          ].map(([key, label]) => (
            <button
              key={key}
              className="chip"
              aria-pressed={mode === key}
              onClick={() => setMode(key)}
            >
              {label}
            </button>
          ))}
        </div>

        <label className="mt-4 block cursor-pointer">
          <span className="font-display text-xl font-bold">
            {file ? t.changePhoto : t.photo}
          </span>
          <div className="mt-2 grid min-h-40 place-items-center overflow-hidden rounded-2xl bg-paper p-3 text-center">
            {preview ? (
              <img
                src={preview}
                alt=""
                className="max-h-80 rounded-xl object-contain"
              />
            ) : (
              <span className="max-w-xs text-brown">{t.photoHint}</span>
            )}
          </div>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            capture="environment"
            onChange={onPick}
            className="sr-only"
          />
        </label>

        <label className="mt-4 block">
          <span className="font-bold">{t.context}</span>
          <input
            className="field mt-1"
            value={context}
            maxLength={300}
            onChange={(e) => setContext(e.target.value)}
            placeholder={mode === "space" ? t.contextSpace : t.contextObj}
          />
        </label>

        <div className="mt-4">
          <span className="font-bold">{t.style}</span>
          <div className="mt-1 flex flex-wrap gap-2">
            {STYLE_KEYS.map((k) => (
              <button
                key={k}
                className="chip"
                aria-pressed={style === k}
                onClick={() => setStyle(k)}
              >
                {t.styles[k]}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <span className="font-bold">{t.budget}</span>
          <div className="mt-1 flex flex-wrap gap-2">
            {BUDGETS.map((b) => (
              <button
                key={b}
                className="chip"
                aria-pressed={budget === b}
                onClick={() => setBudget(b)}
              >
                {b === 0 ? t.free : `${t.rs} ${b.toLocaleString("en-US")}`}
              </button>
            ))}
          </div>
        </div>

        <button
          className="btn mt-6 text-lg"
          disabled={!file || busy}
          onClick={() => run()}
        >
          {phase === "idea" ? t.thinking : t.getIdea}
        </button>
        {error && (
          <p role="alert" className="mt-3 font-bold text-brown">
            {error}
          </p>
        )}
      </div>

      <div ref={resultRef} className="scroll-mt-4 mt-5">
        {phase === "idea" && (
          <div
            className="mt-6 flex items-center gap-3 px-3 font-bold"
            aria-live="polite"
          >
            <svg className="spinner" viewBox="0 0 50 50" aria-hidden="true">
              <circle cx="25" cy="25" r="20" />
            </svg>
            {t.thinking}
          </div>
        )}
        {idea && (
          <Result
            idea={idea}
            beforeUrl={preview}
            blob={blob}
            after={after}
            phase={phase}
            t={t}
            clientId={clientId}
            busy={busy}
            onAnother={() => run(idea.title)}
            onRetryPicture={() => drawPicture(idea, blob)}
          />
        )}
      </div>
    </div>
  );
}
