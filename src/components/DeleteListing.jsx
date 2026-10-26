import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useListings } from "../store";
import "../delete.css";

export default function DeleteListing({ listing }) {
  const { deleteListing } = useListings();
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const remove = async () => {
    setBusy(true);
    setError("");
    try {
      await deleteListing(listing.id);
      navigate("/my-listings", { state: { notice: `Deleted: ${listing.title}` } });
    } catch {
      setError("Couldn't delete the listing. Check your connection and try again.");
      setBusy(false);
    }
  };

  if (!confirming)
    return <button type="button" className="btn btn-danger-outline" onClick={() => setConfirming(true)}>Delete</button>;

  return (
    <div className="confirm" role="group" aria-label="Confirm delete">
      <p>Delete this listing? This can't be undone.</p>
      <div className="confirm-actions">
        <button type="button" className="btn btn-outline" onClick={() => { setConfirming(false); setError(""); }} disabled={busy}>Cancel</button>
        <button type="button" className="btn btn-danger" onClick={remove} disabled={busy}>{busy ? "Deleting…" : "Yes, delete"}</button>
      </div>
      {error && <p className="error" role="alert">{error}</p>}
    </div>
  );
}
