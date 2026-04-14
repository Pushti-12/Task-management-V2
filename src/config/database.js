const mongoose = require('mongoose');
const sequelize = require('./postgres');

const dbConnectRetries = Number(process.env.DB_CONNECT_RETRIES || 10);
const dbRetryDelayMs = Number(process.env.DB_CONNECT_RETRY_DELAY_MS || 3000);
const mongoServerSelectionTimeoutMs = Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS || 5000);

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const connectMongo = async () => {
  await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: mongoServerSelectionTimeoutMs,
  });
  console.log('MongoDB connected');
};

const connectPostgres = async () => {
  await sequelize.authenticate();
  console.log('PostgreSQL connected');

  await sequelize.sync();
  console.log('Database synced');
};

const connectDB = async () => {
  for (let attempt = 1; attempt <= dbConnectRetries; attempt += 1) {
    try {
      await connectMongo();
      await connectPostgres();
      return;
    } catch (error) {
      console.error(`Database connection attempt ${attempt} failed:`, error.message);

      if (attempt === dbConnectRetries) {
        throw error;
      }

      console.log(`Retrying database connections in ${dbRetryDelayMs}ms...`);
      await delay(dbRetryDelayMs);
    }
  }
};

module.exports = connectDB;
