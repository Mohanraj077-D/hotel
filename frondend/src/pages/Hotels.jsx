import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useHotels } from "../data/useHotels";

const hotelsPerPage = 6;

function Hotels() {
  const { hotels, loading, error } = useHotels();
  const [search, setSearch] = useState("");
  const [minPrice, setMinPrice] = useState("0");
  const [maxPrice, setMaxPrice] = useState("100000");
  const [currentPage, setCurrentPage] = useState(1);


  const filteredHotels = useMemo(
    () =>
      hotels.filter((hotel) => {
        const matchesSearch =
          hotel.name.toLowerCase().includes(search.toLowerCase()) ||
          hotel.city.toLowerCase().includes(search.toLowerCase());

        const matchesMinPrice = hotel.price >= Number(minPrice);
        const matchesMaxPrice = hotel.price <= Number(maxPrice);

        return matchesSearch && matchesMinPrice && matchesMaxPrice;
      }),
    [hotels, search, minPrice, maxPrice]
  );

  const totalPages = Math.max(1, Math.ceil(filteredHotels.length / hotelsPerPage));
  const visiblePage = Math.min(currentPage, totalPages);
  const visibleHotels = filteredHotels.slice(
    (visiblePage - 1) * hotelsPerPage,
    visiblePage * hotelsPerPage
  );

  return (
    <section className="section page-section">
      <Helmet>
        <title>Explore Hotels | TAJ Collection</title>
        <meta name="description" content="Browse curated hotels, filter by price, and book your ideal stay." />
      </Helmet>

      <div className="section-heading">
        <p className="gold-text">EXPLORE OUR COLLECTION</p>
        <h2>All Hotels</h2>
        <p>Find a stay that matches your style and budget.</p>
      </div>

      <div className="filters hotel-filter-grid">
        <input
          type="text"
          placeholder="Search hotel or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="range-filter">
          <label>Min Price: ₹{minPrice}</label>
          <input
            type="range"
            min="0"
            max="100000"
            step="500"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
        </div>
        <div className="range-filter">
          <label>Max Price: ₹{maxPrice}</label>
          <input
            type="range"
            min="0"
            max="100000"
            step="500"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>
      </div>

      {loading && <p className="center">Loading hotels...</p>}
      {error && <p className="center" role="alert">{error}</p>}

      {!loading && !error && <div className="hotel-grid">
        {visibleHotels.map((hotel) => (
          <div className="hotel-card" key={hotel.id}>
            <img src={hotel.image} alt={hotel.name} />

            <div className="card-body">
              <div className="rating">★ {hotel.rating}</div>
              <h3>{hotel.name}</h3>
              <p>📍 {hotel.city}</p>
              <p>{hotel.description}</p>
              <h3 className="price">₹{hotel.price} <small>/ night</small></h3>

              <div className="card-buttons">
                <Link to={`/hotel/${hotel.id}`} className="outline-btn">
                  Details
                </Link>
                <Link to={`/book/${hotel.id}`} className="gold-btn">
                  Book Now
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>}

      {!loading && !error && filteredHotels.length === 0 && (
        <p className="center">No hotels found. Try another search.</p>
      )}

      {!loading && !error && filteredHotels.length > hotelsPerPage && (
        <nav className="featured-pagination" aria-label="Hotel pages">
          <p>
            Showing {(visiblePage - 1) * hotelsPerPage + 1}–
            {Math.min(visiblePage * hotelsPerPage, filteredHotels.length)} of {filteredHotels.length} stays
          </p>
          <div className="featured-pagination-controls">
            <button
              type="button"
              className="featured-page-button featured-page-arrow"
              onClick={() => setCurrentPage(Math.max(1, visiblePage - 1))}
              disabled={visiblePage === 1}
            >
              ←
            </button>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
              <button
                type="button"
                key={page}
                className={`featured-page-button${visiblePage === page ? " is-active" : ""}`}
                onClick={() => setCurrentPage(page)}
              >
                {page.toString().padStart(2, "0")}
              </button>
            ))}
            <button
              type="button"
              className="featured-page-button featured-page-arrow"
              onClick={() => setCurrentPage(Math.min(totalPages, visiblePage + 1))}
              disabled={visiblePage === totalPages}
            >
              →
            </button>
          </div>
        </nav>
      )}
    </section>
  );
}

export default Hotels;