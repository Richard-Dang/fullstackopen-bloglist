const usersRouter = require("express").Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const authenticateUser = require("../middlewares/authenticateUser");

usersRouter.get("/", authenticateUser, async (req, res) => {
  const users = await User.find({}).populate("blogs", {
    url: 1,
    title: 1,
    author: 1,
    id: 1,
  });

  res.json(users);
});

usersRouter.post("/", async (req, res) => {
  const { password, username, name } = req.body;

  if (password.length < 3 || !username) {
    res.status(400).send({
      error: "username and password must be at least 3 characters long.",
    });
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = new User({
    username,
    name,
    passwordHash,
  });

  const savedUser = await user.save();
  res.json(savedUser);
});

module.exports = usersRouter;
