require('dotenv').config();
const express = require('express');
const sequelize = require('./config/database');
require('./models'); // load models and associations

const logger = require('./middleware/logger');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const categoryRoutes = require('./routes/categories');
const supplierRoutes = require('./routes/suppliers');
const itemRoutes = require('./routes/items');

const app = express();
const PORT = process.env.PORT || 3000;

// Built-in middleware
app.use(express.json());

// Custom logger middleware
app.use(logger);

// API Routes
app.use('/categories', categoryRoutes);
app.use('/suppliers', supplierRoutes);
app.use('/items', itemRoutes);

// Root health check
app.get('/', (req, res) => {
  res.json({ message: 'Inventory API is running.', version: '1.0.0' });
});

// 404 catch-all (must be after all routes)
app.use(notFound);

// Global error handler (must be last, exactly 4 params)
app.use(errorHandler);

// Connect to DB and start server
sequelize
  .sync({ alter: true })
  .then(() => {
    console.log('Database synced successfully.');
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to the database:', err.message);
    process.exit(1);
  });
