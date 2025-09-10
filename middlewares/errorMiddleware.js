function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;

  const response = {
    status: "error",
    message:
      process.env.NODE_ENV === "production" && statusCode === 500
        ? "Something went wrong. Please try again later."
        : err.message,
  };

  res.status(statusCode).json(response);
}

module.exports = errorHandler;
