import { Link, NavLink, useNavigate } from "react-router-dom";
{/*import { useAuth } from "../store"; TBD*/ }

export default function Header() {
  {/*const { user, logout } = useAuth(); TBD*/ }
  const navigate = useNavigate();
  const signOut = () => {
    navigate("/");
    logout();
  };

  return (
    <header className="topbar">
      <Link className="brand" to="/">APM</Link>
      <nav aria-label="Main">
        <NavLink to="/parts">Browse parts</NavLink>
        <NavLink to="/fluids">Browse fluids</NavLink>
        {user && <NavLink to="/my-listings">My listings</NavLink>}
      </nav>
      <div className="actions-nav">
        {user ? (
          <>
            <Link className="btn btn-primary" to="/sell">Sell an item</Link>
            <button className="btn btn-outline" onClick={signOut}>Log out</button>
          </>
        ) : (
          <>
            <Link className="btn btn-outline" to="/signup">Sign up</Link>
            <Link className="btn btn-primary" to="/login">Log in</Link>
          </>
        )}
      </div>
    </header>
  );
}
