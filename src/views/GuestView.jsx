import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../store";

export default function GuestView() {
  const { user, loading } = useAuth();
  const { state } = useLocation();
  if (loading) return <main className="latest"><p className="count" role="status">Loading…</p></main>;
  return user ? <Navigate to={state?.from ?? "/"} replace /> : <Outlet />;
}
