import { useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { createBooking } from "../data/api";
import { getRoomOptions } from "../data/rooms";
import { useHotels } from "../data/useHotels";

function Booking() {
  const { hotels, loading, error: hotelsError } = useHotels();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const hotel = hotels.find((h) => h.id === Number(id));
  const roomOptions = hotel ? getRoomOptions(hotel) : [];
  const requestedRoom = searchParams.get("room");
  const initialRoom = roomOptions.find((room) => room.name === requestedRoom)?.name
    ?? roomOptions[0]?.name
    ?? "";

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    room: initialRoom,
    checkin: "",
    checkout: "",
    payment: "Cash"
  });

  const [booking, setBooking] = useState(null);
  const [bookingError, setBookingError] = useState("");
  const [saving, setSaving] = useState(false);

  if (loading) return <h2 className="center">Loading hotel...</h2>;
  if (hotelsError) return <h2 className="center" role="alert">{hotelsError}</h2>;

  if (!hotel) return <h2 className="center">Hotel not found</h2>;

  const selectedRoomName = form.room || initialRoom;
  const selectedRoom = roomOptions.find((room) => room.name === selectedRoomName) ?? roomOptions[0];
  const nights =
    form.checkin && form.checkout
      ? Math.round(
          (new Date(form.checkout) - new Date(form.checkin)) /
          (1000 * 60 * 60 * 24)
        )
      : 0;

  const total = nights > 0 ? nights * selectedRoom.price : 0;

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleBooking(e) {
    e.preventDefault();
    setBookingError("");

    if (form.phone.length !== 10 || !/^[0-9]+$/.test(form.phone)) {
      alert("Enter a valid 10-digit phone number");
      return;
    }

    if (nights <= 0) {
      alert("Check-out must be after check-in");
      return;
    }

    setSaving(true);
    try {
      const savedBooking = await createBooking({
        hotelId: hotel.id,
        customerName: form.name,
        phone: form.phone,
        address: form.address,
        roomType: selectedRoomName,
        checkin: form.checkin,
        checkout: form.checkout,
        paymentMethod: form.payment,
        totalAmount: total,
      });

      setBooking({
        ...savedBooking,
        hotel: hotel.name,
        pricePerNight: selectedRoom.price,
        nights,
      });
    } catch (saveError) {
      setBookingError(saveError.message);
    } finally {
      setSaving(false);
    }
  }

  if (booking) {
    return (
      <section className="section receipt">
        <Helmet>
          <title>Booking Confirmed | TAJ Collection</title>
          <meta name="description" content="Your TAJ stay has been successfully booked." />
        </Helmet>
        <div className="receipt-card">
          <div className="success">✓</div>
          <h1>Booking Confirmed!</h1>
          <p>Your TAJ stay has been successfully booked.</p>

          <hr />

          <h2>TAJ E-RECEIPT</h2>
          <p><b>Booking ID:</b> {booking.id}</p>
          <p><b>Customer:</b> {booking.name}</p>
          <p><b>Phone:</b> {booking.phone}</p>
          <p><b>Address:</b> {booking.address}</p>
          <p><b>Hotel:</b> {booking.hotel}</p>
          <p><b>Room:</b> {booking.room}</p>
            <p><b>Price per night:</b> ₹{booking.pricePerNight.toLocaleString("en-IN")}</p>
          <p><b>Check-in:</b> {booking.checkin}</p>
          <p><b>Check-out:</b> {booking.checkout}</p>
          <p><b>Total Nights:</b> {booking.nights}</p>
          <p><b>Payment:</b> {booking.payment}</p>
          <h2 className="price">Total: ₹{booking.total}</h2>
          <p>Status: {booking.status}</p>

          <button className="gold-btn" onClick={() => window.print()}>
            Print Receipt
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="section booking-section">
      <Helmet>
        <title>Book Your Stay | TAJ Collection</title>
        <meta name="description" content="Reserve your room and confirm your booking details." />
      </Helmet>
      <div className="section-heading">
        <p className="gold-text">YOUR JOURNEY STARTS HERE</p>
        <h2>Book Your Stay</h2>
        <p>{hotel.name} · {hotel.city}</p>
      </div>

      <form className="booking-form" onSubmit={handleBooking}>
        {bookingError && <p className="form-error" role="alert">{bookingError}</p>}
        <label>Customer Name</label>
        <input name="name" value={form.name} onChange={handleChange} required />

        <label>Phone Number</label>
        <input
          name="phone"
          type="tel"
          maxLength="10"
          value={form.phone}
          onChange={handleChange}
          required
        />

        <label>Address</label>
        <textarea
          name="address"
          value={form.address}
          onChange={handleChange}
          required
        />

        <label>Hotel Name</label>
        <input value={hotel.name} readOnly />

        <label>Room Type</label>
        <select name="room" value={selectedRoomName} onChange={handleChange}>
          {roomOptions.map((room) => (
            <option key={room.name} value={room.name}>
              {room.name} · ₹{room.price.toLocaleString("en-IN")} / night
            </option>
          ))}
        </select>

        <label>Check-in Date</label>
        <input
          type="date"
          name="checkin"
          min={new Date().toISOString().split("T")[0]}
          value={form.checkin}
          onChange={handleChange}
          required
        />

        <label>Check-out Date</label>
        <input
          type="date"
          name="checkout"
          min={form.checkin || new Date().toISOString().split("T")[0]}
          value={form.checkout}
          onChange={handleChange}
          required
        />

        <label>Payment Method</label>
        <select name="payment" value={form.payment} onChange={handleChange}>
          <option value="Cash">Cash</option>
          <option value="UPI">UPI</option>
        </select>

        <div className="total-box">
          <p>Price per night: ₹{selectedRoom.price.toLocaleString("en-IN")}</p>
          <p>Total Nights: {nights > 0 ? nights : 0}</p>
          <h2>Total Amount: ₹{total}</h2>
        </div>

        <button type="submit" className="gold-btn full-btn" disabled={saving}>
          {saving ? "Saving..." : "Confirm Booking"}
        </button>
      </form>
    </section>
  );
}

export default Booking;