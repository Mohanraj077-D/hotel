const express = require('express');
const db = require('../db');

const router = express.Router();

// GET all room types
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM room_types ORDER BY id ASC');
    // map DB columns (price_multiplier, available_rooms) to frontend keys
    const rooms = result.rows.map(row => ({
      name: row.name,
      priceMultiplier: Number(row.price_multiplier),
      guests: row.guests,
      facilities: row.facilities,
      availableRooms: row.available_rooms,
      image: row.image,
    }));
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching room types', error: error.message });
  }
});

module.exports = router;
