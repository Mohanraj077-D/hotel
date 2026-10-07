import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { createHotel, updateHotel, uploadImage } from "../data/api";

const emptyHotelForm = {
  name: "",
  city: "",
  price: "",
  rating: "",
  rooms: "",
  type: "",
  amenities: "",
  bestFor: "",
  image: "",
  latitude: "",
  longitude: "",
  description: "",
};

function AddHotel() {
  const navigate = useNavigate();
  const location = useLocation();
  const hotelToEdit = location.state?.hotelToEdit || null;

  const [hotelForm, setHotelForm] = useState(emptyHotelForm);
  const [imagePreview, setImagePreview] = useState("");
  const [hotelMessage, setHotelMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (hotelToEdit) {
      setHotelForm({
        ...hotelToEdit,
        price: String(hotelToEdit.price),
        rating: String(hotelToEdit.rating),
        rooms: String(hotelToEdit.rooms),
        latitude: String(hotelToEdit.latitude ?? ""),
        longitude: String(hotelToEdit.longitude ?? ""),
      });
      setImagePreview(hotelToEdit.image || "");
    }
  }, [hotelToEdit]);

  function handleHotelChange(event) {
    setHotelForm({ ...hotelForm, [event.target.name]: event.target.value });
  }

  async function handleImageUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/") || file.size > 50 * 1024 * 1024) {
      setHotelMessage("Please choose an image smaller than 50 MB.");
      event.target.value = "";
      return;
    }

    try {
      setHotelMessage("Uploading image...");
      const imageUrl = await uploadImage(file);
      setImagePreview(imageUrl);
      setHotelForm((current) => ({ ...current, image: imageUrl }));
      setHotelMessage("Image uploaded successfully.");
    } catch (error) {
      setHotelMessage(`Upload failed: ${error.message}`);
    }
  }

  function validateHotelForm() {
    const name = hotelForm.name.trim();
    const description = hotelForm.description.trim();
    const latitude = Number(hotelForm.latitude);
    const longitude = Number(hotelForm.longitude);
    const price = Number(hotelForm.price);

    if (!name || name.length < 3) {
      setHotelMessage("Hotel name must be at least 3 characters long.");
      return false;
    }

    if (!description || description.length < 20) {
      setHotelMessage("Description must be at least 20 characters long.");
      return false;
    }

    if (hotelForm.latitude === "" || hotelForm.longitude === "" || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      setHotelMessage("Latitude and longitude are required for the hotel location map.");
      return false;
    }

    if (!hotelForm.image || !Number.isFinite(price) || price <= 0) {
      setHotelMessage("Add a valid image URL or upload and set a positive price.");
      return false;
    }

    return true;
  }

  async function saveHotel(event) {
    event.preventDefault();

    if (!validateHotelForm()) return;

    setLoading(true);
    const hotelData = {
      name: hotelForm.name.trim(),
      city: hotelForm.city.trim(),
      price: Number(hotelForm.price),
      rating: Number(hotelForm.rating),
      rooms: Number(hotelForm.rooms),
      type: hotelForm.type.trim(),
      amenities: hotelForm.amenities.trim(),
      bestFor: hotelForm.bestFor.trim(),
      description: hotelForm.description.trim(),
      image: hotelForm.image || imagePreview,
      latitude: Number(hotelForm.latitude),
      longitude: Number(hotelForm.longitude),
    };

    try {
      if (hotelToEdit) {
        await updateHotel(hotelToEdit.id, hotelData);
      } else {
        await createHotel(hotelData);
      }
      setHotelMessage(hotelToEdit ? "Hotel details updated." : "Hotel added to your collection.");
      setTimeout(() => navigate("/manage"), 1000);
    } catch (error) {
      setHotelMessage(`Could not save hotel: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="section page-section">
      <Helmet>
        <title>{hotelToEdit ? "Edit Hotel" : "Add Hotel"} | TAJ Collection</title>
        <meta name="description" content="Add a new hotel to the TAJ collection or update existing ones." />
      </Helmet>
      <section className="hotel-crud">
        <div className="hotel-crud-heading">
          <div>
            <p className="gold-text">COLLECTION STUDIO</p>
            <h2>{hotelToEdit ? "Edit Your Hotel" : "Add Your Hotels"}</h2>
            <p>Add a new destination or refresh the details guests see.</p>
          </div>
        </div>

        <form id="hotel-editor" className="hotel-editor" onSubmit={saveHotel}>
          <div className="hotel-editor-title">
            <span className="hotel-editor-mark">{hotelToEdit ? "✦" : "+"}</span>
            <div>
              <h3>{hotelToEdit ? "Edit stay details" : "Add a new stay"}</h3>
              <p>Make every detail feel like a destination.</p>
            </div>
          </div>

          <div className="hotel-form-grid">
            <label>
              Hotel name
              <input name="name" value={hotelForm.name} onChange={handleHotelChange} placeholder="e.g. The Cedar House" required />
            </label>
            <label>
              City / destination
              <input name="city" value={hotelForm.city} onChange={handleHotelChange} placeholder="e.g. Coorg" required />
            </label>
            <label>
              Price per night (₹)
              <input name="price" type="number" min="1" value={hotelForm.price} onChange={handleHotelChange} required />
            </label>
            <label>
              Guest rating
              <input name="rating" type="number" min="1" max="5" step="0.1" value={hotelForm.rating} onChange={handleHotelChange} required />
            </label>
            <label>
              Available rooms
              <input name="rooms" type="number" min="1" value={hotelForm.rooms} onChange={handleHotelChange} required />
            </label>
            <label>
              Stay style
              <input name="type" value={hotelForm.type} onChange={handleHotelChange} placeholder="e.g. Forest Retreat" required />
            </label>
            <label className="hotel-form-wide">
              Amenities <span>(separate with commas)</span>
              <input name="amenities" value={hotelForm.amenities} onChange={handleHotelChange} placeholder="Breakfast, Garden, Free WiFi" required />
            </label>
            <label className="hotel-form-wide">
              Best for
              <input name="bestFor" value={hotelForm.bestFor} onChange={handleHotelChange} placeholder="Quiet weekends and nature walks" required />
            </label>
            <label className="hotel-form-wide">
              Latitude
              <input name="latitude" type="number" step="0.0001" value={hotelForm.latitude} onChange={handleHotelChange} placeholder="12.9716" required />
            </label>
            <label className="hotel-form-wide">
              Longitude
              <input name="longitude" type="number" step="0.0001" value={hotelForm.longitude} onChange={handleHotelChange} placeholder="77.5946" required />
            </label>
            <label className="hotel-form-wide">
              Image URL or upload
              <input name="image" type="text" value={hotelForm.image} onChange={handleHotelChange} placeholder="https://... or /images/hotel.jpg" required />
            </label>
            <div className="hotel-form-wide hotel-upload-box">
              <span>Upload image</span>
              <input type="file" accept="image/*" onChange={handleImageUpload} />
              {imagePreview && <img src={imagePreview} alt="Hotel preview" className="hotel-form-preview" style={{ width: "120px", height: "80px", objectFit: "cover", borderRadius: "10px" }} />}
            </div>
            <label className="hotel-form-wide">
              Short description
              <textarea name="description" value={hotelForm.description} onChange={handleHotelChange} rows="3" placeholder="Describe the feeling of staying here..." required />
            </label>
          </div>

          <div className="hotel-editor-actions">
            <button className="gold-btn" type="submit" disabled={loading}>
              {hotelToEdit ? "Save changes" : "Add to collection"}
            </button>
            <button className="hotel-cancel-edit" type="button" onClick={() => navigate("/manage")}>
              Cancel
            </button>
          </div>
        </form>

        {hotelMessage && <p className="hotel-crud-message" role="status">{hotelMessage}</p>}
      </section>
    </section>
  );
}

export default AddHotel;
