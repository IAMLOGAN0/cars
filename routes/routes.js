// Mount Routes
exports.mountRoutes = (app) => {
  // Define Swagger
  const swaggerDocs = require("../utilities/swagger");
  const swaggerUi = require("swagger-ui-express");

  // Define Swagger Endpoint
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Define Web Routes
const authRoute = require("./auth-route");
const listingRoute = require("./listing-route");

app.use("/auth", authRoute);
app.use("/listing", listingRoute);

  
};
