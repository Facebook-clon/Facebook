const supabaseAdmin = require('./supabaseClient');

/**
 * Verifies the Bearer token sent by the mobile app (the same token
 * api.js attaches via AsyncStorage -> Authorization header) and
 * attaches the authenticated user to req.user.
 */
async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !data?.user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  req.user = data.user;
  next();
}

module.exports = requireAuth;
