const express = require('express');
const db = require('../db');

const router = express.Router();

// GET all bookings (optionally filter by phone or status)
router.get('/', async (req, res) => {
  try {
    const { phone, status, hotelId } = req.query;
    const conditions = [];
    const values = [];

    if (phone) {
      values.push(phone.trim());
      conditions.push(`b.phone = $${values.length}`);
    }

    if (status) {
      values.push(status.trim());
      conditions.push(`b.status ILIKE $${values.length}`);
    }

    if (hotelId && !isNaN(Number(hotelId))) {
      values.push(Number(hotelId));
      conditions.push(`b.hotel_id = $${values.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const queryText = `
      SELECT b.*, h.name AS hotel_name, h.city AS hotel_city
      FROM bookings b
      LEFT JOIN hotels h ON h.id = b.hotel_id
      ${whereClause}
      ORDER BY b.id DESC
    `;

    const result = await db.query(queryText, values);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings from database', error: error.message });
  }
});

// GET single booking by ID
router.get('/:id', async (req, res) => {
  const bookingId = Number(req.params.id);
  if (!Number.isInteger(bookingId)) {
    return res.status(400).json({ message: 'Invalid booking ID format' });
  }

  try {
    const result = await db.query(
      `SELECT b.*, h.name AS hotel_name, h.city AS hotel_city
       FROM bookings b
       LEFT JOIN hotels h ON h.id = b.hotel_id
       WHERE b.id = $1`,
      [bookingId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching booking from database', error: error.message });
  }
});

// CANCEL booking by ID
router.patch('/:id', async (req, res) => {
  const bookingId = Number(req.params.id);
  if (!Number.isInteger(bookingId)) {
    return res.status(400).json({ message: 'Invalid booking ID format' });
  }

  try {
    const result = await db.query(
      `UPDATE bookings
       SET status = 'Cancelled'
       WHERE id = $1
       RETURNING *`,
      [bookingId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const hotelResult = await db.query(
      'SELECT name FROM hotels WHERE id = $1',
      [result.rows[0].hotel_id]
    );

    return res.json({
      ...result.rows[0],
      hotel_name: hotelResult.rows[0]?.name || null,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error cancelling booking in database', error: error.message });
  }
});

// CREATE a new booking
router.post('/', async (req, res) => {
  const {
    hotelId,
    customerName,
    phone,
    address,
    roomType,
    checkin,
    checkout,
    paymentMethod,
    totalAmount,
  } = req.body;

  if (!hotelId || !customerName || !phone || !address || !roomType || !checkin || !checkout || totalAmount == null) {
    return res.status(400).json({ message: 'Missing required booking fields' });
  }

  const cleanPhone = String(phone).trim();
  if (!/^[0-9]{10}$/.test(cleanPhone)) {
    return res.status(400).json({ message: 'Please enter a valid 10-digit phone number' });
  }

  const checkinDate = new Date(checkin);
  const checkoutDate = new Date(checkout);
  if (isNaN(checkinDate.getTime()) || isNaN(checkoutDate.getTime()) || checkoutDate <= checkinDate) {
    return res.status(400).json({ message: 'Check-out date must be later than check-in date' });
  }

  try {
    // Verify the hotel exists before creating booking
    const hotelCheck = await db.query('SELECT id, name FROM hotels WHERE id = $1', [Number(hotelId)]);
    if (hotelCheck.rows.length === 0) {
      return res.status(404).json({ message: 'The selected hotel does not exist' });
    }

    const result = await db.query(
      `INSERT INTO bookings (hotel_id, customer_name, phone, address, room_type, checkin, checkout, payment_method, total_amount)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        Number(hotelId),
        String(customerName).trim(),
        cleanPhone,
        String(address).trim(),
        String(roomType).trim() || 'Standard',
        checkin,
        checkout,
        String(paymentMethod).trim() || 'Cash',
        Number(totalAmount),
      ]
    );

    return res.status(201).json({
      ...result.rows[0],
      hotel_name: hotelCheck.rows[0].name,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error creating booking in database', error: error.message });
  }
});

// DELETE booking by ID
router.delete('/:id', async (req, res) => {
  const bookingId = Number(req.params.id);
  if (!Number.isInteger(bookingId)) {
    return res.status(400).json({ message: 'Invalid booking ID format' });
  }

  try {
    const result = await db.query('DELETE FROM bookings WHERE id = $1 RETURNING id', [bookingId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    return res.json({ message: 'Booking deleted successfully', id: bookingId });
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting booking from database', error: error.message });
  }
});

module.exports = router;
