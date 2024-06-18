const express = require('express');
const router = express.Router();
const pool = require('../db');

// Login del usuario
router.post('/login', async (req, res) => {
  const { username, contrasena } = req.body;
  try {
    // Verifica si el usuario es un administrador
    let result = await pool.query('SELECT * FROM practica.administrador WHERE nombre = $1', [username]);
    if (result.rows.length > 0) {
      const admin = result.rows[0];
      const userResult = await pool.query('SELECT * FROM practica.usuario WHERE nombre = $1', [username]);
      if (userResult.rows.length > 0) {
        const user = userResult.rows[0];
        if (contrasena === user.contrasena) {
          return res.json({ tipo: 'administrador' });
        }
      }
    }

    // Si no es administrador, verifica si es un miembro
    result = await pool.query('SELECT * FROM practica.miembro WHERE nombre = $1', [username]);
    if (result.rows.length > 0) {
      const miembro = result.rows[0];
      const userResult = await pool.query('SELECT * FROM practica.usuario WHERE nombre = $1', [username]);
      if (userResult.rows.length > 0) {
        const user = userResult.rows[0];
        if (contrasena === user.contrasena) {
          return res.json({ tipo: 'miembro' });
        }
      }
    }
    

    // Si no es ni administrador ni miembro, devolver error
    return res.status(401).json({ message: 'Nombre de usuario o contraseña incorrectos' });
  } catch (err) {
    console.error('Error en el login:', err.stack);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});


// Crear un nuevo miembro
router.post('/miembros', async (req, res) => {
  const { nombre, fechadenacimiento, correo, telefono, contrasena } = req.body;
  try {
    const userResult = await pool.query(
      'INSERT INTO practica.usuario (nombre, fechadenacimiento, correo, telefono, contrasena) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [nombre, fechadenacimiento, correo, telefono, contrasena]
    );
    const miembroResult = await pool.query(
      'INSERT INTO practica.miembro (nombre) VALUES ($1) RETURNING *',
      [nombre]
    );
    res.status(201).json({ ...userResult.rows[0], ...miembroResult.rows[0] });
  } catch (err) {
    console.error('Error creando miembro:', err.stack);
    res.status(400).json({ message: err.message });
  }
});
router.get('/comunidades', async (req, res) => {
  const { nombreUsuario } = req.query;
  console.log('Nombre de usuario recibido:', nombreUsuario);

  try {
    // Verifica si el usuario existe y obtiene su ID
    // Busca las comunidades a las que pertenece el usuario
    const comunidadesResult = await pool.query(
      `SELECT c.id, c.nombre 
       FROM practica.comunidad c
       JOIN practica.pertenece p ON c.id = p.idcomunidad
       WHERE p.nombreusuario = $1`, 
      [nombreUsuario]
    );

    console.log('Comunidades encontradas:', comunidadesResult.rows);  // Log para verificar datos
    res.json(comunidadesResult.rows);
  } catch (err) {
    console.error('Error al obtener las comunidades del usuario:', err.stack);
    res.status(500).json({ message: 'Error en el servidor' });
  }
}); 
router.get('/miembros/:nombre', async (req, res) => {
  const { nombre } = req.params;

  try {
    const miembroResult = await pool.query('SELECT * FROM practica.miembro WHERE nombre = $1', [nombre]);
    if (miembroResult.rows.length === 0) {
      return res.status(404).json({ message: 'Miembro no encontrado' });
    }

    // Obtiene los datos del usuario correspondiente
    const usuarioResult = await pool.query('SELECT * FROM practica.usuario WHERE nombre = $1', [nombre]);
    if (usuarioResult.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({ ...miembroResult.rows[0], ...usuarioResult.rows[0] });
  } catch (err) {
    console.error('Error al obtener los datos del miembro:', err.stack);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

router.put('/miembros/:nombre', async (req, res) => {
  const { nombre } = req.params;
  const { fechadenacimiento, correo, telefono, contrasena } = req.body;

  try {
    const updateResult = await pool.query(
      `UPDATE practica.usuario 
       SET fechadenacimiento = $1, correo = $2, telefono = $3, contrasena = $4
       WHERE nombre = $5 RETURNING *`,
      [fechadenacimiento, correo, telefono, contrasena, nombre]
    );

    if (updateResult.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json(updateResult.rows[0]);
  } catch (err) {
    console.error('Error al modificar los datos del miembro:', err.stack);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});
router.put('/miembros/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, fechadenacimiento, correo, telefono, contrasena } = req.body;

  try {
    const updateResult = await pool.query(
      `UPDATE practica.miembro 
       SET nombre = $1, fechadenacimiento = $2, correo = $3, telefono = $4, contrasena = $5
       WHERE id = $6 RETURNING *`,
      [nombre, fechadenacimiento, correo, telefono, contrasena, id]
    );

    if (updateResult.rows.length === 0) {
      return res.status(404).json({ message: 'Miembro no encontrado' });
    }

    res.json(updateResult.rows[0]);
  } catch (err) {
    console.error('Error al modificar los datos del miembro:', err.stack);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});


// Crear un nuevo administrador
router.post('/administradores', async (req, res) => {
    const { nombre, fechadenacimiento, correo, telefono, contrasena, tipoComunidad, comunidadExistente, nuevaComunidadNombre, nuevaComunidadDescripcion, cadenaSeleccionada } = req.body;
    try {
      let idComunidad;
  
      if (tipoComunidad === 'nueva') {
        const comunidadResult = await pool.query(
          'INSERT INTO practica.comunidad (nombre, descripcion, fechadecreacion, idcadenadebloques) VALUES ($1, $2, CURRENT_DATE, $3) RETURNING id',
          [nuevaComunidadNombre, nuevaComunidadDescripcion, cadenaSeleccionada]
        );
        idComunidad = comunidadResult.rows[0].id;
      } else {
        idComunidad = comunidadExistente;
      }
  
      const userResult = await pool.query(
        'INSERT INTO practica.usuario (nombre, fechadenacimiento, correo, telefono, contrasena) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [nombre, fechadenacimiento, correo, telefono, contrasena]
      );
      const adminResult = await pool.query(
        'INSERT INTO practica.administrador (nombre, idcomunidad) VALUES ($1, $2) RETURNING *',
        [nombre, idComunidad]
      );
      res.status(201).json({ ...userResult.rows[0], ...adminResult.rows[0] });
    } catch (err) {
      console.error('Error creando administrador:', err.stack);
      res.status(400).json({ message: err.message });
    }
  });
  

module.exports = router;
