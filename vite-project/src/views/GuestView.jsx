import { Navigate, Outlet } from "react-router-dom";

export default function GuestView() {
  return user ? <Navigate to="/" replace /> : <Outlet />;
}
