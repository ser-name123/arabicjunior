import "dotenv/config";
import express, {
  ErrorRequestHandler,
  NextFunction,
  Request,
  Response,
} from "express";
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

// Rate limiting - max 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Database connection & start server only after success
connectDB()
  .then(() => {
    // Security Middleware
    app.use(helmet()); // Add security headers
    app.use(hpp()); // Protect against HTTP Parameter Pollution attacks

    // Rate limiting
    app.use(limiter);

    // XSS Protection - Sanitize HTML inputs
    app.use((req: Request, res: Response, next: NextFunction) => {
      if (req.body) {
        for (const key in req.body) {
          if (typeof req.body[key] === "string") {
            req.body[key] = sanitizeHtml(req.body[key], {
              allowedTags: [],
              allowedAttributes: {},
            });
          }
        }
      }
      next();
    });

    // Middleware setup
    app.use(express.json());
    app.use(
      cors({
        origin: process.env.CLIENT_URL || false, // ❌ SECURITY: Must set CLIENT_URL in production
        credentials: true,
      })
    );
    app.use(express.json({ limit: "10mb" })); // Reduced from 50mb for security
    app.use(express.urlencoded({ limit: "10mb", extended: true })); // Reduced from 50mb for security


    if (isProduction) {
      app.set("trust proxy", 1); // trust first proxy
    }

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
        today: `${Date.now()}`
      })
    });


    // Disable X-Powered-By for security
    app.disable("x-powered-by");

    // Custom 404 handler
    app.use((req: Request, res: Response, next: NextFunction) => {
      res.status(404).send("404!! Sorry can't find that!");
    });

    // Global error handler
    app.use(
      (
        err: ErrorRequestHandler,
        req: Request,
        res: Response,
        next: NextFunction
      ) => {
        res.status(500).send("Something broke!");
      }
    );

    // Start the server
    app.listen(PORT, () => {
      console.log(`Backend Server is running on PORT: ${PORT}`);
    });

    registerDbShutdownHandlers();
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1); // Exit if DB connection fails
  });

export default app;
