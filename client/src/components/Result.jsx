import { useState } from "react";
import Compare from "./Compare.jsx";
import { saveCreation } from "../api.js";
import { blobToDataUrl, downloadDataUrl, whatsappLink } from "../utils.js";

const patch = (bg) => ({ "--patch-bg": bg });

export default function Result({
  idea,
  beforeUrl,
  blob,
  after,
  phase,
  t,
  clientId,
  onAnother,
  onRetryPicture,
  busy,
}) {
  const [save, setSave] = useState({ state: "idle", url: null, error: "" });
  const [isPublic, setIsPublic] = useState(false);
  const total = idea.toBuy.reduce((n, b) => n + (Number(b.pricePKR) || 0), 0);

  async function onSave() {
    setSave({ state: "saving", url: null, error: "" });
    try {
      const originalDataUrl = await blobToDataUrl(blob);
      const r = await saveCreation({
        clientId,
        idea,
        imageDataUrl: after,
        originalDataUrl,
        isPublic,
      });
      setSave({ state: "saved", url: r.imageUrl, error: "" });
    } catch (e) {
      setSave({ state: "idle", url: null, error: e.message });
    }
  }

  return (
    <section className="mt-2 space-y-3!" aria-live="polite">
      <div className="patch patch-lg" style={patch("var(--color-butter)")}>
        <h2 className="font-display text-3xl font-extrabold leading-tight">
          {idea.title}
        </h2>
        <p className="mt-2 text-lg">{idea.summary}</p>
        <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-2">
          <div>
            <dt className="text-sm text-brown">{t.difficulty}</dt>
            <dd className="font-bold">
              {t.diff[idea.difficulty] || idea.difficulty}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-brown">{t.time}</dt>
            <dd className="font-bold">
              {idea.timeMinutes} {t.mins}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-brown">{t.cost}</dt>
            <dd className="font-bold">
              {t.rs} {idea.estimatedCostPKR || total}
            </dd>
          </div>
        </dl>
      </div>

      <div className="patch" style={patch("var(--color-paper)")}>
        {after ? (
          <Compare
            before={beforeUrl}
            after={after}
            labelBefore={t.before}
            labelAfter={t.after}
          />
        ) : (
          <div className="relative">
            <img
              src={beforeUrl}
              alt={t.before}
              className="w-full rounded-2xl border-2 border-cocoa opacity-60"
            />
            {phase === "visual" && (
              <div className="absolute inset-0 grid place-items-center">
                <div className="flex items-center gap-3 rounded-full bg-cream px-4 py-2 font-bold">
                  <svg
                    className="spinner"
                    viewBox="0 0 50 50"
                    aria-hidden="true"
                  >
                    <circle cx="25" cy="25" r="20" />
                  </svg>
                  {t.drawing}
                </div>
              </div>
            )}
          </div>
        )}
        {!after && phase !== "visual" && (
          <p className="mt-3">
            {t.noPicture}{" "}
            <button className="underline" onClick={onRetryPicture}>
              {t.retryPicture}
            </button>
          </p>
        )}
      </div>

      <div className="grid gap-0 sm:grid-cols-2">
        <div className="patch" style={patch("var(--color-mint)")}>
          <h3 className="font-display text-xl font-bold">{t.have}</h3>
          <ul className="mt-2 list-disc ps-5">
            {idea.haveMaterials.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        </div>
        <div className="patch" style={patch("var(--color-lav)")}>
          <h3 className="font-display text-xl font-bold">{t.buy}</h3>
          {idea.toBuy.length === 0 ? (
            <p className="mt-2">{t.nothingToBuy}</p>
          ) : (
            <ul className="mt-2 space-y-1">
              {idea.toBuy.map((b, i) => (
                <li key={i} className="flex justify-between gap-3">
                  <span>{b.item}</span>
                  <span className="whitespace-nowrap font-bold">
                    {t.rs} {b.pricePKR}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="patch patch-lg" style={patch("var(--color-sky)")}>
        <h3 className="font-display text-xl font-bold">{t.steps}</h3>
        <ol className="mt-2 list-decimal space-y-2 ps-6">
          {idea.steps.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ol>
      </div>

      {idea.tip && (
        <div className="patch" style={patch("var(--color-rose)")}>
          <h3 className="font-display text-xl font-bold">{t.tip}</h3>
          <p className="mt-1">{idea.tip}</p>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3 px-2">
        {after && (
          <button
            className="btn"
            onClick={onSave}
            disabled={save.state !== "idle"}
          >
            {save.state === "saving"
              ? t.saving
              : save.state === "saved"
              ? t.saved
              : t.save}
          </button>
        )}
        <a
          className="btn btn-soft no-underline"
          href={whatsappLink(idea, save.url)}
          target="_blank"
          rel="noreferrer"
        >
          {t.whatsapp}
        </a>
        {after && (
          <button
            className="btn btn-soft"
            onClick={() => downloadDataUrl(after, "scrapture.png")}
          >
            {t.download}
          </button>
        )}
        <button className="btn btn-soft" onClick={onAnother} disabled={busy}>
          {t.another}
        </button>
      </div>
      {after && save.state === "idle" && (
        <label className="mt-3 flex items-center gap-2 px-2">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="size-5 accent-brown"
          />
          {t.shareCommunity}
        </label>
      )}
      {save.error && (
        <p role="alert" className="mt-3 px-2 font-bold text-brown">
          {save.error}
        </p>
      )}
    </section>
  );
}
