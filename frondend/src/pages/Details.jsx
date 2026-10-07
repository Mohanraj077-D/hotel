import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { getRoomOptions } from "../data/rooms";
import { useHotels } from "../data/useHotels";

function Details() {
  const { hotels, loading, error } = useHotels();
  const [activePhoto, setActivePhoto] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const { id } = useParams();
  const hotel = hotels.find((h) => h.id === Number(id));

  if (loading) return <h2 className="center">Loading hotel...</h2>;
  if (error) return <h2 className="center" role="alert">{error}</h2>;
  if (!hotel) return <h2 className="center">Hotel not found</h2>;

  const rooms = getRoomOptions(hotel);
  const photos = [
    { label: hotel.name, image: hotel.image },
    ...rooms.map((room) => ({ label: room.name, image: room.image })),
  ];
  const latitude = Number(hotel.latitude ?? 13.0827);
  const longitude = Number(hotel.longitude ?? 80.2707);
  const mapUrl = `https://www.google.com/maps?q=${latitude},${longitude}&z=12&output=embed`;

  const showPhoto = (index) => {
    setActivePhoto((index + photos.length) % photos.length);
  };

  return (
    <section className="section page-section">
      <Helmet>
        <title>{hotel.name} | TAJ Collection</title>
        <meta name="description" content={`View room options, amenities, and location details for ${hotel.name}.`} />
      </Helmet>
      <div className="hotel-gallery" aria-label={`${hotel.name} photos`}>
        <div className="hotel-gallery-main">
          <img
            src={photos[activePhoto].image}
            alt={`${hotel.name} - ${photos[activePhoto].label}`}
          />
          <span className="hotel-gallery-label">{photos[activePhoto].label}</span>
          <button
            className={`gallery-save${isSaved ? " is-saved" : ""}`}
            type="button"
            aria-label={isSaved ? "Remove from saved photos" : "Save photo"}
            aria-pressed={isSaved}
            onClick={() => setIsSaved((saved) => !saved)}
          >
            {isSaved ? "♥" : "♡"}
          </button>
          <button
            className="gallery-arrow gallery-arrow-prev"
            type="button"
            aria-label="Previous photo"
            onClick={() => showPhoto(activePhoto - 1)}
          >
            ‹
          </button>
          <button
            className="gallery-arrow gallery-arrow-next"
            type="button"
            aria-label="Next photo"
            onClick={() => showPhoto(activePhoto + 1)}
          >
            ›
          </button>
          <span className="gallery-counter">
            {activePhoto + 1}/{photos.length}
          </span>
        </div>
        <div className="hotel-gallery-thumbnails">
          {photos.map((photo, index) => (
            <button
              className={`gallery-thumbnail${index === activePhoto ? " is-active" : ""}`}
              key={photo.label}
              type="button"
              aria-label={`Show ${photo.label}`}
              aria-current={index === activePhoto ? "true" : undefined}
              onClick={() => showPhoto(index)}
            >
              <img src={photo.image} alt="" />
              <span>{photo.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="details-content">
        <p className="gold-text">TAJ EXCLUSIVE COLLECTION</p>
        <h1>{hotel.name}</h1>
        <p>📍 {hotel.city}</p>
        <div className="rating">★ {hotel.rating} / 5</div>
        <p>{hotel.description}</p>

        <h2>Facilities & Amenities</h2>
        <div className="amenities">
          {hotel.amenities.split(",").map((item) => (
            <span key={item}>✓ {item.trim()}</span>
          ))}
        </div>

        <h2>Choose Your Room</h2>

        <div className="room-options">
          {rooms.map((room) => (
            <article className="room-option-card" key={room.name}>
              <img src={room.image} alt={`${room.name} at ${hotel.name}`} />
              <div className="room-option-content">
                <div className="room-option-heading">
                  <h3>{room.name}</h3>
                  <p className="room-option-price">
                    ₹{room.price.toLocaleString("en-IN")} <span>/ night</span>
                  </p>
                </div>
                <p>Up to {room.guests} guest{room.guests === 1 ? "" : "s"}</p>
                <p>{room.facilities}</p>
                <Link
                  to={`/book/${hotel.id}?room=${encodeURIComponent(room.name)}`}
                  className="gold-btn"
                >
                  Book this room →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="hotel-map-card">
        <h3>Location map</h3>
        <iframe
          title={`${hotel.name} location`}
          src={mapUrl}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
        <p>
          Coordinates: {latitude.toFixed(4)}, {longitude.toFixed(4)}
        </p>
      </div>

      <div className="review-card">
        <h3>Guest Reviews</h3>
        <div className="rating">★★★★★</div>
        <p>"Wonderful stay, excellent hospitality and beautiful rooms."</p>
        <small>Sample guest review</small>
      </div>
    </section>
  );
}

export default Details;