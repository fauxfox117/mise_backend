const jwt = require("jsonwebtoken");
const { JWT_SECRET, DEMO_AUTH, DEMO_USER_ID } = require("../utils/config");
const UnauthorizedError = require("../errors/unauthorized-err");

module.exports = (req, res, next) => {
  if (DEMO_AUTH) {
    req.user = { id: DEMO_USER_ID };
    return next();
  }

  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return next(new UnauthorizedError("Authorization required"));
  }

  const token = authorization.replace("Bearer ", "");

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    return next();
  } catch (err) {
    return next(new UnauthorizedError("Invalid token"));
  }
};
