const { Sequelize } = require('sequelize');

const postgresConnectionTimeoutMs = Number(process.env.POSTGRES_CONNECTION_TIMEOUT_MS || 5000);

const sequelize = new Sequelize(
  process.env.POSTGRES_DB,
  process.env.POSTGRES_USER,
  process.env.POSTGRES_PASSWORD,
  {
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      connectTimeout: postgresConnectionTimeoutMs,
    },
    pool: {
      max: 5,
      min: 0,
      acquire: postgresConnectionTimeoutMs,
      idle: 10000,
    },
  }
);

module.exports = sequelize;
