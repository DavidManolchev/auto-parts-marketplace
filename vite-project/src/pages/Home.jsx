import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Finder from "../components/Finder";
import ListingCard from "../components/ListingCard";
import ListingsStatus from "../components/ListingsStatus";
import { useAuth, useListings } from "../store";

export default function Home() {
  const { user } = useAuth();
  const { listings, status } = useListings();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState({ make: "", model: "", year: "", q: "" });

  const latest = [...listings].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);

  const search = () => {
    const params = new URLSearchParams(Object.entries(vehicle).filter(([, v]) => v));
    navigate({ pathname: "/parts", search: params.toString() });
  };

  return (
    <>
      <section className="finder">
        <h1>Find parts that fit your car</h1>
        <Finder value={vehicle} onChange={setVehicle} onSubmit={search} />
        <div className="hero-actions">
          <Link className="btn btn-dark" to="/parts">Browse parts</Link>
          <Link className="btn btn-outline" to="/fluids">Browse fluids</Link>
          {user ? (
            <Link className="btn btn-outline" to="/sell">Sell an item</Link>
          ) : (
            <Link className="btn btn-outline" to="/signup">Sign up to sell</Link>
          )}
        </div>
      </section>

      <section className="latest">
        <div className="section-head">
          <h2>Latest offers</h2>
          <span><Link to="/parts">All parts</Link> or <Link to="/fluids">all fluids</Link></span>
        </div>
        <ListingsStatus />
        {!status.loading && !status.error && latest.length === 0 ? (
          <div className="empty">
            <p>
              No offers yet.{" "}
              {user ? <Link to="/sell">List the first item.</Link> : <><Link to="/signup">Sign up</Link> to list the first item.</>}
            </p>
          </div>
        ) : (
          <ul className="grid">
            {latest.map((l) => <ListingCard key={l.id} l={l} />)}
          </ul>
        )}
      </section>
    </>
  );
}
