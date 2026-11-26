import { NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <h2 className="logo">TripSplit</h2>

        <div className="nav-links">
          <NavLink to="/" end>
            Expenses
          </NavLink>

          <NavLink to="/expenses/new">
            Add Expense
          </NavLink>
        </div>
      </div>
    </nav>
  );
}