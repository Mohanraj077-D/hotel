import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useHotels } from "../data/useHotels";

function Home() {
  const { hotels, loading, error } = useHotels();
  const [currentPage, setCurrentPage] = useState(1);
  const hotelsPerPage = 3;
  const pageCount = Math.ceil(hotels.length / hotelsPerPage);
  const visibleHotels = hotels.slice(
    (currentPage - 1) * hotelsPerPage,
    currentPage * hotelsPerPage
  );

  return (
    <>
      <Helmet>
        <title>TAJ Collection | Luxury stays</title>
        <meta name="description" content="Find the perfect hotel for your next getaway in India." />
      </Helmet>
      <section className="hero">
        <div className="hero-content">
          <p className="gold-text">WELCOME TO TAJ COLLECTION</p>
          <h1>Discover Your<br />Perfect Stay.</h1>
          <p>Luxury stays. Beautiful destinations. Unforgettable memories.</p>
          <Link to="/hotels" className="gold-btn">Explore Hotels →</Link>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <p className="gold-text">HANDPICKED FOR YOU</p>
          <h2>Featured Hotels</h2>
          <p>Find your perfect destination from our exclusive collection.</p>
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
                <h3 className="price">₹{hotel.price} <small>/ night</small></h3>

                <div className="card-buttons">
                  <Link to={`/hotel/${hotel.id}`} className="outline-btn">
                    View Details
                  </Link>
                  <Link to={`/book/${hotel.id}`} className="gold-btn">
                    Book Now
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>}

        {!loading && !error && pageCount > 1 && (
          <nav className="featured-pagination" aria-label="Featured hotel pages">
            <p>
              Showing {(currentPage - 1) * hotelsPerPage + 1}–
              {Math.min(currentPage * hotelsPerPage, hotels.length)} of {hotels.length} stays
            </p>
            <div className="featured-pagination-controls">
              <button
                type="button"
                className="featured-page-button featured-page-arrow"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                aria-label="Previous page"
              >
                ←
              </button>
              {Array.from({ length: pageCount }, (_, index) => index + 1).map((page) => (
                <button
                  type="button"
                  className={`featured-page-button${currentPage === page ? " is-active" : ""}`}
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  aria-label={`Page ${page}`}
                  aria-current={currentPage === page ? "page" : undefined}
                >
                  {page.toString().padStart(2, "0")}
                </button>
              ))}
              <button
                type="button"
                className="featured-page-button featured-page-arrow"
                onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))}
                disabled={currentPage === pageCount}
                aria-label="Next page"
              >
                →
              </button>
            </div>
          </nav>
        )}
      </section>

    </>
  );
}

export default Home;