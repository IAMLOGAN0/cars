const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

const authController = require("../controllers/auth-controller");
const validationMiddleware = require("../middlewares/validation-middleware");
const { authMiddleware } = require("../middlewares/auth-middleware"); 

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login with email to receive OTP
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - emailAddress
 *             properties:
 *               emailAddress:
 *                 type: string
 *                 format: email
 *             example:
 *               emailAddress: "sourav.nayak@ogmaconceptions.com"
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "OTP has been sent successfully"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Something went wrong while sending mail"
 */
router.post(
  "/login",
  body("emailAddress").isEmail().withMessage("Valid email required"),
  validationMiddleware,
  authController.login
);



/**
 * @swagger
 * /auth/verify-otp:
 *   post:
 *     summary: Verify OTP sent to email
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - emailAddress
 *               - otp
 *             properties:
 *               emailAddress:
 *                 type: string
 *                 format: email
 *               otp:
 *                 type: string
 *             example:
 *               emailAddress: "sourav.nayak@ogmaconceptions.com"
 *               otp: "123456"
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "OTP has been verified successfully"
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 isVerified:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Invalid OTP or email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid OTP or email"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
 */
router.post(
  "/verify-otp",
  body("emailAddress").isEmail(),
  body("otp").notEmpty().withMessage("OTP is required"),
  validationMiddleware,
  authController.verifyOtp
);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get logged-in user info
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     parameters: []
 *     responses:
 *       200:
 *         description: User info retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "OK"
 *                 user:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                       example: "uuid-of-user"
 *                     emailAddress:
 *                       type: string
 *                       example: "sourav.nayak@ogmaconceptions.com"
 *                     role:
 *                       type: string
 *                       example: "Consumer"
 *                     firstName:
 *                       type: string
 *                       example: "Sourav"
 *                     lastName:
 *                       type: string
 *                       example: "Nayak"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
 *       404:
 *         description: Token not found / user not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Token not found"
 */
router.get("/me", authMiddleware, authController.me);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user and invalidate token
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     parameters: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Logout successfully"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
 *       404:
 *         description: Token not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Token not found"
 */
router.post("/logout", authMiddleware, authController.logout);

/**
 * @swagger
 * /auth/delete-account:
 *   delete:
 *     summary: Delete logged-in user account
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     parameters: []
 *     responses:
 *       200:
 *         description: Account deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Account deleted successfully"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
 */
router.delete("/delete-account", authMiddleware, authController.deleteAccount);

module.exports = router;
