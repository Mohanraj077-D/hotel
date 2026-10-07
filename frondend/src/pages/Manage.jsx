import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  cancelBooking as cancelBookingRequest,
  deleteHotel as removeHotel,
  fetchBookings,
} from "../data/api";
import { useHotels } from "../data/useHotels";


function Manage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [booking, setBooking] = useState(null);
  const { hotels, setHotels, loading, error: hotelsError, reloadHotels } = useHotels();
  const [hotelMessage, setHotelMessage] = useState("");
  const [bookingMessage, setBookingMessage] = useState("");

  async function findBooking() {
    setBookingMessage("");
    setBooking(null);
    try {
      const bookings = await fetchBookings();
      const found = bookings.find(
        (item) => item.id.toLowerCase() === search.trim().toLowerCase() ||
          item.phone === search.trim()
      );
      setBooking(found || "notfound");
    } catch (error) {
      setBookingMessage(error.message);
    }
  }

  async function cancelBooking() {
    setBookingMessage("");
    try {
      setBooking(await cancelBookingRequest(booking.id));
    } catch (error) {
      setBookingMessage(error.message);
    }
  }


  function editHotel(hotel) {
    navigate("/add-hotel", { state: { hotelToEdit: hotel } });
  }

  async function deleteHotel(hotelId) {
    const hotelToDelete = hotels.find((hotel) => hotel.id === hotelId);
    if (!window.confirm(`Remove ${hotelToDelete.name} from the hotel collection?`)) return;

    try {
      await removeHotel(hotelId);
      setHotels(hotels.filter((hotel) => hotel.id !== hotelId));
      setHotelMessage(`${hotelToDelete.name} was removed.`);
      window.alert(`${hotelToDelete.name} was removed successfully.`);
    } catch (error) {
      setHotelMessage(`Could not remove hotel: ${error.message}`);
    }
  }

  return (
    <section className="section page-section">
      <Helmet>
        <title>Manage Booking | TAJ Collection</title>
        <meta name="description" content="Search for bookings and manage hotel collection records." />
      </Helmet>

      <div className="section-heading">
        <p className="gold-text">BOOKING ASSISTANCE</p>
        <h2>Manage Your Booking</h2>
        <p>Find your reservation using booking ID or phone number.</p>
      </div>

      <div className="manage-box">
        <input
          placeholder="Enter Booking ID or Phone Number"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button className="gold-btn" onClick={findBooking}>
          Search Booking
        </button>

        {bookingMessage && <p role="alert">{bookingMessage}</p>}
        {booking === "notfound" && <p>No booking found. Please check your details.</p>}

        {booking && booking !== "notfound" && (
          <div className="booking-result">
            <h2>Booking Details</h2>
            <p><b>Booking ID:</b> {booking.id}</p>
            <p><b>Name:</b> {booking.name}</p>
            <p><b>Phone:</b> {booking.phone}</p>
            <p><b>Hotel:</b> {booking.hotel}</p>
            <p><b>Room:</b> {booking.room}</p>
            <p><b>Check-in:</b> {booking.checkin}</p>
            <p><b>Check-out:</b> {booking.checkout}</p>
            <p><b>Total:</b> ₹{booking.total}</p>
            <p><b>Status:</b> {booking.status}</p>

            {booking.status === "Confirmed" && (
              <button className="cancel-btn" onClick={cancelBooking}>
                Cancel Booking
              </button>
            )}
          </div>
        )}
      </div>

      <section className="hotel-crud">
        <div className="hotel-crud-heading">
          <div>
            <p className="gold-text">COLLECTION STUDIO</p>
            <h2>Add Your Hotels</h2>
            <p>Add a new destination or refresh the details guests see.</p>
          </div>
          <div className="hotel-count">
            <strong>{hotels.length.toString().padStart(2, "0")}</strong>
            <span>STAYS</span>
          </div>
        </div>

        {loading && <p>Loading hotels...</p>}
        {hotelsError && (
          <p role="alert">
            {hotelsError} <button type="button" onClick={reloadHotels}>Try again</button>
          </p>
        )}


        {hotelMessage && <p className="hotel-crud-message" role="status">{hotelMessage}</p>}

        <div className="managed-hotels-heading">
          <h3>Current collection</h3>
          <span>{hotels.length} {hotels.length === 1 ? "property" : "properties"}</span>
        </div>
        <div className="managed-hotel-list">
          {hotels.map((hotel) => (
            <article className="managed-hotel-card" key={hotel.id}>
              <img src={hotel.image} alt={hotel.name} />
              <div className="managed-hotel-info">
                <span className="managed-hotel-type">{hotel.type}</span>
                <h4>{hotel.name}</h4>
                <p>{hotel.city} · ₹{hotel.price.toLocaleString("en-IN")} / night · {hotel.rooms} rooms</p>
                <span className="managed-hotel-rating">★ {hotel.rating} guest rating</span>
              </div>
              <div className="managed-hotel-actions">
                <button type="button" onClick={() => editHotel(hotel)}>Edit</button>
                <button className="managed-delete" type="button" onClick={() => deleteHotel(hotel.id)}>Remove</button>
              </div>
            </article>
          ))}
          {hotels.length === 0 && (
            <div className="hotel-empty-state">
              <span>✦</span>
              <p>Your collection is waiting for its first stay.</p>
            </div>
          )}
        </div>
      </section>
    </section>
  );
}

export default Manage;