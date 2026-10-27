const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Resource not found at endpoint: ${req.originalUrl}`,
  });
};

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error internally in non-test mode
  if (process.env.NODE_ENV !== 'test') {
    console.error(`[Server Error] ${err.name || 'Error'}: ${err.message}`);
  }

  // Mongoose bad ObjectId CastError
  if (err.name === 'CastError') {
    const message = `Invalid identifier format: ${err.value}`;
    return res.status(400).json({ success: false, message });
  }

  // Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    const keys = Object.keys(err.keyValue || {});
    const key = keys.length > 0 ? keys[0] : 'field';
    const message = `A record with this ${key} already exists (${err.keyValue[key]}).`;
    return res.status(400).json({ success: false, message });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({
      success: false,
      message: messages[0] || 'Validation failed on input data',
      errors: messages,
    });
  }

  // JWT error
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid authorization token. Please log in again.',
    });
  }

  // JWT expired
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Authorization session expired. Please log in again.',
    });
  }

  const statusCode = res.statusCode === 200 ? (err.statusCode || 500) : res.statusCode;

  res.status(statusCode).json({
    success: false,
    message: error.message || 'Internal server error occurred',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = {
  notFound,
  errorHandler,
};
