import { Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import GuestView from "./views/GuestView";
import LoggedUserView from "./views/LoggedUserView";
import { Login, Signup } from "./pages/Auth";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <>
      <Header />
      <Routes>
        {/* public */}
        {/*TBD example home with parts and fluids links
        <Route path="/" element={<Home />} />
        <Route path="/parts" element={<Browse key="part" kind="part" />} />
        <Route path="/fluids" element={<Browse key="fluid" kind="fluid" />} />
        */}
        {/* guests only: logged-in users are sent home */}
        <Route element={<GuestView />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Route>

        {/* logged-in users only: guests are sent to log in */}
        <Route element={<LoggedUserView />}>
          {/*TBD example sell and my-listings routes
          <Route path="/sell" element={<Sell />} />
          <Route path="/my-listings" element={<MyListings />} />
        */}
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}