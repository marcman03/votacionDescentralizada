const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/', async (req, res) => {
    const { nombreUsuario, comunidadId } = req.body;

    console.log('Nombre de usuario:', nombreUsuario);  // Log para verificar el nombre de usuario recibido
    console.log('ID de la comunidad:', comunidadId);  // Log para verificar el ID de la comunidad recibido

    try {
        const result = await pool.query(
            'INSERT INTO practica.pertenece (nombreusuario, idcomunidad) VALUES ($1, $2) RETURNING *',
            [nombreUsuario, comunidadId]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error al unirse a la comunidad:', err.stack);
        res.status(500).json({ message: 'Error en el servidor' });
    }
});

module.exports = router;
