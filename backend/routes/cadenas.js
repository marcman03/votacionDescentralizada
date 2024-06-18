const express = require('express');
const router = express.Router();
const pool = require('../db');

// Obtener todas las cadenas de bloques
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT id FROM practica.cadenadebloques');
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener las cadenas de bloques:', err.stack);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

module.exports = router;
