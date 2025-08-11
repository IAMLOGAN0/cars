// models/index.js
const sequelize = require("../../utilities/database");
const User = require("./userModel")(sequelize);
const ListingsModel = require("./listingModel")(sequelize);
const ListingCarGalleryImages = require("./listingCarGalleryImageModel")(sequelize);

const initializeRelations = () => {
  User.hasMany(ListingsModel, { foreignKey: "userId", as: "listings", onDelete: "CASCADE" });
  ListingsModel.belongsTo(User, { foreignKey: "userId", as: "user", onDelete: "CASCADE" });

  ListingsModel.hasMany(ListingCarGalleryImages, { foreignKey: "listingId", as: "galleryImages", onDelete: "CASCADE" });
  ListingCarGalleryImages.belongsTo(ListingsModel, { foreignKey: "listingId", as: "listing", onDelete: "CASCADE" });
};

module.exports = {
  sequelize,
  User,
  ListingsModel,
  ListingCarGalleryImages,
  initializeRelations,
};
