// Import Required Modules
require("dotenv").config();
const { Sequelize } = require("sequelize");
const moment = require("moment-timezone");

// Function to get the timezone offset
function getTimezoneOffset(timezone) {
  return moment.tz(timezone).format("Z");
}

// Initialize Sequelize Object
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "mysql",
  pool: {
    max: 512,
    min: 0,
    acquire: 60000,
    idle: 30000,
  },
  logging: process.env.SQL_LOG === "1" ? console.log : false,
  timezone: getTimezoneOffset(process.env.APP_TIMEZONE),
  retry: {
    match: [/Deadlock/i, Sequelize.ConnectionError],
    max: 3,
    backoffBase: 3000,
    backoffExponent: 1.5,
  },
});


module.exports = sequelize;
