import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="logo">TAJ<span></span></Link>

      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/hotels">All Hotels</Link>
        <Link to="/manage">Manage Hotels</Link>
      </div>

      <Link to="/add-hotel" className="nav-btn">Add Hotel</Link>
    </nav>
  );
}

export default Navbar;