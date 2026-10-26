import { Link, useLocation } from "react-router-dom";
import ListingCard from "../components/ListingCard";
import ListingsStatus from "../components/ListingsStatus";
import { useAuth, useListings } from "../store";

export default function MyListings() {
  const { user } = useAuth();
  const { listings, status } = useListings();
  const notice = useLocation().state?.notice;
  const mine = listings.filter((l) => l.owner === user.id);

  return (
    <main className="latest">
      <div className="section-head">
        <h1>My listings</h1>
        <Link className="btn btn-primary" to="/sell">Sell an item</Link>
      </div>
      {notice && <p className="notice" role="status">{notice}</p>}
      <ListingsStatus />
      {status.loading || status.error ? null : mine.length === 0 ? (
        <div className="empty"><p>You have no listings yet. <Link to="/sell">Sell your first item.</Link></p></div>
      ) : (
        <ul className="grid">{mine.map((l) => <ListingCard key={l.id} l={l} editable />)}</ul>
      )}
    </main>
  );
}
