const express = require('express');
const router = express.Router();
const pool = require('../db');

// Ruta para obtener la comunidad del administrador
router.get('/comunidad/:nombreUsuario', async (req, res) => {
  const { nombreUsuario } = req.params;
  try {
    const comunidadResult = await pool.query(`
      SELECT c.id, c.nombre, c.descripcion, c.fechadecreacion
      FROM practica.comunidad c
      JOIN practica.administrador a ON c.id = a.idcomunidad
      WHERE a.nombre = $1
    `, [nombreUsuario]);

    if (comunidadResult.rows.length === 0) {
      return res.status(404).json({ message: 'Comunidad no encontrada' });
    }

    res.json(comunidadResult.rows[0]);
  } catch (err) {
    console.error('Error al obtener la comunidad del administrador:', err.stack);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Ruta para obtener los miembros de una comunidad
router.get('/comunidad/:id/miembros', async (req, res) => {
  const { id } = req.params;
  try {
    const miembrosResult = await pool.query(`
      SELECT m.nombre
      FROM practica.miembro m
      JOIN practica.pertenece p ON m.nombre = p.nombreusuario
      WHERE p.idcomunidad = $1
    `, [id]);

    res.json(miembrosResult.rows);
  } catch (err) {
    console.error('Error al obtener los miembros de la comunidad:', err.stack);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Ruta para expulsar a un miembro de una comunidad
router.delete('/comunidad/:id/miembros/:nombreMiembro', async (req, res) => {
  const { id, nombreMiembro } = req.params;
  try {
    await pool.query(`
      DELETE FROM practica.pertenece
      WHERE idcomunidad = $1 AND nombreusuario = $2
    `, [id, nombreMiembro]);

    res.json({ message: 'Miembro expulsado con éxito!' });
  } catch (err) {
    console.error('Error al expulsar al miembro de la comunidad:', err.stack);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});
// Ruta para obtener detalles de la comunidad por ID
router.get('/comunidad/:id', async (req, res) => {
  const { id } = req.params;
  console.log("ID de la comunidad solicitada:", id); // Esto debería mostrar el ID en la consola
  try {
    const result = await pool.query('SELECT * FROM practica.comunidad WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Comunidad no encontrada' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al obtener los detalles de la comunidad:', err.stack);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});
  
  // Actualizar nombre y descripción de la comunidad
  router.put('/comunidad/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;
    try {
      await pool.query(
        'UPDATE practica.comunidad SET nombre = $1, descripcion = $2 WHERE id = $3',
        [nombre, descripcion, id]
      );
      res.json({ message: 'Cambios guardados con éxito!' });
    } catch (err) {
      console.error('Error al actualizar los detalles de la comunidad:', err.stack);
      res.status(500).json({ message: 'Error en el servidor' });
    }
  });

module.exports = router;
