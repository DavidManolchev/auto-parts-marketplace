import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../store";

export default function ContactSeller({ contact }) {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const [shown, setShown] = useState(false);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(contact);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
    }
  };

  if (!user) return <Link className="btn btn-outline" to="/login" state={{ from: pathname }}>Log in to contact seller</Link>;
  if (!contact) return null;
  if (!shown) return <button className="btn btn-outline" onClick={() => setShown(true)}>Contact seller</button>;

  return (
    <div className="contact">
      <span className="contact-email">{contact}</span>
      <button className="btn btn-outline" onClick={copy}>{copied ? "Copied" : "Copy email"}</button>
    </div>
  );
}
