const express = require('express');
const db = require('../db');

const router = express.Router();

// GET all hotels with optional filtering (city, search, minPrice, maxPrice)
router.get('/', async (req, res) => {
  try {
    const { city, search, minPrice, maxPrice, page, limit } = req.query;
    const conditions = [];
    const values = [];

    if (city) {
      values.push(`%${city.trim()}%`);
      conditions.push(`city ILIKE $${values.length}`);
    }

    if (search) {
      values.push(`%${search.trim()}%`);
      conditions.push(`(name ILIKE $${values.length} OR city ILIKE $${values.length})`);
    }

    if (minPrice && !isNaN(Number(minPrice))) {
      values.push(Number(minPrice));
      conditions.push(`price >= $${values.length}`);
    }

    if (maxPrice && !isNaN(Number(maxPrice))) {
      values.push(Number(maxPrice));
      conditions.push(`price <= $${values.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    let queryText = `SELECT * FROM hotels ${whereClause} ORDER BY id ASC`;

    if (page && limit) {
      const countQuery = `SELECT COUNT(*) FROM hotels ${whereClause}`;
      const countResult = await db.query(countQuery, values);
      const totalCount = parseInt(countResult.rows[0].count, 10);

      const pageNum = Number(page);
      const limitNum = Number(limit);
      const offset = (pageNum - 1) * limitNum;

      values.push(limitNum);
      queryText += ` LIMIT $${values.length}`;
      values.push(offset);
      queryText += ` OFFSET $${values.length}`;

      const result = await db.query(queryText, values);
      return res.json({
        hotels: result.rows,
        totalCount,
        totalPages: Math.ceil(totalCount / limitNum),
        currentPage: pageNum
      });
    }

    const result = await db.query(queryText, values);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching hotels from database', error: error.message });
  }
});

// GET single hotel by ID
router.get('/:id', async (req, res) => {
  const hotelId = Number(req.params.id);
  if (!Number.isInteger(hotelId)) {
    return res.status(400).json({ message: 'Invalid hotel ID format' });
  }

  try {
    const result = await db.query('SELECT * FROM hotels WHERE id = $1', [hotelId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching hotel from database', error: error.message });
  }
});

// CREATE new hotel
router.post('/', async (req, res) => {
  const {
    name,
    city,
    price,
    rating,
    rooms,
    type,
    amenities,
    bestFor,
    image,
    description,
    latitude,
    longitude,
  } = req.body;

  if (!name || !city || !Number.isFinite(Number(price)) || Number(price) <= 0) {
    return res.status(400).json({ message: 'Enter a valid hotel name, city, and positive price' });
  }

  try {
    const result = await db.query(
      `INSERT INTO hotels (name, city, price, rating, rooms, type, amenities, best_for, image, description, latitude, longitude)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        name.trim(),
        city.trim(),
        Number(price),
        rating != null ? Number(rating) : 0,
        rooms != null ? Number(rooms) : 1,
        type ? type.trim() : '',
        amenities ? amenities.trim() : '',
        bestFor ? bestFor.trim() : '',
        image ? image.trim() : '',
        description ? description.trim() : '',
        latitude != null && !isNaN(Number(latitude)) ? Number(latitude) : null,
        longitude != null && !isNaN(Number(longitude)) ? Number(longitude) : null,
      ]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ message: 'Error creating hotel in database', error: error.message });
  }
});

// UPDATE hotel by ID
router.put('/:id', async (req, res) => {
  const hotelId = Number(req.params.id);
  if (!Number.isInteger(hotelId)) {
    return res.status(400).json({ message: 'Invalid hotel ID format' });
  }

  const {
    name,
    city,
    price,
    rating,
    rooms,
    type,
    amenities,
    bestFor,
    image,
    description,
    latitude,
    longitude,
  } = req.body;

  try {
    const result = await db.query(
      `UPDATE hotels
       SET name = COALESCE($1, name),
           city = COALESCE($2, city),
           price = COALESCE($3, price),
           rating = COALESCE($4, rating),
           rooms = COALESCE($5, rooms),
           type = COALESCE($6, type),
           amenities = COALESCE($7, amenities),
           best_for = COALESCE($8, best_for),
           image = COALESCE($9, image),
           description = COALESCE($10, description),
           latitude = COALESCE($11, latitude),
           longitude = COALESCE($12, longitude)
       WHERE id = $13
       RETURNING *`,
      [
        name != null ? name.trim() : null,
        city != null ? city.trim() : null,
        price != null && !isNaN(Number(price)) ? Number(price) : null,
        rating != null && !isNaN(Number(rating)) ? Number(rating) : null,
        rooms != null && !isNaN(Number(rooms)) ? Number(rooms) : null,
        type != null ? type.trim() : null,
        amenities != null ? amenities.trim() : null,
        bestFor != null ? bestFor.trim() : null,
        image != null ? image.trim() : null,
        description != null ? description.trim() : null,
        latitude != null && !isNaN(Number(latitude)) ? Number(latitude) : null,
        longitude != null && !isNaN(Number(longitude)) ? Number(longitude) : null,
        hotelId,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ message: 'Error updating hotel in database', error: error.message });
  }
});

// DELETE hotel by ID
router.delete('/:id', async (req, res) => {
  const hotelId = Number(req.params.id);
  if (!Number.isInteger(hotelId)) {
    return res.status(400).json({ message: 'Invalid hotel ID format' });
  }

  try {
    const result = await db.query('DELETE FROM hotels WHERE id = $1 RETURNING id, name', [hotelId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    return res.json({ message: `Hotel "${result.rows[0].name}" deleted successfully`, id: hotelId });
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting hotel from database', error: error.message });
  }
});

module.exports = router;
