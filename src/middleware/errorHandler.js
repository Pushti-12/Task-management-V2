const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: 'Validation error', errors: err.errors });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({ message: 'Email already exists' });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Invalid token' });
  }

  res.status(500).json({ message: 'Internal server error' });
};

module.exports = errorHandler;