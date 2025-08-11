const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const AppSettings = require("./settings-helper.js");
const { AccountStatus, HttpStatusCodes } = require("./constants");
const moment = require("./timezoneHelper");
const { User } = require("../database/models");

function getUserDetails(user) {
  return {
    userId: user.id,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    emailAddress: user.emailAddress,
    phoneCountryCode: user.phoneCountryCode,
    phoneNumber: user.phoneNumber,
    emailVerifiedAt: user.emailVerifiedAt,
    phoneVerifiedAt: user.phoneVerifiedAt,
    registeredAt: user.createdAt,
  };
}

function validateToken(token) {
  try {
    return jwt.verify(token, AppSettings._encryptionKey);
  } catch (error) {
    console.error("Token validation failed:", error.message);
    throw new Error("Invalid token");
  }
}

async function getUser({ emailAddress }) {
  return await User.findOne({
    where: { emailAddress },
    attributes: [
      "id",
      ["id", "userId"],
      "firstName",
      "lastName",
      "emailAddress",
      "role",
      "password",
    ],
    raw: true,
  });
}



async function generateToken({ userData, ipAddress = null }) {
  const token = jwt.sign(userData, AppSettings._encryptionKey);
  if (token) {
    const user = await User.findByPk(userData.userId);
    if (!user) throw new Error("User not found");

    let authTokens = user.authTokens || [];
    if (!Array.isArray(authTokens)) {
      console.warn('authTokens is not an array:', authTokens);
      authTokens = [];
    }

    authTokens.push({
      fcmToken: userData.fcmToken || null,
      token,
      userIpAddress: userData.ipAddress || ipAddress,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15), // 15 days
    });

    await user.update({ authTokens });
    return token;
  }
  throw new Error("Token generation failed");
}

async function destroyToken({ userId, token }) {
  const user = await User.findByPk(userId);
  if (!user) throw new Error("User not found");

  let tokens = user.authTokens || [];
  if (!Array.isArray(tokens)) tokens = [];

  tokens = tokens.filter((t) => t.token !== token);

  user.authTokens = tokens;
  await user.save();
}

async function updateEmailOtpInDatabase({ emailAddress, emailOtp }) {
  return await User.update(
    { emailOTP: emailOtp },
    { where: { emailAddress } }
  );
}

async function findUserInDatabase(emailAddress) {
  const user = await User.findOne({ where: { emailAddress }, raw: true });
  if (!user) {
    const error = new Error("User Not Found!");
    error.statusCode = HttpStatusCodes.NOT_FOUND;
    throw error;
  }
  return user;
}

async function createUserInDatabase({ userData, emailOtp }) {
  return await User.create({
    ...userData,
    emailOTP: emailOtp,
    role: "Consumer",
    accountStatus: AccountStatus.ACTIVE,
    emailVerifiedAt: moment(),
  });
}

async function verifyUserOtp({ emailAddress, otp }) {
  const user = await User.findOne({ where: { emailAddress } });
  if (!user) {
    const error = new Error("User Not Found!");
    error.statusCode = HttpStatusCodes.NOT_FOUND;
    throw error;
  }

  if (user.emailOTP !== otp) {
    const error = new Error("Invalid OTP!");
    error.statusCode = HttpStatusCodes.BAD_REQUEST;
    throw error;
  }

  await user.update({ emailOTP: null, isOTPVerified: true });
  return user;
}

async function validateUserProvider(providerType, providerId) {
  return await User.findOne({
    where: {
      providers: {
        [Op.contains]: [{ providerType, providerId }],
      },
    },
  });
}

async function registerSSOUser(providerType, providerId, firstName, lastName, emailAddress) {
  if (await validateUserProvider(providerType, providerId)) {
    return false; // User already registered with this provider
  }

  const existingUser = await User.findOne({
    where: { emailAddress, role: "Consumer" },
  });

  if (existingUser) {
    const providers = existingUser.providers || [];
    if (providers.some((p) => p.providerType === providerType && p.providerId === providerId)) {
      return false;
    }

    providers.push({ providerType, providerId });
    await existingUser.update({ providers });
    return existingUser;
  }

  return await User.create({
    role: "Consumer",
    firstName,
    lastName,
    emailAddress,
    emailVerifiedAt: moment(),
    accountStatus: AccountStatus.ACTIVE,
    providers: [{ providerType, providerId }],
  });
}

async function authenticateSSOUser(providerType, providerId) {
  return await validateUserProvider(providerType, providerId);
}

async function deleteUserAccount(userId) {
  return await User.destroy({ where: { id: userId } });
}

module.exports = {
  getUser,
  validateToken,
  getUserDetails,
  generateToken,
  destroyToken,
  updateEmailOtpInDatabase,
  findUserInDatabase,
  createUserInDatabase,
  verifyUserOtp,
  validateUserProvider,
  registerSSOUser,
  authenticateSSOUser,
  deleteUserAccount,
};
