const notFound = (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `The route ${req.method} ${req.originalUrl} does not exist on this server.`,
  });
};

module.exports = notFound;
