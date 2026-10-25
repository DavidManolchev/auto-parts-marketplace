import { Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import GuestView from "./views/GuestView";
import LoggedUserView from "./views/LoggedUserView";
import Home from "./pages/Home";
import Browse from "./pages/Browse";
import { Login, Signup } from "./pages/Auth";
import Sell from "./pages/Sell";
import EditListing from "./pages/EditListing";
import MyListings from "./pages/MyListings";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <>
      <Header />
      <Routes>
        {/* public */}
        <Route path="/" element={<Home />} />
        <Route path="/parts" element={<Browse key="part" kind="part" />} />
        <Route path="/fluids" element={<Browse key="fluid" kind="fluid" />} />

        {/* guests only: logged-in users are sent home */}
        <Route element={<GuestView />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Route>

        {/* logged-in users only: guests are sent to log in */}
        <Route element={<LoggedUserView />}>
          <Route path="/sell" element={<Sell />} />
          <Route path="/listings/:id/edit" element={<EditListing />} />
          <Route path="/my-listings" element={<MyListings />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
