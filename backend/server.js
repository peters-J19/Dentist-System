// Entry point for the Express backend. Sets up middleware and mounts the
// one route file, which talks to Postgres directly (see dataRoutes.js).
require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // Parse JSON bodies

// Routes
const dataRoutes = require('./routes/dataRoutes');
app.use('/', dataRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});