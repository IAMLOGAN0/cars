const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class ListingsModel extends Model {}

  ListingsModel.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    },
    title: { type: DataTypes.STRING, allowNull: false },
    thumb_Resized_image: { type: DataTypes.STRING, allowNull: true },
    description: { type: DataTypes.TEXT, allowNull: true },
    location: { type: DataTypes.STRING },
    year: { type: DataTypes.INTEGER },
    make: { type: DataTypes.STRING },
    model: { type: DataTypes.STRING },
    trim: { type: DataTypes.STRING },
    engine: { type: DataTypes.STRING },
    drivetrain: { type: DataTypes.STRING },
    transmission: { type: DataTypes.STRING },
    mileage: { type: DataTypes.STRING },
    vin: { type: DataTypes.STRING },
    bodyStyle: { type: DataTypes.STRING },
    exteriorColor: { type: DataTypes.STRING },
    interiorColor: { type: DataTypes.STRING },
    sellerType: { type: DataTypes.ENUM('dealer', 'private'), allowNull: true },
    chassisDescription: { type: DataTypes.TEXT, allowNull: true },
    suspensionDescription: { type: DataTypes.TEXT, allowNull: true },
    modificationNotes: { type: DataTypes.TEXT, allowNull: true },
    askingPrice: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    fixedPrice: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
    reservePrice: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
    startingBidPrice: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
    currentHighestBid: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
    minBidIncrement: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
    listingType: {
      type: DataTypes.ENUM('fixed_price', 'live_auction'),
      allowNull: false,
      defaultValue: 'fixed_price',
    },
    auctionStartTime: { type: DataTypes.DATE, allowNull: true },
    auctionEndTime: { type: DataTypes.DATE, allowNull: true },
    biddingDurationSeconds: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 2592000, // 30 days in seconds
    },
    isSponsored: { type: DataTypes.BOOLEAN, defaultValue: false },
    sponsoredPlan: {
      type: DataTypes.ENUM('basic', 'premium', 'featured'),
      allowNull: true,
      defaultValue: null,
    },
    status: {
      type: DataTypes.ENUM('active', 'sold', 'expired', 'pending'),
      defaultValue: 'active',
    },
  }, {
    sequelize,
    modelName: 'ListingsModel',
    tableName: 'listings',
    timestamps: true,
  });

  return ListingsModel;
};
