// models/userModel.js
const { DataTypes, Model } = require('sequelize');
const { AccountStatus, Models } = require('../../helpers/constants');

module.exports = (sequelize) => {
  class User extends Model {}

  User.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    role: {
      type: DataTypes.ENUM('Administrator', 'Consumer'),
      allowNull: false,
      defaultValue: 'Consumer',
    },
    avatar: DataTypes.STRING,
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    emailAddress: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    emailOTP: DataTypes.STRING,
    emailVerifiedAt: DataTypes.DATE,
    phoneCountryCode: DataTypes.STRING,
    phoneNumber: DataTypes.STRING,
    phoneOTP: DataTypes.STRING,
    phoneVerifiedAt: DataTypes.DATE,
    isOTPVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    providers: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    authTokens: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    userSettings: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
    accountStatus: {
      type: DataTypes.ENUM(...Object.values(AccountStatus)),
      defaultValue: AccountStatus.ACTIVE,
    },
  }, {
    sequelize,
    modelName: Models.UserModel,
    tableName: 'users',
    timestamps: true,
    indexes: [{ unique: true, fields: ['emailAddress'] }],
  });

  return User;
};
