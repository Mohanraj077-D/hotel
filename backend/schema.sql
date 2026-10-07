CREATE TABLE IF NOT EXISTS hotels (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  city VARCHAR(255) NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  rating NUMERIC(2,1) DEFAULT 0,
  rooms INTEGER DEFAULT 1,
  type VARCHAR(255),
  amenities TEXT,
  best_for TEXT,
  image TEXT,
  description TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  hotel_id INTEGER REFERENCES hotels(id) ON DELETE CASCADE,
  customer_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address TEXT NOT NULL,
  room_type VARCHAR(255) NOT NULL,
  checkin DATE NOT NULL,
  checkout DATE NOT NULL,
  payment_method VARCHAR(50) DEFAULT 'Cash',
  total_amount NUMERIC(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'Confirmed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO hotels (name, city, price, rating, rooms, type, amenities, best_for, image, description, latitude, longitude)
SELECT seed.name, seed.city, seed.price, seed.rating, seed.rooms, seed.type,
       seed.amenities, seed.best_for, seed.image, seed.description, seed.latitude, seed.longitude
FROM (VALUES
  ('TAJ Grand Chennai Hotel', 'Chennai', 2499, 4.5, 10, 'City Hotel', 'Free WiFi, Breakfast, Parking', 'Business trips and city breaks', '/images/stay-1.jpg', 'A calm, warmly designed city stay close to Chennai''s best places.', 13.0827, 80.2707),
  ('Backwater Breeze Resort', 'Kerala', 3999, 4.8, 8, 'Backwater Resort', 'Free WiFi, Pool, Breakfast', 'Slow weekends and family stays', '/images/stay-2.jpg', 'A peaceful resort with tropical gardens and a relaxing poolside setting.', 10.8505, 76.2711),
  ('Goa Beach Stay', 'Goa', 2999, 4.4, 12, 'Beach Hotel', 'Free WiFi, Beach Access, Breakfast', 'Beach holidays and sunset evenings', '/images/stay-3.jpg', 'A bright coastal hideaway made for relaxed beach holidays.', 15.2993, 74.1239),
  ('Royal Palace Hotel', 'Rajasthan', 4499, 4.7, 6, 'Heritage Hotel', 'Free WiFi, Restaurant, Parking', 'Culture, food and royal experiences', '/images/stay-4.jpg', 'A refined heritage-inspired stay with a quiet garden outlook.', 27.0238, 74.2179),
  ('Mountain View Kashmir', 'Kashmir', 3599, 4.6, 9, 'Mountain Resort', 'Free WiFi, Mountain View, Campfire', 'Mountain escapes and quiet mornings', '/images/stay-5.jpg', 'Wake up to sweeping mountain views from this peaceful retreat.', 34.0837, 74.7973),
  ('Ooty Green Hills', 'Ooty', 2799, 4.3, 7, 'Hill Hotel', 'Free WiFi, Tea Garden View, Breakfast', 'Cool weather and peaceful retreats', '/images/stay-6.jpg', 'A restful hill-country stay with open views and fresh air.', 11.4064, 76.6932),
  ('The Leela Palace Udaipur', 'Udaipur', 8999, 4.9, 8, 'Luxury Palace Hotel', 'Free WiFi, Pool, Spa, Lake View', 'Palace stays and special occasions', '/images/stay-7.jpg', 'A lakeside-inspired luxury escape with elegant suites and serene views.', 24.5854, 73.7125),
  ('The Oberoi Amarvilas', 'Agra', 10999, 4.9, 7, 'Luxury Resort', 'Free WiFi, Restaurant, Garden, Taj View', 'Iconic landmarks and romantic getaways', '/images/stay-8.jpg', 'An elegant destination for a memorable Agra visit and landmark views.', 27.1767, 78.0081),
  ('Taj Falaknuma Palace', 'Hyderabad', 9999, 4.8, 6, 'Heritage Palace', 'Free WiFi, Fine Dining, Spa, Garden', 'Heritage, fine dining and celebrations', '/images/stay-9.jpg', 'A graceful palace-style stay inspired by Hyderabad''s royal heritage.', 17.385, 78.4867),
  ('The Imperial New Delhi', 'New Delhi', 7499, 4.8, 9, 'Heritage City Hotel', 'Free WiFi, Pool, Restaurant, Parking', 'Landmark city breaks and business trips', '/images/stay-10.jpg', 'A distinctive city retreat with spacious rooms and a resort-style pool.', 28.6139, 77.209)
) AS seed(name, city, price, rating, rooms, type, amenities, best_for, image, description, latitude, longitude)
WHERE NOT EXISTS (
  SELECT 1 FROM hotels existing WHERE existing.name = seed.name
);

CREATE TABLE IF NOT EXISTS room_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  price_multiplier NUMERIC(4,2) NOT NULL,
  guests INTEGER NOT NULL,
  facilities TEXT,
  available_rooms INTEGER DEFAULT 5,
  image TEXT
);

INSERT INTO room_types (name, price_multiplier, guests, facilities, available_rooms, image)
VALUES
  ('Single Room', 1.00, 1, 'Free WiFi, Breakfast', 5, '/images/room-single.jpg'),
  ('Deluxe Room', 1.45, 2, 'Free WiFi, Breakfast, City View', 4, '/images/room-deluxe.jpg'),
  ('Family Room', 1.85, 4, 'Free WiFi, Breakfast, Extra Beds', 3, '/images/room-family.jpg'),
  ('Suite Room', 2.50, 4, 'Free WiFi, Breakfast, Lounge, Balcony', 2, '/images/room-suite.jpg')
ON CONFLICT (name) DO NOTHING;
