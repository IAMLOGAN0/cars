const swaggerJsdoc = require("swagger-jsdoc");
const path = require("path");
const {
  _appProtocol,
  _appPort,
  _appUrl,
  _projectName,
} = require("../helpers/settings-helper");

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: _projectName || "Car API",
      version: "1.0.0",
      description: "This is a Swagger Documentation",
      contact: { email: "Sourav Nayak" },
    },
    servers: [
      {
        url: `${_appProtocol}://${_appUrl}:${_appPort}`,
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter JWT token like: Bearer <token>",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [path.join(__dirname, "../routes/*.js")],
};

module.exports = swaggerJsdoc(swaggerOptions);
