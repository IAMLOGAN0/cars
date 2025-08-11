// Import Required Modules
require("dotenv").config();
const { Sequelize } = require("sequelize");
const moment = require("moment-timezone");

// Function to get the timezone offset
function getTimezoneOffset(timezone) {
  return moment.tz(timezone).format("Z");
}

// Initialize Sequelize Object
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    dialect: "mysql",
    host: process.env.DB_HOST,
    pool: {
      max: 512,
      min: 0,
      acquire: 60000,
      idle: 30000,
    },
    logging: process.env.SQL_LOG === "1" ? console.log : false,
    timezone: getTimezoneOffset(process.env.APP_TIMEZONE),
    retry: {
      match: [/Deadlock/i, Sequelize.ConnectionError], // Retry on connection errors
      max: 3, // Maximum retry 3 times
      backoffBase: 3000, // Initial backoff duration in ms. Default: 100,
      backoffExponent: 1.5, // Exponent to increase backoff each try. Default: 1.1
    },
  }
);

module.exports = sequelize;
