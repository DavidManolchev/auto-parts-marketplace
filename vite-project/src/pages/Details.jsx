import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import ContactSeller from "../components/ContactSeller";
import DeleteListing from "../components/DeleteListing";
import ListingsStatus from "../components/ListingsStatus";
import { fitLabel } from "../data";
import { useAuth, useListings } from "../store";
import "../details.css";

export default function Details() {
  const { id } = useParams();
  const { user } = useAuth();
  const { listings, status } = useListings();
  const [i, setI] = useState(0);

  if (status.loading || status.error) return <main className="latest"><ListingsStatus /></main>;

  const l = listings.find((x) => String(x.id) === id);
  if (!l)
    return (
      <div className="panel">
        <h1>Listing not found</h1>
        <p>It may have been removed. <Link to="/parts">Browse parts</Link> or <Link to="/fluids">browse fluids</Link>.</p>
      </div>
    );

  const isOwner = user?.id === l.owner;
  const back = l.kind === "part" ? "/parts" : "/fluids";
  const current = l.images[Math.min(i, l.images.length - 1)];

  return (
    <main className="latest details">
      <p className="crumbs"><Link to={back}>← Back to {l.kind === "part" ? "parts" : "fluids"}</Link></p>
      <div className="details-grid">
        <section aria-label="Photos">
          <div className={current ? "details-photo" : "details-photo placeholder"} role={current ? undefined : "img"} aria-label={current ? undefined : `${l.category} photo placeholder`}>
            {current ? <img src={current} alt={l.title} /> : <span>{l.category}</span>}
          </div>
          {l.images.length > 1 && (
            <ul className="gallery">
              {l.images.map((src, j) => (
                <li key={src}>
                  <button type="button" className={j === i ? "on" : ""} onClick={() => setI(j)} aria-label={`Show photo ${j + 1}`} aria-pressed={j === i}>
                    <img src={src} alt="" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="details-info">
          <h1>{l.title}</h1>
          <p className="details-price">€{l.price.toFixed(2)}</p>
          <dl className="specs">
            <dt>Category</dt><dd>{l.category}</dd>
            {l.condition && (<><dt>Condition</dt><dd>{l.condition}</dd></>)}
            <dt>{l.kind === "part" ? "Part number" : "Spec and volume"}</dt><dd>{l.code}</dd>
            {l.kind === "part" && (<><dt>Fits</dt><dd>{fitLabel(l)}</dd></>)}
            <dt>Seller</dt><dd>{l.seller}, {l.city}</dd>
            <dt>Listed</dt><dd>{new Date(l.createdAt).toLocaleDateString()}</dd>
          </dl>
          {isOwner ? (
            <div className="owner-actions">
              <Link className="btn btn-outline" to={`/listings/${l.id}/edit`}>Edit your listing</Link>
              <DeleteListing listing={l} />
            </div>
          ) : (
            <ContactSeller contact={l.contact} />
          )}
        </section>
      </div>
    </main>
  );
}
