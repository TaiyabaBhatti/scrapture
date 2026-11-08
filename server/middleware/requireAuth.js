const admin = require("../config/firebaseAdmin");

// Expects: Authorization: Bearer <Firebase ID token>
async function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Not signed in" });
  }

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = {
      uid: decoded.uid,
      email: decoded.email || null,
      name: decoded.name || null,
    };
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired session" });
  }
}

module.exports = requireAuth;
