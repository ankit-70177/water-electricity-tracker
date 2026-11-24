const jwt = require('jsonwebtoken');

// ---------------------------------------------------------------------------
// authenticateToken — JWT verification middleware
//
// Expects the client to send:
//   Authorization: Bearer <token>
//
// On success: attaches req.user = { userId, email } and calls next().
// On failure: responds with 401 (missing/malformed) or 403 (invalid/expired).
// ---------------------------------------------------------------------------
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  // The header must be present and start with "Bearer "
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.',
    });
  }

  // Extract the token part after "Bearer "
  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Token is missing.',
    });
  }

  try {
    // Verify the token using the same secret used to sign it
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the decoded payload to the request so route handlers can use it
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
    };

    next();
  } catch (error) {
    // jwt.verify throws for expired tokens, bad signatures, malformed tokens, etc.
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please log in again.',
      });
    }

    return res.status(403).json({
      success: false,
      message: 'Invalid token.',
    });
  }
};

module.exports = { authenticateToken };
