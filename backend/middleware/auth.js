const jwt = require('jsonwebtoken');

const { getJWTSecret } = require('../utils/jwt');
const User = require('../models/User');
const { normalizeRole } = require('../config/roles');

// While a forced password change is outstanding the account is deliberately
// useless, so the token only unlocks the endpoints needed to clear the flag.
// Without this a student could ignore the modal and keep using a password the
// school never chose.
const ALLOWED_WHILE_PASSWORD_PENDING = [
  '/auth/change-password',
  '/user/profile'
];

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  try {
    const decoded = jwt.verify(token, getJWTSecret());

    // Role is deliberately reloaded from the database on every request. JWTs
    // are long-lived (7d) and embed the role at login; trusting that claim
    // would let a demoted admin keep elevated access until expiry. This also
    // normalises legacy `super_admin` values to `headmaster`.
    const user = await User.findById(decoded.id).select('role fullName isActive mustChangePassword');
    if (!user || user.isActive === false) {
      return res.status(401).json({ message: 'Account unavailable' });
    }

    req.userId   = decoded.id;
    req.userRole = normalizeRole(user.role || decoded.role);
    req.userName = user.fullName || decoded.name;

    const mustChangePassword = user.mustChangePassword === true || decoded.pwd === 1;
    req.mustChangePassword = mustChangePassword;

    if (mustChangePassword && !ALLOWED_WHILE_PASSWORD_PENDING.includes(req.path)) {
      return res.status(403).json({
        message: 'Password change required',
        code: 'PASSWORD_CHANGE_REQUIRED'
      });
    }
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = authMiddleware;
