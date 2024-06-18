// backend/app.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const pool = require('./db.js'); // Archivo de configuración de la base de datos


const app = express();
app.use(cors());
app.use(bodyParser.json());

// Importar y usar las rutas
const usuariosRouter = require('./routes/usuarios');
const comunidadesRoutes = require('./routes/comunidades');
const cadenasRoutes = require('./routes/cadenas');
const perteneceRoutes = require('./routes/pertenece');
const adminRoutes = require('./routes/admin.js');
app.use('/api/usuarios', usuariosRouter);
app.use('/api/comunidades', comunidadesRoutes);

app.use('/api/cadenas', cadenasRoutes);
app.use('/api/pertenece', perteneceRoutes);
app.use('/api/admin', adminRoutes);
// Servir archivos estáticos de Vue.js
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Manejar todas las demás rutas con el archivo index.html de Vue
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// Ruta de inicio
app.get('/', (req, res) => {
  res.send('Bienvenido a la API de votaciones descentralizadas');
});

// Puerto de escucha
const port = 3000;
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
