const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./src/db');
const hotelsRoutes = require('./src/routes/hotels');
const bookingsRoutes = require('./src/routes/bookings');
const roomsRoutes = require('./src/routes/rooms');
const reviewsRoutes = require('./src/routes/reviews');
const usersRoutes = require('./src/routes/users');
const uploadsRoutes = require('./src/routes/uploads');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '4mb' }));

// Root welcome route with API directory
app.get('/', (req, res) => {
  res.json({
    message: 'TAJ backend is running',
    api: {
      health: '/api/health',
      hotels: '/api/hotels',
      bookings: '/api/bookings',
      rooms: '/api/rooms',
      reviews: '/api/reviews',
      users: '/api/users',
      uploads: '/api/uploads',
    },
  });
});

// Database connectivity health check endpoint
app.get('/api/health', async (req, res) => {
  const dbStatus = await db.testConnection();

  const response = {
    status: dbStatus.connected ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      connected: dbStatus.connected,
      name: dbStatus.database,
      latency: dbStatus.latencyMs != null ? `${dbStatus.latencyMs}ms` : undefined,
      host: dbStatus.host,
      port: dbStatus.port,
      version: dbStatus.version,
      error: dbStatus.error || null,
    },
  };

  const httpStatus = dbStatus.connected ? 200 : 503;
  res.status(httpStatus).json(response);
});

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount application routes
app.use('/api/hotels', hotelsRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/rooms', roomsRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/uploads', uploadsRoutes);

// Global 404 handler
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'production' ? undefined : err.message,
  });
});

// Start server and verify database connectivity
const server = app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Testing PostgreSQL database connectivity...`);

  const dbStatus = await db.testConnection();
  if (dbStatus.connected) {
    console.log(`[Database] PostgreSQL connected successfully: ${dbStatus.database} on ${dbStatus.host}:${dbStatus.port} (${dbStatus.latencyMs}ms)`);
  } else {
    console.error(`[Database Error] Failed to connect to PostgreSQL: ${dbStatus.error}`);
    console.error(`Please check your DB settings in .env (DB_USER, DB_PASSWORD, DB_HOST, DB_NAME, DB_PORT or DATABASE_URL).`);
  }
});

// Graceful shutdown handling
function handleShutdown(signal) {
  console.log(`Received ${signal}. Gracefully closing HTTP server and database pool...`);
  server.close(async () => {
    await db.closePool();
    console.log('Database pool closed. Exiting process.');
    process.exit(0);
  });
}

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));
