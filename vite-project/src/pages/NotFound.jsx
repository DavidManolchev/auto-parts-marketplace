import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="panel">
      <h1>Page not found</h1>
      <p>The page you opened doesn't exist. <Link to="/">Go to the home page.</Link></p>
    </div>
  );
}
