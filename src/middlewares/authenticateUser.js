const jwt = require("jsonwebtoken");
const User = require("../models/user");

const authenticateUser = async (req, res, next) => {
  const authorization = req.get("Authorization");
  if (!authorization) {
    return res.status(401).json({ error: "token missing or invalid" });
  }

  const token = authorization.substring(7);
  const { id } = jwt.verify(token, process.env.SECRET);
  if (!id) {
    return res.status(401).json({ error: "token missing or invalid" });
  }

  const user = await User.findById(id);

  req.user = user;
  next();
};

module.exports = authenticateUser;
