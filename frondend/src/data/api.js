import { createRoomOptions, setRoomTypes } from "./rooms";

const API_URL = import.meta.env.VITE_API_URL || "/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Could not connect to the server.");
  }

  return data;
}

function mapHotel(hotel) {
  const mappedHotel = {
    ...hotel,
    bestFor: hotel.best_for ?? hotel.bestFor ?? "",
    latitude: Number(hotel.latitude),
    longitude: Number(hotel.longitude),
    price: Number(hotel.price),
    rating: Number(hotel.rating),
    rooms: Number(hotel.rooms),
  };

  mappedHotel.roomOptions = createRoomOptions(mappedHotel.price);
  return mappedHotel;
}

function mapBooking(booking) {
  return {
    ...booking,
    id: String(booking.id),
    name: booking.customer_name,
    phone: booking.phone,
    address: booking.address,
    hotel: booking.hotel_name,
    hotelId: Number(booking.hotel_id),
    room: booking.room_type,
    checkin: booking.checkin,
    checkout: booking.checkout,
    payment: booking.payment_method,
    total: Number(booking.total_amount),
    status: booking.status,
  };
}

let roomTypesCached = false;

export async function ensureRooms() {
  if (!roomTypesCached) {
    const rooms = await request("/rooms");
    setRoomTypes(rooms);
    roomTypesCached = true;
  }
}

export async function fetchHotels() {
  await ensureRooms();
  const hotels = await request("/hotels");
  return hotels.map(mapHotel);
}

export async function fetchRooms() {
  await ensureRooms();
  return request("/rooms");
}

export async function createHotel(hotel) {
  await ensureRooms();
  return mapHotel(await request("/hotels", {
    method: "POST",
    body: JSON.stringify(hotel),
  }));
}

export async function updateHotel(id, hotel) {
  await ensureRooms();
  return mapHotel(await request(`/hotels/${id}`, {
    method: "PUT",
    body: JSON.stringify(hotel),
  }));
}

export function deleteHotel(id) {
  return request(`/hotels/${id}`, { method: "DELETE" });
}

export async function createBooking(booking) {
  return mapBooking(await request("/bookings", {
    method: "POST",
    body: JSON.stringify(booking),
  }));
}

export async function fetchBookings() {
  const bookings = await request("/bookings");
  return bookings.map(mapBooking);
}

export async function cancelBooking(id) {
  return mapBooking(await request(`/bookings/${id}`, { method: "PATCH" }));
}

export async function uploadImage(file) {
  const formData = new FormData();
  formData.append("file", file);
  
  const response = await fetch(`${API_URL}/uploads`, {
    method: "POST",
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to upload image");
  return data.file.url;
}
