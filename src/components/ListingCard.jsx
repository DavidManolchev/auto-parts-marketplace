import { useState } from "react";
import { Link } from "react-router-dom";
import { fitLabel } from "../data";
import ContactSeller from "./ContactSeller";
import DeleteListing from "./DeleteListing";
import "../cards.css";

export default function ListingCard({ l, editable = false }) {
  const [i, setI] = useState(0);
  const n = l.images.length;

  return (
    <li className="card">
      {n > 0 ? (
        <div className="photo">
          {n > 1 ? (
            <button type="button" className="photo-btn" onClick={() => setI((i + 1) % n)} aria-label={`Photo ${i + 1} of ${n}. Show next photo`}>
              <img src={l.images[i]} alt={l.title} loading="lazy" />
              <span className="count">{i + 1}/{n}</span>
            </button>
          ) : (
            <img src={l.images[0]} alt={l.title} loading="lazy" />
          )}
        </div>
      ) : (
        <div className="photo" role="img" aria-label={`${l.category} photo placeholder`}>
          <span>{l.category}</span>
        </div>
      )}
      <div className="card-body">
        <h3><Link className="card-link" to={`/listings/${l.id}`}>{l.title}</Link></h3>
        <p className="partno">{l.kind === "part" ? `Part no. ${l.code}` : l.code}</p>
        {l.kind === "part" && <p className="fit">{fitLabel(l)}</p>}
        <p>{l.seller}, {l.city}</p>
        <div className="card-foot">
          <span className="price">€{l.price.toFixed(2)}</span>
          {l.condition && (
            <span className={`badge cond-${l.condition.split(",")[0].toLowerCase()}`}>{l.condition}</span>
          )}
        </div>
        {editable ? (
          <div className="owner-actions">
            <Link className="btn btn-outline" to={`/listings/${l.id}/edit`}>Edit</Link>
            <DeleteListing listing={l} />
          </div>
        ) : (
          <ContactSeller contact={l.contact} />
        )}
      </div>
    </li>
  );
}
