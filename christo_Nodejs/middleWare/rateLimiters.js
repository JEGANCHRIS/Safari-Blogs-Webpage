// Rate-limit idempotent endpoints to 500ms per IP+route
const lastCall = new Map(); // key = ip|method|path

module.exports = function idempotentRateLimiter(windowMs = 2000) {
  return (req, res, next) => {
    const method = req.method.toUpperCase();
    // Only for idempotent write-ish methods you specified
    if (!["POST", "PUT", "PATCH", "DELETE"].includes(method)) return next();

    const key = `${req.ip}|${method}|${req.baseUrl}${req.path}`;
    const now = Date.now();
    const prev = lastCall.get(key) || 0;

    if (now - prev < windowMs) {
      return res.status(429).json({
        message: `Too many requests. Retry after ${windowMs - (now - prev)}ms.`,
      });
    }

    lastCall.set(key, now);
    next();
  };
};
