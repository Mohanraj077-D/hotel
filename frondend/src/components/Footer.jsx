import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div>
          <h2>TAJ<span></span></h2>
          <p>Your journey deserves a beautiful stay.</p>
        </div>

        <div>
          <h3>Explore</h3>
          <Link to="/">Home</Link>
          <Link to="/hotels">All Hotels</Link>
        </div>

        <div>
          <h3>For Booking</h3>
          <Link to="/hotels">Book a Room</Link>
          <Link to="/manage">Manage Booking</Link>
          <p>Support: +91 98765 43210</p>
        </div>

        <div>
          <h3>Connect With Us</h3>
          <p>Instagram · Facebook</p>
          <p>Email: support@tajstay.com</p>
        </div>
      </div>

    </footer>
  );
}

export default Footer;