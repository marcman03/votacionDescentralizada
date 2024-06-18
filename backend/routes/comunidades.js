const express = require('express');
const router = express.Router();
const pool = require('../db');
const moment = require('moment');
// Obtener comunidades por búsqueda
router.get('/', async (req, res) => {
  const { search } = req.query;
  try {
    const query = 'SELECT id, nombre FROM practica.comunidad WHERE nombre ILIKE $1 LIMIT 5';
    const values = [`%${search}%`];
    const result = await pool.query(query, values);
    
    // Imprimir el término de búsqueda y los resultados en la consola
    console.log('Término de búsqueda:', search);
    console.log('Resultados:', result.rows);
    
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener las comunidades:', err.stack);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion } = req.body;

  try {
    const result = await pool.query(
      'UPDATE practica.comunidad SET nombre = $1, descripcion = $2 WHERE id = $3 RETURNING *',
      [nombre, descripcion, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Comunidad no encontrada' });
    }

    res.json({ message: 'Cambios guardados con éxito!', comunidad: result.rows[0] });
  } catch (err) {
    console.error('Error al actualizar los detalles de la comunidad:', err.stack);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Obtener detalles de la comunidad
    const comunidadResult = await pool.query(`
      SELECT nombre, descripcion, fechadecreacion, idcadenadebloques
      FROM practica.comunidad 
      WHERE id = $1`, [id]);

    if (comunidadResult.rows.length === 0) {
      return res.status(404).json({ message: 'Comunidad no encontrada' });
    }
    
    // Obtener administradores de la comunidad
    const administradoresResult = await pool.query(`
      SELECT a.nombre 
      FROM practica.administrador a
      WHERE a.idcomunidad = $1`, [id]);

    // Obtener miembros de la comunidad
    const miembrosResult = await pool.query(`
      SELECT m.nombre 
      FROM practica.miembro m
      JOIN practica.pertenece p ON m.nombre = p.nombreusuario
      WHERE p.idcomunidad = $1`, [id]);

    const comunidad = comunidadResult.rows[0];
    const administradores = administradoresResult.rows.map(row => row.nombre);
    const miembros = miembrosResult.rows.map(row => row.nombre);

    res.json({
      nombre: comunidad.nombre,
      descripcion: comunidad.descripcion,
      fechaCreacion: comunidad.fechadecreacion,
      cadenaDeBloques: comunidad.idcadenadebloques, // Asegúrate de que el nombre coincide
      administradores,
      miembros
    });
  } catch (err) {
    console.error('Error al obtener el nombre de la comunidad:', err.stack);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});
// Ruta simplificada para obtener votaciones de la comunidad
// Obtener votaciones de la comunidad
router.get('/:id/votaciones', async (req, res) => {
  const { id } = req.params;

  try {
    const votacionesResult = await pool.query(`
      SELECT v.id, v.descripcion, v.proposito, c.tiempodevotacion, c.datacreacion
      FROM practica.votacion v
      JOIN practica.contratointeligente c ON v.idcontrato = c.id
      JOIN practica.administrador a ON v.nombreadministrador = a.nombre
      WHERE a.idcomunidad = $1`, [id]);

    if (votacionesResult.rows.length === 0) {
      return res.status(404).json({ message: 'No se encontraron votaciones para esta comunidad' });
    }

    const votaciones = votacionesResult.rows.map(votacion => {
      const fechaDeFinalizacion = moment(votacion.datacreacion).add(votacion.tiempodevotacion, 'minutes');
      const votacionCerrada = moment().isAfter(fechaDeFinalizacion);

      const formattedFechaCreacion = moment(votacion.datacreacion).format('DD/MM/YYYY HH:mm:ss');
      const formattedFechaFinalizacion = fechaDeFinalizacion.format('DD/MM/YYYY HH:mm:ss');

      return {
        id: votacion.id,
        descripcion: votacion.descripcion,
        proposito: votacion.proposito,
        fechaCreacion: formattedFechaCreacion,
        fechaFinalizacion: formattedFechaFinalizacion,
        votacionCerrada
      };
    });

    res.json(votaciones);
  } catch (err) {
    console.error('Error al obtener las votaciones de la comunidad:', err.stack);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Obtener estado de la votación
router.get('/:comunidadId/votaciones/:votacionId/estado', async (req, res) => {
  const { comunidadId, votacionId } = req.params;
  const { nombreUsuario } = req.query;

  try {
    const votacionResult = await pool.query(`
      SELECT v.id, v.descripcion, v.proposito, c.tiempodevotacion, c.datacreacion, v.idcontrato
      FROM practica.votacion v
      JOIN practica.contratointeligente c ON v.idcontrato = c.id
      WHERE v.id = $1`, [votacionId]);

    if (votacionResult.rows.length === 0) {
      return res.status(404).json({ message: 'Votación no encontrada' });
    }

    const votacion = votacionResult.rows[0];
    const fechaDeFinalizacion = moment(votacion.datacreacion).add(votacion.tiempodevotacion, 'minutes');
    const votacionCerrada = moment().isAfter(fechaDeFinalizacion);

    const puedeVotarResult = await pool.query(`
      SELECT COUNT(*) > 0 AS puede_votar
      FROM practica.permite
      WHERE idcontrato = $1 AND nombremiembro = $2`, [votacion.idcontrato, nombreUsuario]);

    const puedeVotar = puedeVotarResult.rows[0].puede_votar;

    const haVotadoResult = await pool.query(`
      SELECT COUNT(*) > 0 AS ha_votado
      FROM practica.opcionvotada
      WHERE idvotacion = $1 AND nombremiembro = $2`, [votacionId, nombreUsuario]);

    const haVotado = haVotadoResult.rows[0].ha_votado;

    res.json({
      id: votacion.id,
      descripcion: votacion.descripcion,
      proposito: votacion.proposito,
      fechaCreacion: moment(votacion.datacreacion).format('DD/MM/YYYY HH:mm:ss'),
      fechaFinalizacion: fechaDeFinalizacion.format('DD/MM/YYYY HH:mm:ss'),
      votacionCerrada,
      puedeVotar,
      haVotado
    });
  } catch (err) {
    console.error('Error al verificar el estado de la votación:', err.stack);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});



// Obtener opciones de votación
router.get('/:comunidadId/votaciones/:votacionId/opciones', async (req, res) => {
  const { votacionId } = req.params;
  console.log("Opciones", votacionId);

  try {
    const opcionesResult = await pool.query(`
      SELECT o.nombre, o.descripcion, o.idvotacion
      FROM practica.opcion o
      WHERE o.idvotacion = $1`, [votacionId]);
    console.log(opcionesResult);
    res.json(opcionesResult.rows);
  } catch (err) {
    console.error('Error al obtener las opciones de votación:', err.stack);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});



router.post('/:comunidadId/votaciones/:votacionId/votar', async (req, res) => {
  const { comunidadId, votacionId } = req.params;
  const { opcionNombre, nombreUsuario } = req.body;

  try {
    // Obtener la cadena de bloques de la comunidad del administrador
    const comunidadResult = await pool.query(`
      SELECT c.idcadenadebloques
      FROM practica.comunidad c
      JOIN practica.administrador a ON c.id = a.idcomunidad
      WHERE c.id = $1
    `, [comunidadId]);

    if (comunidadResult.rows.length === 0) {
      return res.status(404).json({ message: 'Comunidad no encontrada' });
    }

    const idCadenaDeBloques = comunidadResult.rows[0].idcadenadebloques;

    // Crear un nuevo registro
    const timestamp = Math.floor(Date.now() / 1000); // Obtener marca de tiempo en segundos
    const nuevoRegistro = await pool.query(`
      INSERT INTO practica.registro (marcadetiempo, idcadenadebloques)
      VALUES ($1, $2) RETURNING codigo
    `, [timestamp, idCadenaDeBloques]);

    const codigoRegistro = nuevoRegistro.rows[0].codigo;

    // Registrar el voto
    await pool.query(`
      INSERT INTO practica.opcionvotada (idvotacion, nombremiembro, codigo, nombre)
      VALUES ($1, $2, $3, $4)
    `, [votacionId, nombreUsuario, codigoRegistro, opcionNombre]);

    res.json({ message: 'Voto registrado con éxito!' });
  } catch (err) {
    console.error('Error al registrar el voto:', err.stack);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});
router.get('/:comunidadId/votaciones/:votacionId/resultados', async (req, res) => {
  const { votacionId } = req.params;

  try {
    const resultados = await pool.query(`
      SELECT o.nombre, COUNT(ov.nombremiembro) as votos
      FROM practica.opcion o
      LEFT JOIN practica.opcionvotada ov ON o.nombre = ov.nombre AND o.idvotacion = ov.idvotacion
      WHERE o.idvotacion = $1
      GROUP BY o.nombre, o.descripcion
      ORDER BY votos DESC
    `, [votacionId]);

    res.json(resultados.rows);
  } catch (err) {
    console.error('Error al obtener los resultados de la votación:', err.stack);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

router.post('/:comunidadId/votaciones', async (req, res) => {
  const { comunidadId } = req.params;
  const { votacion, contrato, usuariosPermitidos, opciones, nombreAdministrador } = req.body;
  const { descripcion, proposito } = votacion;
  const { tiempoDeVotacion } = contrato;  // Eliminar fechaDeCreacion

  try {
    // Verificar si el administrador existe
    const adminResult = await pool.query(
      'SELECT * FROM practica.administrador WHERE nombre = $1 AND idcomunidad = $2',
      [nombreAdministrador, comunidadId]
    );

    if (adminResult.rows.length === 0) {
      return res.status(404).json({ message: 'Administrador no encontrado en la comunidad.' });
    }

    // Crear contrato inteligente con NOW() para datacreacion
    const contratoResult = await pool.query(
      'INSERT INTO practica.contratointeligente (tiempodevotacion, datacreacion) VALUES ($1, NOW()) RETURNING id',
      [tiempoDeVotacion]
    );
    const idContrato = contratoResult.rows[0].id;

    // Crear votación
    const votacionResult = await pool.query(
      'INSERT INTO practica.votacion (descripcion, proposito, idcontrato, nombreadministrador) VALUES ($1, $2, $3, $4) RETURNING id',
      [descripcion, proposito, idContrato, nombreAdministrador]
    );
    const idVotacion = votacionResult.rows[0].id;

    // Permitir usuarios
    for (const usuario of usuariosPermitidos) {
      await pool.query(
        'INSERT INTO practica.permite (idcontrato, nombremiembro) VALUES ($1, $2)',
        [idContrato, usuario]
      );
    }

    // Crear opciones
    for (const [index, opcion] of opciones.entries()) {
      const nombreOpcion = `opcion${String.fromCharCode(65 + index)}_${idVotacion}`;
      await pool.query(
        'INSERT INTO practica.opcion (nombre, descripcion, idvotacion) VALUES ($1, $2, $3)',
        [nombreOpcion, opcion.descripcion, idVotacion]
      );
    }

    res.json({ message: 'Votación creada con éxito!' });
  } catch (err) {
    console.error('Error al crear la votación:', err.stack);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

//aqui empieza para consultar cadena de bloques

router.get('/:comunidadId/cadena-de-bloques', async (req, res) => {
  const { comunidadId } = req.params;
  try {
    // Obtener los registros de acta
    const actasResult = await pool.query(`
      SELECT r.codigo, r.marcadetiempo, 'acta' AS tipo
      FROM practica.acta a
      JOIN practica.registro r ON a.codigo = r.codigo
      WHERE r.idcadenadebloques = (
        SELECT idcadenadebloques
        FROM practica.comunidad
        WHERE id = $1
      )
    `, [comunidadId]);

    // Obtener los registros de opcion votada
    const opcionesVotadasResult = await pool.query(`
      SELECT r.codigo, r.marcadetiempo, 'opcionVotada' AS tipo
      FROM practica.opcionvotada ov
      JOIN practica.registro r ON ov.codigo = r.codigo
      WHERE r.idcadenadebloques = (
        SELECT idcadenadebloques
        FROM practica.comunidad
        WHERE id = $1
      )
    `, [comunidadId]);

    // Combinar y ordenar los registros por marca de tiempo
    const registros = [...actasResult.rows, ...opcionesVotadasResult.rows].sort((a, b) => b.marcadetiempo - a.marcadetiempo);

    res.json(registros);
  } catch (err) {
    console.error('Error al obtener la cadena de bloques:', err.stack);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Obtener detalles de acta
router.get('/:comunidadId/cadena-de-bloques/acta/:codigo', async (req, res) => {
  const { codigo } = req.params;
  try {
    const result = await pool.query(`
      SELECT a.codigo, a.fecha, a.titulo, a.puntosimportantes, a.nombreadministrador
      FROM practica.acta a
      WHERE a.codigo = $1
    `, [codigo]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Acta no encontrada' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al obtener detalles del acta:', err.stack);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Obtener detalles de opcion votada
// Obtener detalles de una opción votada por su código
router.get('/:comunidadId/opcion-votada/:codigo', async (req, res) => {
  const { comunidadId, codigo } = req.params;

  try {
    const opcionVotadaResult = await pool.query(`
      SELECT * 
      FROM practica.opcionvotada 
      WHERE codigo = $1
    `, [codigo]);

    if (opcionVotadaResult.rows.length === 0) {
      return res.status(404).json({ message: 'Opción votada no encontrada' });
    }

    res.json(opcionVotadaResult.rows[0]);
  } catch (err) {
    console.error('Error al obtener los detalles de la opción votada:', err.stack);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Obtener detalles de una opción por su código
router.get('/:comunidadId/opciones/:codigo', async (req, res) => {
  const { comunidadId, codigo } = req.params;

  try {
    const opcionResult = await pool.query(`
      SELECT o.*, v.id AS idvotacion
      FROM practica.opcion o
      JOIN practica.votacion v ON o.idvotacion = v.id
      WHERE o.nombre = (
        SELECT nombre
        FROM practica.opcionvotada
        WHERE nombre = $1
      )
    `, [codigo]);

    if (opcionResult.rows.length === 0) {
      return res.status(404).json({ message: 'Opción no encontrada' });
    }

    res.json(opcionResult.rows[0]);
  } catch (err) {
    console.error('Error al obtener los detalles de la opción:', err.stack);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});





module.exports = router;
