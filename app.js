// Import Required Modules
require("dotenv").config();
const express = require("express");
const compression = require("compression");
const cors = require("cors");
const sequelize = require("./utilities/database");
const http = require("http");
// const { handleFileUpload } = require("./helpers/storage-helper");
const { mountRoutes } = require("./routes/routes");
const fs = require("fs");
const path = require("path");
const morgan = require("morgan");

// Initialize Settings
const Settings = require("./helpers/settings-helper");

// Create Global Error Handler
function errorHandler(err, req, res, next) {
  console.error(err.stack);
  console.trace(err.stack);

  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENVIRONMENT === "development" ? err : {}, // Hide error details in production
  });
}

// Instantiate Express.JS
const app = express();

// Enable G-ZIP Compression On Response
app.use(compression());

// Tell Express It Is Running Behind A Proxy
app.set("trust proxy", true);

// Enable CORS Middleware (fix for Swagger and frontend)
app.use(cors({
  origin: '*', // Replace '*' with frontend URL in production
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
}));

// Handle preflight requests for all routes
app.options('*', cors());

// Setup Static Public Directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Enable Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Define Log Directory
const logDirectory = path.join(__dirname, "logs");
if (!fs.existsSync(logDirectory)) fs.mkdirSync(logDirectory);

// Define Log File
const logFilePath = path.join(logDirectory, "access.log");
const logStream = fs.createWriteStream(logFilePath, { flags: "a" });

// Morgan Log Middleware
app.use(
  morgan(
    (tokens, req, res) => {
      return [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, "content-length"),
        "-",
        tokens["response-time"](req, res),
        "ms",
        JSON.stringify(req.body),
        JSON.stringify(res.body),
      ].join(" ");
    },
    { stream: logStream }
  )
);

// Import and serve Swagger UI if needed
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./utilities/swagger');

// Serve Swagger UI at /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Start Server Function
async function startServer() {
  try {
    await Settings.init();

    const {
      _projectName,
      _isLambdaEnvironment,
      _alterTable,
      _appProtocol,
      _appPort,
      _appUrl,
    } = require("./helpers/settings-helper");

    // Maintain Relationships
    const DatabaseRelations = require("./database/database-relations");
    await DatabaseRelations.initializeRelations();

    // Initialize Routes
    await mountRoutes(app);

    // Default Route
    app.get("/", (req, res) => {
      res.status(200).send(`<center><h1>${_projectName}</h1></center>`);
    });

    await sequelize.sync({ alter: _alterTable });

    // If seeding function exists
    if (typeof initializeSeeding === "function") {
      await initializeSeeding();
    }

    if (!_isLambdaEnvironment) {
      const httpServer = http.createServer(app);

      // Global error handler
      app.use(errorHandler);

      // Use Railway's PORT, fallback to _appPort if running locally
      const PORT = process.env.PORT || _appPort || 3000;
      const HOST = '0.0.0.0'; // Important for Railway

      console.log(`App port is ${PORT}`);

      httpServer.listen(PORT, HOST, () => {
        console.log(`HTTP Server Started At ${_appProtocol}://${_appUrl}:${PORT}`);
      });
    }

  } catch (error) {
    console.log("Unable To Start The Server Due To: ", error.message);
    throw error;
  }
}

// Start Server Immediately
(async () => {
  await startServer();
})();

module.exports = app;
