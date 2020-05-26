const express = require("express");
const app = express();
require("express-async-errors"); //removes need for async try catch
const cors = require("cors");
const mongoose = require("mongoose");
const config = require("./utils/config");
const blogsRouter = require("./routes/blogs");
const usersRouter = require("./routes/users");
const loginRouter = require("./routes/login");
const commentsRouter = require("./routes/comments");
const errorHandler = require("./middlewares/errorHandler");

mongoose
  .connect(config.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("Failed to connect to MongoDB: ", err));

app.use(cors());
app.use(express.json());

app.use("/api/blogs", blogsRouter);
app.use("/api/users", usersRouter);
app.use("/api/login", loginRouter);
app.use("/api/blogs/:blogId/comments", commentsRouter);

if (process.env.NODE_ENV === "test") {
  const testingRouter = require("./routes/testing");
  app.use("/api/testing", testingRouter);
}

app.use(errorHandler);

module.exports = app;
