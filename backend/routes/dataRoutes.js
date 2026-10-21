// All the custom backend endpoints live here: a thin layer over raw SQL
// queries against the same Postgres database Supabase manages. Anything that
// needs a join, an aggregate, or just isn't safe to run from the client goes
// through here instead of the Supabase JS client.
const express = require('express');
const router = express.Router();
const { Pool, types } = require('pg');

// pg's default DATE parser converts to a JS Date using the backend process's
// local timezone, which shifts the calendar day depending on where the server
// happens to run. Keep DATE columns as raw 'YYYY-MM-DD' strings instead.
types.setTypeParser(types.builtins.DATE, (val) => val);

// PostgreSQL Connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT || 6543,
});

// GET minimal patient info for search cache
router.get('/patients/minimal', async (req, res) => {
  try {
    const query = `
      SELECT id_pac, nombre, apellidos, celular, telefono
      FROM pacientes
      ORDER BY nombre, apellidos
    `;
    const { rows } = await pool.query(query);
    res.status(200).json(rows);
  } catch (err) {
    console.error('Error fetching minimal patients:', err);
    res.status(500).json({ error: 'Error fetching patient cache' });
  }
});

router.post('/add-patient', async (req, res) => {
  const {
    nombre,
    apellidos,
    domicilio,
    zona,
    telefono,
    celular,
    profesion,
    fecha_nac,
    notas_pac
  } = req.body;

  try {
    const query = `
      INSERT INTO pacientes (
        nombre, apellidos, domicilio, zona,
        telefono, celular, profesion,
        fecha_nac, notas_pac,
        cobros_totales, saldo, visitas
      ) VALUES (
        $1, $2, $3, $4,
        $5, $6, $7,
        $8, $9,
        $10, $11, $12
      )
      RETURNING id_pac, nombre, apellidos, celular, telefono
    `;

    const values = [
      nombre,
      apellidos,
      domicilio,
      zona,
      telefono,
      celular,
      profesion,
      fecha_nac,
      notas_pac,
      0,       // cobros_totales initial value
      0,       // saldo initial value
      0        // visitas initial value
    ];

    const result = await pool.query(query, values);
    const newPatient = result.rows[0];

    res.status(200).json(newPatient); // send back the inserted patient data
  } catch (err) {
    console.error('Error adding patient:', err);
    res.status(500).json({ success: false, message: 'Error al añadir paciente.' });
  }
});

router.get('/patients/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const query = `SELECT * FROM pacientes WHERE id_pac = $1`;
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Paciente no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching patient:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

module.exports = router;