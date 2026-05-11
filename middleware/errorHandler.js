// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`);

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    error: statusCode === 500 ? 'Internal Server Error' : err.message,
    message: statusCode === 500
      ? 'An unexpected error occurred on the server.'
      : err.message,
  });
};

module.exports = errorHandler;
