import rateLimit from "express-rate-limit";

// Credential endpoints need a much tighter budget than the global 100/15min:
// under that shared limit an attacker gets 100 password guesses per window,
// and legitimate browsing by the same IP is what pays for it.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Too many attempts. Please try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
  // Only failed attempts count, so a working admin isn't locked out by
  // ordinary repeated logins.
  skipSuccessfulRequests: true,
});
