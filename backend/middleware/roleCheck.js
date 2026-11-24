const { normalizeRole, can } = require('../config/roles');

// Role guard. Both the required roles and the request role are normalised so
// legacy `super_admin` callers/tokens resolve to `headmaster`. Existing imports
// use `requireRole(...)` as a default export, so that shape is preserved.
const requireRole = (...roles) => (req, res, next) => {
  const requestRole = normalizeRole(req.userRole);
  const allowed = roles.map(normalizeRole);
  if (!requestRole || !allowed.includes(requestRole)) {
    return res.status(403).json({ message: 'Access denied' });
  }
  next();
};

// Capability guard for the narrow permission keys in config/roles.js. Use this
// for cross-role capabilities instead of repeating hardcoded role arrays.
const requirePermission = (permission) => (req, res, next) => {
  const requestRole = normalizeRole(req.userRole);
  if (!requestRole || !can(requestRole, permission)) {
    return res.status(403).json({ message: 'Access denied' });
  }
  next();
};

// Named exports for callers that prefer destructuring.
module.exports = requireRole;
module.exports.requireRole = requireRole;
module.exports.requirePermission = requirePermission;
