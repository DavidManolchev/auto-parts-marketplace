import { Link, useParams } from "react-router-dom";
import ListingsStatus from "../components/ListingsStatus";
import { useAuth, useListings } from "../store";
import Sell from "./Sell";

export default function EditListing() {
  const { id } = useParams();
  const { user } = useAuth();
  const { listings, status } = useListings();

  if (status.loading || status.error) return <main className="latest"><ListingsStatus /></main>;

  const listing = listings.find((l) => String(l.id) === id && l.owner === user.id);
  if (!listing)
    return (
      <div className="panel">
        <h1>Listing not found</h1>
        <p>It may have been removed. <Link to="/my-listings">Back to my listings.</Link></p>
      </div>
    );

  return <Sell key={listing.id} listing={listing} />;
}
