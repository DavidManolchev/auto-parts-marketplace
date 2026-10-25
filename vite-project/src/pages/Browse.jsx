import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import Finder from "../components/Finder";
import ListingCard from "../components/ListingCard";
import ListingsStatus from "../components/ListingsStatus";
import { CATEGORIES, CONDITIONS, FLUID_CATEGORIES, fitsVehicle } from "../data";
import { useListings } from "../store";

export default function Browse({ kind }) {
  const isPart = kind === "part";
  const { listings, status } = useListings();
  const [params, setParams] = useSearchParams();
  const [category, setCategory] = useState("");
  const [conditions, setConditions] = useState([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const value = {
    make: params.get("make") ?? "",
    model: params.get("model") ?? "",
    year: params.get("year") ?? "",
    q: params.get("q") ?? "",
  };
  const setValue = (next) =>
    setParams(Object.fromEntries(Object.entries(next).filter(([, v]) => v)), { replace: true });

  const q = value.q.trim().toLowerCase();
  const results = listings.filter(
    (l) =>
      l.kind === kind &&
      (!isPart || fitsVehicle(l, { ...value, year: Number(value.year) })) &&
      (!q || l.title.toLowerCase().includes(q) || l.code.toLowerCase().includes(q)) &&
      (!category || l.category === category) &&
      (conditions.length === 0 || conditions.includes(l.condition)) &&
      (minPrice === "" || l.price >= Number(minPrice)) &&
      (maxPrice === "" || l.price <= Number(maxPrice))
  );
  const badRange = minPrice !== "" && maxPrice !== "" && Number(minPrice) > Number(maxPrice);

  const toggle = (c) =>
    setConditions((cur) => (cur.includes(c) ? cur.filter((x) => x !== c) : [...cur, c]));

  return (
    <>
      <section className="finder">
        <h1>{isPart ? "Browse parts" : "Browse fluids"}</h1>
        {isPart ? (
          <Finder value={value} onChange={setValue} />
        ) : (
          <form className="finder-form" onSubmit={(e) => e.preventDefault()}>
            <label className="grow">
              Fluid name or spec
              <input type="search" placeholder="5W-30, DOT 4…" value={value.q} onChange={(e) => setValue({ q: e.target.value })} />
            </label>
          </form>
        )}
      </section>

      <main className="layout">
        <aside className="filters" aria-label="Filters">
          <h2>Filters</h2>
          <fieldset>
            <legend>Category</legend>
            <button className={`chip ${category === "" ? "on" : ""}`} onClick={() => setCategory("")}>All</button>
            {(isPart ? CATEGORIES : FLUID_CATEGORIES).map((c) => (
              <button key={c} className={`chip ${category === c ? "on" : ""}`} onClick={() => setCategory(c)}>{c}</button>
            ))}
          </fieldset>
          {isPart && (
            <fieldset>
              <legend>Condition</legend>
              {CONDITIONS.map((c) => (
                <label key={c} className="check">
                  <input type="checkbox" checked={conditions.includes(c)} onChange={() => toggle(c)} />
                  {c}
                </label>
              ))}
            </fieldset>
          )}
          <fieldset className="price-range">
            <legend>Price (€)</legend>
            <label>Min
              <input type="number" min="0" step="1" inputMode="decimal" placeholder="0" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
            </label>
            <label>Max
              <input type="number" min="0" step="1" inputMode="decimal" placeholder="Any" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
            </label>
          </fieldset>
        </aside>

        <section aria-live="polite">
          <ListingsStatus />
          {!status.loading && !status.error && (
            <>
              <p className="count">{results.length} {results.length === 1 ? "item" : "items"} found</p>
              {badRange && <p className="error" role="alert">The minimum price is higher than the maximum.</p>}
              {results.length === 0 ? (
                <div className="empty">
                  <p>Nothing matches these filters. Clear the search or widen the price range.</p>
                </div>
              ) : (
                <ul className="grid">{results.map((l) => <ListingCard key={l.id} l={l} />)}</ul>
              )}
            </>
          )}
        </section>
      </main>
    </>
  );
}
