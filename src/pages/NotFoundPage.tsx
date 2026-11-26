import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <main className="page-container not-found">
      <h1>404</h1>
      <h2>Page not found</h2>
      <Link to="/">Back to Expenses</Link>
    </main>
  );
}