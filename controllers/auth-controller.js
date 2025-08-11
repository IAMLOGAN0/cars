const {
  generateToken,
  updateEmailOtpInDatabase,
  verifyUserOtp,
  createUserInDatabase,
  destroyToken,
  deleteUserAccount,
} = require("../helpers/auth-helper");

const { HttpStatusCodes, HttpStatusMessages } = require("../helpers/constants");
const { sendEmailOtp } = require("../helpers/mail-helper");
const { generateUniqueCode } = require("../helpers/fieldHelper");
const AppSettings = require("../helpers/settings-helper");
const { User } = require("../database/models");

async function login(request, reply) {
  try {
    const { emailAddress } = request.body;
    let generatedOtp;

    if (AppSettings._isLiveOtp) {
      generatedOtp = generateUniqueCode();

      const subject = "OTP";
      const mailData = { text: `Your OTP is: ${generatedOtp}` };

      const mailStatus = await sendEmailOtp(emailAddress, subject, mailData);

      if (!mailStatus) {
        return reply.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send({
          message: "Something went wrong while sending mail",
        });
      }
    } else {
      generatedOtp = "123456";
    }

    const user = await User.findOne({ where: { emailAddress } });

    if (user) {
      await updateEmailOtpInDatabase({ emailAddress, emailOtp: generatedOtp });
    } else {
      await createUserInDatabase({ userData: request.body, emailOtp: generatedOtp });
    }

    return reply.status(HttpStatusCodes.OK).send({ message: "OTP has been sent successfully" });
  } catch (error) {
    console.error(error);
    return reply.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send({
      message: "An unexpected error occurred",
    });
  }
}

async function me(request, reply) {
  return reply.status(HttpStatusCodes.OK).send({ message: HttpStatusMessages.OK, user: request.userData });
}

async function verifyOtp(request, reply) {
  try {
    const { emailAddress, otp } = request.body;

    const user = await verifyUserOtp({ emailAddress, otp });

    const token = await generateToken({
      userData: {
        userId: user.id,
        emailAddress: user.emailAddress,
        role: user.role,
        accountStatus: user.accountStatus,
        firstName: user.firstName,
        lastName: user.lastName,
        fcmToken: request.body.fcmToken || null,
        ipAddress: request.ip,
      },
      ipAddress: request.ip,
    });

    return reply.status(HttpStatusCodes.OK).send({
      message: "OTP has been verified successfully",
      token,
      isVerified: true,
    });
  } catch (error) {
    console.error(error);
    return reply.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send({
      message: "Failed to verify OTP",
    });
  }
}

async function logout(request, reply) {
  try {
    const token = request.headers.authorization?.split(" ")[1];
    if (token) {
      await destroyToken({ userId: request.userData.userId, token });
    }
    return reply.status(HttpStatusCodes.OK).send({
      message: "Logout successful",
    });
  } catch (error) {
    console.error(error);
    return reply.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send({
      message: "Logout failed",
    });
  }
}

async function deleteAccount(request, reply) {
  try {
    await deleteUserAccount(request.userData.userId);
    return reply.status(HttpStatusCodes.OK).send({ message: "Account deleted successfully" });
  } catch (error) {
    console.error(error);
    return reply.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send({
      message: "Failed to delete account",
    });
  }
}

module.exports = {
  login,
  me,
  verifyOtp,
  logout,
  deleteAccount,
};
