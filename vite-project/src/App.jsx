import { useEffect, useMemo, useRef, useState } from "react";

export default function App() {
  return (
    <>
      <header className="topbar">
        <a className="brand" href="/">APM</a>
        <nav aria-label="Main">
          <a href="#listings">Browse parts</a>
          <a href="#listings">Browse fluids</a>
          <a href="#listings">My listings</a>
        </nav>
        <button className="btn btn-primary" onClick={() => setSignupOpen(true)}>Sign up</button> {/*appear only if user is not logged in*/}
        <button className="btn btn-primary" onClick={() => setLoginOpen(true)}>Log in</button> {/*appear only if user is not logged in*/}
        <button className="btn btn-primary" onClick={() => setLogoutOpen(true)}>Log out</button> {/*appear only if user is logged in*/}
        <button className="btn btn-primary" onClick={() => setSellOpen(true)}>Sell a part</button> {/*appear only if user is logged in*/}
      </header>

      <section className="finder">
        <h1>Find parts that fit your car</h1>
        <form className="finder-form" onSubmit={(e) => e.preventDefault()}>
          <label>
            Make
            <select>
              <option value="someOption">Some option</option>
              <option value="otherOption">Other option</option>
            </select>
          </label>
          <label>
            Model
            <select>
              <option value="someOption">Some option</option>
              <option value="otherOption">Other option</option>
            </select>
          </label>
          <label>
            Year
            <select>
              <option value="someOption">Some option</option>
              <option value="otherOption">Other option</option>
            </select>
          </label>
          <label className="grow">
            Part name or number
            <input type="search" placeholder="Brake disc, BD-28041…" value="" />
          </label>
        </form>
      </section>
    </>
  );
}