// backend/db.js
const { Pool } = require('pg');

const pool = new Pool({
  user: 'est_e9298889',
  host: 'ubiwan.epsevg.upc.edu',
  database: 'est_e9298889',
  password: 'dB.e9298889',
  port: 5432,
});
pool.connect((err, client, release) => {
    if (err) {
      return console.error('Error adquiriendo cliente', err.stack);
    }
    console.log('Conectado a la base de datos');
    release();
  });

module.exports = pool;
