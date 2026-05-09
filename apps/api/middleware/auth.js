
/**
 * File: apps/api/middleware/auth.js
 * Purpose: JWT authentication middleware
 */

/**
 * verifyToken middleware
 * Purpose: Verify JWT token and attach user to request
 * TODO: Implement token verification logic
 * - Extract token from Authorization header (Bearer token)
 * - Verify token using JWT utility
 * - Decode token to get user ID
 * - Fetch user from PocketBase
 * - Attach user to req.user
 * - Call next() if valid, return 401 if invalid
 */
const verifyToken = async (req, res, next) => {
  try {
    // TODO: Extract token from header
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // TODO: Verify token using JWT utility
    // const decoded = verifyJWT(token);
    
    // TODO: Fetch user from PocketBase
    // const user = await pb.collection('users').getOne(decoded.userId);
    
    // TODO: Attach user to request
    // req.user = user;
    
    // TODO: Call next()
    // next();
    
    res.status(501).json({ error: 'Token verification not implemented yet' });
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

/**
 * requireRole middleware
 * Purpose: Check if user has required role
 * TODO: Implement role checking logic
 * - Check if req.user exists (must use verifyToken first)
 * - Check if user.role matches required role(s)
 * - Call next() if authorized, return 403 if not
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    // TODO: Implement role checking
    res.status(501).json({ error: 'Role checking not implemented yet' });
  };
};

module.exports = {
  verifyToken,
  requireRole
};
