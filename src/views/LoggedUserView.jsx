import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../store";

export default function LoggedUserView() {
  const { user, loading } = useAuth();
  const { pathname } = useLocation();
  if (loading) return <main className="latest"><p className="count" role="status">Loading…</p></main>;
  return user ? <Outlet /> : <Navigate to="/login" replace state={{ from: pathname }} />;
}
