const express = require('express');
const db = require('../db');

const router = express.Router();

// GET all users
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT id, name, email, phone, role, created_at FROM users ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

// POST a new user
router.post('/', async (req, res) => {
  const { name, email, password, phone, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please provide name, email, and password' });
  }

  try {
    const result = await db.query(
      `INSERT INTO users (name, email, password, phone, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, phone, role, created_at`,
      [
        name.trim(), 
        email.trim(), 
        password, // In a real app, hash this!
        phone ? phone.trim() : null, 
        role ? role.trim() : 'guest'
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') { // unique violation
      return res.status(409).json({ message: 'User with this email already exists' });
    }
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
});

module.exports = router;
