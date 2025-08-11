// database/database-relations.js
const { initializeRelations } = require("./models");

class DatabaseRelations {
  static async initializeRelations() {
    initializeRelations();
    console.log("Database Relationship Defined");
  }
}

module.exports = DatabaseRelations;
