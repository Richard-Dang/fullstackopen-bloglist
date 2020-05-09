const errorHandler = (err, req, res, next) => {
  console.log(err.message);

  switch (err.name) {
    case "CastError":
      return res.status(400).send({ error: "malformatted id" });
    case "ValidationError":
      return res.status(400).send({ error: err.message });
    case "JsonWebTokenError":
      return res.status(401).send({ error: "invalid token" });
  }

  next(err);
};

module.exports = errorHandler;
