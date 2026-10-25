import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function LoggedUserView() {
  const { pathname } = useLocation();
  return user ? <Outlet /> : <Navigate to="/login" replace state={{ from: pathname }} />;
}
