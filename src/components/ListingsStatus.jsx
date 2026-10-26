import { useListings } from "../store";

export default function ListingsStatus() {
  const { status, reload } = useListings();
  if (status.loading) return <p className="count" role="status">Loading offers…</p>;
  if (status.error)
    return (
      <div className="empty" role="alert">
        <p>{status.error}</p>
        <button className="btn btn-outline" onClick={reload}>Try again</button>
      </div>
    );
  return null;
}
