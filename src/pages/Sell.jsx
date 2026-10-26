import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CATEGORIES, CONDITIONS, FLUID_CATEGORIES, VEHICLES } from "../data";
import { useListings } from "../store";
import "../photos.css";

const MAX_FILES = 4;
const MAX_MB = 5;
const TYPES = ["image/jpeg", "image/png", "image/webp"];
const blank = (v) => (v === "—" ? "" : v);

function initialForm(l) {
  if (!l) return { kind: "part", title: "", code: "", category: CATEGORIES[0], condition: CONDITIONS[0], price: "", city: "", make: "", model: "", from: "", to: "" };
  const fit = l.fits[0];
  return {
    kind: l.kind, title: l.title, code: blank(l.code), category: l.category, condition: l.condition ?? CONDITIONS[0],
    price: String(l.price), city: blank(l.city),
    make: fit?.make ?? "", model: fit?.model ?? "",
    from: fit?.from ? String(fit.from) : "", to: fit && fit.to !== 9999 ? String(fit.to) : "",
  };
}

export default function Sell({ listing }) {
  const editing = Boolean(listing);
  const { addListing, updateListing } = useListings();
  const navigate = useNavigate();
  const [f, setF] = useState(() => initialForm(listing));
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [files, setFiles] = useState([]);
  const [kept, setKept] = useState(() => (listing ? listing.imagePaths.map((path, i) => ({ path, url: listing.images[i] })) : []));
  const previews = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files]);
  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews]);

  const isPart = f.kind === "part";
  const total = kept.length + files.length;
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const pick = (e) => {
    const picked = [...e.target.files];
    e.target.value = "";
    const ok = picked.filter((x) => TYPES.includes(x.type) && x.size <= MAX_MB * 1024 * 1024);
    const room = MAX_FILES - total;
    if (ok.length < picked.length) setError(`Photos must be JPG, PNG or WebP and under ${MAX_MB} MB each.`);
    else if (ok.length > room) setError(`You can add up to ${MAX_FILES} photos.`);
    else setError("");
    setFiles([...files, ...ok.slice(0, room)]);
  };

  const changeKind = (e) => {
    const kind = e.target.value;
    setF({ ...f, kind, category: kind === "part" ? CATEGORIES[0] : FLUID_CATEGORIES[0] });
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!f.title.trim() || !f.price) return setError("Add a title and a price to save your item.");
    setBusy(true);
    setError("");
    const fields = {
      kind: f.kind, title: f.title.trim(), code: f.code.trim() || "—", category: f.category, condition: isPart ? f.condition : null,
      price: Math.round(Number(f.price) * 100) / 100, city: f.city.trim() || "—",
      fits: isPart && f.make && f.model ? [{ make: f.make, model: f.model, from: Number(f.from) || 0, to: Number(f.to) || 9999 }] : [],
    };
    try {
      if (editing) await updateListing(listing.id, fields, { keep: kept.map((k) => k.path), files });
      else await addListing(fields, files);
      navigate("/my-listings", { state: { notice: `${editing ? "Saved" : "Listed"}: ${fields.title}` } });
    } catch {
      setError("Couldn't save your listing. Check your connection and try again.");
      setBusy(false);
    }
  };

  const saveLabel = editing ? "Save changes" : "List item";

  return (
    <div className="panel wide">
      <h1>{editing ? "Edit listing" : "Sell an item"}</h1>
      <form onSubmit={submit}>
        <label>Type
          <select value={f.kind} onChange={changeKind} disabled={editing}>
            <option value="part">Part</option>
            <option value="fluid">Fluid</option>
          </select>
        </label>
        <label>Title<input value={f.title} onChange={set("title")} /></label>
        <label>{isPart ? "Part number" : "Spec and volume"}
          <input value={f.code} onChange={set("code")} placeholder={isPart ? "BD-28041" : "5W-30 ACEA C3, 5 L"} />
        </label>
        <div className="row">
          <label>Category
            <select value={f.category} onChange={set("category")}>
              {(isPart ? CATEGORIES : FLUID_CATEGORIES).map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
          {isPart && (
            <label>Condition
              <select value={f.condition} onChange={set("condition")}>{CONDITIONS.map((c) => <option key={c}>{c}</option>)}</select>
            </label>
          )}
        </div>
        {isPart && (
          <>
            <div className="row">
              <label>Fits make
                <select value={f.make} onChange={(e) => setF({ ...f, make: e.target.value, model: "" })}>
                  <option value="">Universal</option>
                  {Object.keys(VEHICLES).map((m) => <option key={m}>{m}</option>)}
                </select>
              </label>
              <label>Fits model
                <select value={f.model} disabled={!f.make} onChange={set("model")}>
                  <option value="">Choose model</option>
                  {Object.keys(VEHICLES[f.make] ?? {}).map((m) => <option key={m}>{m}</option>)}
                </select>
              </label>
            </div>
            <div className="row">
              <label>Years from<input type="number" value={f.from} onChange={set("from")} /></label>
              <label>Years to<input type="number" value={f.to} onChange={set("to")} /></label>
            </div>
          </>
        )}
        <div className="row">
          <label>Price (€)<input type="number" min="0" step="0.01" inputMode="decimal" value={f.price} onChange={set("price")} /></label>
          <label>City<input value={f.city} onChange={set("city")} /></label>
        </div>
        <div className="photos">
          <span className="photos-title">
            Photos <span className="hint">(up to {MAX_FILES}, JPG, PNG or WebP, {MAX_MB} MB each)</span>
          </span>
          <label className={`btn btn-outline file-btn ${total >= MAX_FILES ? "full" : ""}`}>
            {total >= MAX_FILES ? "Maximum photos added" : total > 0 ? "Add more photos" : "Choose photos"}
            <input type="file" className="sr-only" accept={TYPES.join(",")} multiple onChange={pick} disabled={total >= MAX_FILES} />
          </label>
          <p className="count photos-count" role="status">{total} of {MAX_FILES} photos added</p>
          {total > 0 && (
            <ul className="thumbs">
              {kept.map((k, i) => (
                <li key={k.path}>
                  <img src={k.url} alt={`Photo ${i + 1}`} />
                  <button type="button" onClick={() => setKept(kept.filter((_, j) => j !== i))} aria-label={`Remove photo ${i + 1}`}>×</button>
                </li>
              ))}
              {previews.map((src, i) => (
                <li key={src}>
                  <img src={src} alt={`Photo ${kept.length + i + 1}`} />
                  <button type="button" onClick={() => setFiles(files.filter((_, j) => j !== i))} aria-label={`Remove photo ${kept.length + i + 1}`}>×</button>
                </li>
              ))}
            </ul>
          )}
        </div>
        {error && <p className="error" role="alert">{error}</p>}
        {editing ? (
          <div className="actions">
            <button type="button" className="btn btn-outline" onClick={() => navigate("/my-listings")}>Cancel</button>
            <button className="btn btn-primary" type="submit" disabled={busy}>{busy ? "Saving…" : saveLabel}</button>
          </div>
        ) : (
          <button className="btn btn-primary" type="submit" disabled={busy}>{busy ? "Saving…" : saveLabel}</button>
        )}
      </form>
    </div>
  );
}
