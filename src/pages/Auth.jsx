import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../store";

function AuthForm({ mode }) {
  const isSignup = mode === "signup";
  const { logIn, signUp } = useAuth();
  const [f, setF] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!f.email.includes("@") || !f.password) return setError("Enter a valid email and your password.");
    if (isSignup && (!f.name.trim() || f.password.length < 8))
      return setError("Add your name and a password of at least 8 characters.");
    setBusy(true);
    setError("");
    try {
      if (isSignup) {
        const { needsConfirmation } = await signUp({ name: f.name.trim(), email: f.email.trim(), password: f.password });
        if (needsConfirmation) setConfirm(true);
      } else {
        await logIn({ email: f.email.trim(), password: f.password });
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  };

  if (confirm)
    return (
      <div className="panel">
        <h1>Check your email</h1>
        <p>We sent a confirmation link to {f.email}. Open it, then <Link to="/login">log in</Link>.</p>
      </div>
    );

  return (
    <div className="panel">
      <h1>{isSignup ? "Create your account" : "Log in"}</h1>
      <form onSubmit={submit}>
        {isSignup && <label>Name<input value={f.name} onChange={set("name")} autoComplete="name" /></label>}
        <label>Email<input type="email" value={f.email} onChange={set("email")} autoComplete="email" /></label>
        <label>
          Password
          <input type="password" value={f.password} onChange={set("password")} autoComplete={isSignup ? "new-password" : "current-password"} />
        </label>
        {error && <p className="error" role="alert">{error}</p>}
        <button className="btn btn-primary" type="submit" disabled={busy}>
          {busy ? "Please wait…" : isSignup ? "Sign up" : "Log in"}
        </button>
      </form>
      <p className="alt">
        {isSignup ? <>Already have an account? <Link to="/login">Log in</Link></> : <>New here? <Link to="/signup">Sign up</Link></>}
      </p>
    </div>
  );
}

export const Login = () => <AuthForm mode="login" />;
export const Signup = () => <AuthForm mode="signup" />;
