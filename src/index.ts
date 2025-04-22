import dotenv from 'dotenv';
import app from './app';
import db from './models';

// Load environment variables from .env file
dotenv.config();

const PORT = process.env.PORT || 8000;

// Initialize database connection and start server
db.sequelize.sync({ alter: process.env.NODE_ENV === 'development' })
  .then(() => {
    console.log('Database connection has been established successfully.');

    // Start Express server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`API is available at http://localhost:${PORT}${process.env.API_PREFIX || '/api'}`);
    });
  })
  .catch((error) => {
    console.error('Unable to connect to the database:', error);
  });

// Handle application shutdown gracefully
process.on('SIGINT', async () => {
  console.log('Application is shutting down...');
  try {
    await db.sequelize.close();
    console.log('Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});
