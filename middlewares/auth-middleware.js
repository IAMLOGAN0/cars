  const { User } = require('../database/models');
  const { validateToken } = require('../helpers/auth-helper');
  const { HttpStatusCodes, HttpStatusMessages } = require('../helpers/constants');

  async function authMiddleware(req, res, next) {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(HttpStatusCodes.UNAUTHORIZED).json({
          message: HttpStatusMessages.UNAUTHORIZED,
        });
      }

      const token = authHeader.split(' ')[1];
      
      // Adjust validateToken call according to your implementation:
      const decodedToken = validateToken(token);  // If your validateToken expects just token

      const userTokenRecord = await User.findOne({
        where: { id: decodedToken.userId },
        attributes: ['authTokens'],
      });

      if (!userTokenRecord) {
        return res.status(HttpStatusCodes.UNAUTHORIZED).json({
          message: HttpStatusMessages.UNAUTHORIZED,
        });
      }

      // *** FIX HERE ***
      let authTokensArray = userTokenRecord.authTokens;

      if (typeof authTokensArray === 'string') {
        try {
          authTokensArray = JSON.parse(authTokensArray);
        } catch (e) {
          console.error('Failed to parse authTokens:', e);
          authTokensArray = [];
        }
      }

      if (!Array.isArray(authTokensArray)) {
        authTokensArray = [];
      }
    

      const tokenDetails = authTokensArray.find(t => t.token === token);

      if (!tokenDetails) {
        return res.status(HttpStatusCodes.UNAUTHORIZED).json({
          message: 'Token Has Been Expired',
        });
      }

      delete decodedToken.iat;
      req.userData = decodedToken;

      next();
    } catch (error) {
      console.error('authMiddleware error:', error);
      return res.status(HttpStatusCodes.UNAUTHORIZED).json({
        message: HttpStatusMessages.UNAUTHORIZED,
      });
    }
  }

  module.exports = { authMiddleware };
