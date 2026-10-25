import { VEHICLES, range } from "../data";

export default function Finder({ value, onChange, onSubmit }) {
  const { make, model, year, q } = value;
  const models = Object.keys(VEHICLES[make] ?? {});
  const span = VEHICLES[make]?.[model];
  const years = span ? range(...span) : [];
  const set = (patch) => onChange({ ...value, ...patch });

  return (
    <form className="finder-form" onSubmit={(e) => { e.preventDefault(); onSubmit?.(); }}>
      <label>
        Make
        <select value={make} onChange={(e) => set({ make: e.target.value, model: "", year: "" })}>
          <option value="">Any make</option>
          {Object.keys(VEHICLES).map((m) => <option key={m}>{m}</option>)}
        </select>
      </label>
      <label>
        Model
        <select value={model} disabled={!make} onChange={(e) => set({ model: e.target.value, year: "" })}>
          <option value="">Any model</option>
          {models.map((m) => <option key={m}>{m}</option>)}
        </select>
      </label>
      <label>
        Year
        <select value={year} disabled={!model} onChange={(e) => set({ year: e.target.value })}>
          <option value="">Any year</option>
          {years.map((y) => <option key={y}>{y}</option>)}
        </select>
      </label>
      <label className="grow">
        Part name or number
        <input type="search" placeholder="Brake disc, BD-28041…" value={q} onChange={(e) => set({ q: e.target.value })} />
      </label>
      {onSubmit && <button className="btn btn-dark" type="submit">Search parts</button>}
    </form>
  );
}
