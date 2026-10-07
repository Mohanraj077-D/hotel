# TAJ Hotel App Backend

Node.js, Express, and PostgreSQL backend for the TAJ hotel booking application with connection pooling, health checks, and database management utilities.

## Database Setup & Connectivity

### 1. Requirements
- PostgreSQL 14+ running locally (default port `5432`) or a hosted cloud PostgreSQL database (Neon, Supabase, Render, AWS RDS, etc.).

### 2. Configure Environment (`.env`)
In `backend/.env` (or project root `.env`), ensure the database credentials match your setup:

```env
PORT=5000
DB_USER=postgres
DB_HOST=localhost
DB_NAME=taj_hotels
DB_PASSWORD=your_password
DB_PORT=5432
DB_SSL=false
```

Or provide a single connection string:
```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/taj_hotels
```

### 3. Verify Connectivity & Initialize Database
From either the root folder or `backend/`, run:

```bash
# Test database connection and measure latency
npm run db:test

# Initialize tables (hotels, bookings) and default seed data
npm run db:init
```

## Running the Application

### Backend Server
```bash
# From backend directory
npm start

# Or from workspace root
npm run start:backend
```

### Frontend (React + Vite)
```bash
# From workspace root
npm run start:frontend
```

## API Endpoints

- `GET /` - Root status and API directory
- `GET /api/health` - Live database connectivity health check, DB latency, and uptime
- `GET /api/hotels` - List all hotels (supports `?search=`, `?city=`, `?minPrice=`, `?maxPrice=`)
- `GET /api/hotels/:id` - Get hotel details by ID
- `POST /api/hotels` - Add a new hotel
- `PUT /api/hotels/:id` - Update hotel details
- `DELETE /api/hotels/:id` - Remove a hotel
- `GET /api/bookings` - List bookings (supports `?phone=`, `?status=`, `?hotelId=`)
- `GET /api/bookings/:id` - Get booking by ID
- `POST /api/bookings` - Create reservation
- `PATCH /api/bookings/:id` - Cancel booking
- `DELETE /api/bookings/:id` - Delete booking record
