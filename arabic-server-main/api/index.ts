import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import hpp from "hpp";
import sanitizeHtml from "sanitize-html";
import { connectDB, registerDbShutdownHandlers } from "./config/db";

// Import routes
import homeRoutes from "./routes/homeRoutes";
import registrationRoute from "./routes/registrationRoutes";
import adminRoutes from "./routes/adminRoutes";
import userRoutes from "./routes/userRoutes";
import faqRoutes from "./routes/faqRoutes";
import newsletterRoutes from "./routes/newsletterRoutes";
import contactRoutes from "./routes/contactRoutes";
import insightRoutes from "./routes/insightRoutes";
import blogRoutes from "./routes/blogRoutes";

// Init the app
const app = express();
const PORT = process.env.PORT || 5000;

export const isProduction = process.env.NODE_ENV == "production";

// Fail at boot rather than at the first request that needs these. A missing
// JWT_SECRET makes every token verifiable-as-invalid; a missing CLIENT_URL
// throws inside the login handler when it builds the cookie domain.
const REQUIRED_ENV = ["JWT_SECRET", "CLIENT_URL"];
const missing = REQUIRED_ENV.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`FATAL: missing required environment variables: ${missing.join(", ")}`);
  process.exit(1);
}

// CLIENT_URL accepts a comma-separated list so apex + www (or a staging origin)
// can both be allowed. Anything not on the list is refused.
const allowedOrigins = (process.env.CLIENT_URL as string)
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

// General rate limit - 100 requests per 15 minutes per IP.
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  // Platform health checks would otherwise eat into the same budget as real
  // traffic and can trip the limit on their own.
  skip: (req) => req.path === "/health-check",
});

// Recursively strip HTML from every string in a payload. The previous version
// only walked top-level keys — and, being registered before the body parsers,
// never actually ran.
//
// Fields that must pass through byte-for-byte. sanitize-html escapes "&" to
// "&amp;" and drops "<x", so running it over a credential silently rewrites
// it: the value that reaches bcrypt is not the one the user typed, and any
// account whose password contains "&" or "<" can no longer sign in. Secrets
// are compared, never rendered, so there is nothing to sanitise here anyway.
const SKIP_SANITIZE_KEYS = new Set([
  "password",
  "oldPassword",
  "newPassword",
  "confirmPassword",
  "token",
  "tempToken",
  "masterKey",
  "code",
]);

const MAX_SANITIZE_DEPTH = 10;
const stripHtml = (value: unknown, key?: string, depth = 0): unknown => {
  if (depth > MAX_SANITIZE_DEPTH) return value;
  if (key && SKIP_SANITIZE_KEYS.has(key)) return value;

  if (typeof value === "string") {
    return sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} });
  }
  if (Array.isArray(value)) {
    return value.map((v) => stripHtml(v, key, depth + 1));
  }
  if (value && typeof value === "object" && (value as object).constructor === Object) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = stripHtml(v, k, depth + 1);
    }
    return out;
  }
  return value;
};

// Database connection & start server only after success
connectDB()
  .then(() => {
    // Behind a proxy (Cloudflare, Render, nginx) the client IP arrives in a
    // header. Without this the rate limiter sees one shared IP for everyone.
    if (isProduction) {
      app.set("trust proxy", 1);
    }

    // Security Middleware
    app.disable("x-powered-by");
    app.use(helmet());
    app.use(hpp());
    app.use(limiter);

    app.use(
      cors({
        origin: allowedOrigins,
        credentials: true,
      })
    );

    // Body parsing. Registered ONCE — a second express.json() never takes
    // effect, so a duplicate registration silently kept the default 100kb
    // limit instead of the intended one.
    app.use(express.json({ limit: "10mb" }));
    app.use(express.urlencoded({ limit: "10mb", extended: true }));

    // XSS protection. MUST run after the body parsers: before them req.body is
    // undefined, so this middleware used to be a no-op.
    app.use((req: Request, _res: Response, next: NextFunction) => {
      if (req.body && typeof req.body === "object") {
        req.body = stripHtml(req.body, undefined, 0) as typeof req.body;
      }
      next();
    });

    // Routes
    app.use("/", homeRoutes);
    app.use("/", registrationRoute);
    app.use("/admin", adminRoutes);
    app.use("/", userRoutes);
    app.use("/faq", faqRoutes);
    app.use("/newsletter", newsletterRoutes);
    app.use("/contact", contactRoutes);
    app.use("/insights", insightRoutes);
    app.use("/", blogRoutes);
    app.use("/health-check", (req, res) => {
      res.status(200).json({
        message: `Hi, Welcome to Arabic Juiniors Backend Server.!`,
        today: `${Date.now()}`,
      });
    });

    // Custom 404 handler
    app.use((_req: Request, res: Response) => {
      res.status(404).send("404!! Sorry can't find that!");
    });

    // Global error handler. The first parameter must be typed as the error
    // itself — it was previously declared as ErrorRequestHandler, and the
    // handler swallowed the error without logging it, so failures surfaced as
    // a bare "Something broke!" with nothing to debug from.
    app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
      const message = err instanceof Error ? err.stack || err.message : String(err);
      console.error(`Unhandled error on ${req.method} ${req.originalUrl}:`, message);
      if (res.headersSent) return;
      res.status(500).json({ message: "Something broke!" });
    });

    // Start the server
    app.listen(PORT, () => {
      console.log(`Backend Server is running on PORT: ${PORT}`);
      console.log(`Allowed origins: ${allowedOrigins.join(", ")}`);
    });

    registerDbShutdownHandlers();
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1); // Exit if DB connection fails
  });

export default app;
