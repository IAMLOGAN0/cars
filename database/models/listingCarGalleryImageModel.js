const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class ListingCarGalleryImages extends Model {}

  ListingCarGalleryImages.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    listingId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'listings', key: 'id' },
      onDelete: 'CASCADE',
    },
    photoResized: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'photo_resized',
    },
  }, {
    sequelize,
    modelName: 'ListingCarGalleryImages',
    tableName: 'listing_car_gallery_images',
    timestamps: true,
    indexes: [{ fields: ['listingId'] }],
  });

  return ListingCarGalleryImages;
};
