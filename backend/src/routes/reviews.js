const express = require('express');
const db = require('../db');

const router = express.Router();

// GET all reviews (optionally filtered by hotel_id)
router.get('/', async (req, res) => {
  try {
    const { hotel_id } = req.query;
    let queryText = 'SELECT * FROM reviews ORDER BY created_at DESC';
    let values = [];

    if (hotel_id) {
      queryText = 'SELECT * FROM reviews WHERE hotel_id = $1 ORDER BY created_at DESC';
      values = [Number(hotel_id)];
    }

    const result = await db.query(queryText, values);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews', error: error.message });
  }
});

// POST a new review
router.post('/', async (req, res) => {
  const { hotel_id, author_name, rating, comment } = req.body;

  if (!hotel_id || !author_name || rating == null || !comment) {
    return res.status(400).json({ message: 'Please provide hotel_id, author_name, rating, and comment' });
  }

  try {
    const result = await db.query(
      `INSERT INTO reviews (hotel_id, author_name, rating, comment)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [Number(hotel_id), author_name.trim(), Number(rating), comment.trim()]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error creating review', error: error.message });
  }
});

module.exports = router;
