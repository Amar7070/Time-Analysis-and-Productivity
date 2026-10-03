const errorHandler = (err, req, res, next) => {
  console.error("Unhandled Error:", err.message);
  // Do not expose stack traces or internal implementation details
  res.status(err.status || 500).json({
    success: false,
    message: err.isOperational ? err.message : "Internal server error",
  });
};

export default errorHandler;
