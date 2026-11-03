import { useEffect, useState } from 'react';
import { deleteCreation, listCommunity, listMine, madeIt } from '../api.js';
import { whatsappLink } from '../utils.js';

const BGS = ['var(--color-mint)', 'var(--color-lav)', 'var(--color-sky)', 'var(--color-rose)', 'var(--color-butter)', 'var(--color-peach)'];

export default function Gallery({ scope, t, clientId }) {
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');
  const [made, setMade] = useState({});

  useEffect(() => {
    let alive = true;
    (scope === 'mine' ? listMine(clientId) : listCommunity())
      .then((r) => alive && setItems(r.items))
      .catch((e) => alive && (setError(e.message), setItems([])));
    return () => { alive = false; };
  }, [scope, clientId]);

  async function remove(id) {
    try {
      await deleteCreation(id, clientId);
      setItems((list) => list.filter((i) => i.id !== id));
    } catch (e) {
      setError(e.message);
    }
  }
  async function iMadeIt(id) {
    try {
      const r = await madeIt(id);
      setMade((m) => ({ ...m, [id]: r.madeCount }));
    } catch (e) {
      setError(e.message);
    }
  }

  if (items === null) return <p className="mt-6 px-3">{t.loading}</p>;

  return (
    <div className="mt-2">
      {error && <p role="alert" className="px-3 pt-4 font-bold text-brown">{error}</p>}
      {!error && items.length === 0 && <p className="mt-6 px-3 text-lg">{scope === 'mine' ? t.emptyMine : t.emptyCommunity}</p>}
      <div className="grid sm:grid-cols-2">
        {items.map((it, n) => (
          <article key={it.id} className="patch" style={{ '--patch-bg': BGS[n % BGS.length] }}>
            <img src={it.imageUrl} alt={it.idea.title} className="w-full rounded-xl border-2 border-cocoa" loading="lazy" />
            <h3 className="mt-3 font-display text-xl font-bold">{it.idea.title}</h3>
            <p className="text-sm text-brown">
              {t.diff[it.idea.difficulty] || it.idea.difficulty} · {it.idea.timeMinutes} {t.mins} · {t.rs} {it.idea.estimatedCostPKR}
            </p>
            <details className="mt-2">
              <summary className="cursor-pointer font-bold">{t.steps}</summary>
              <p className="mt-1">{it.idea.summary}</p>
              <ol className="mt-2 list-decimal space-y-1 ps-6">
                {it.idea.steps.map((s, i) => <li key={i}>{s}</li>)}
              </ol>
            </details>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <a className="btn btn-soft px-4 py-1.5 text-sm no-underline" href={whatsappLink(it.idea, it.imageUrl)} target="_blank" rel="noreferrer">
                {t.whatsapp}
              </a>
              {scope === 'community' ? (
                <button className="btn px-4 py-1.5 text-sm" onClick={() => iMadeIt(it.id)}>{t.madeIt}</button>
              ) : (
                <button className="btn btn-soft px-4 py-1.5 text-sm" onClick={() => remove(it.id)}>{t.remove}</button>
              )}
              {scope === 'community' && (
                <span className="text-sm font-bold">{(made[it.id] ?? it.madeCount ?? 0)} {t.madeCount}</span>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
