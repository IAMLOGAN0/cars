const aclMiddleware = (supportedUserTypes) => {
  return async (request, response, next) => {
    if (supportedUserTypes.includes(request.additionalUserData.userType)) {
      next();
    } else {
      response.status(403).json({ message: "Forbidden" });
    }
  };
};

module.exports = aclMiddleware;
