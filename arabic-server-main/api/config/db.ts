import mongoose from "mongoose";

const MAX_RETRIES = 5;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error("FATAL: MONGODB_URI is not set. Check your environment variables.");
    process.exit(1);
  }

  // Surface connection drops that happen *after* startup. Without these,
  // mongoose silently buffers commands and every request just hangs.
  mongoose.connection.on("error", (err) =>
    console.error("MongoDB connection error:", err.message)
  );
  mongoose.connection.on("disconnected", () =>
    console.warn("MongoDB disconnected — driver will attempt to reconnect")
  );
  mongoose.connection.on("reconnected", () => console.log("MongoDB reconnected"));

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await mongoose.connect(uri, {
        // Default is 30s, which is long enough that a platform health check
        // times out before we ever report the failure.
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      });

      // Log the resolved database name: if the URI has no path segment the
      // driver silently falls back to "test", which is easy to miss.
      console.log(`Connected to MongoDB (database: "${mongoose.connection.name}")`);
      return;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(
        `MongoDB connection attempt ${attempt}/${MAX_RETRIES} failed: ${message}`
      );

      if (attempt === MAX_RETRIES) {
        console.error(
          "Could not reach MongoDB after all retries. Common causes: the host's " +
            "IP is not in the Atlas Network Access allowlist, or the credentials " +
            "in MONGODB_URI are wrong."
        );
        process.exit(1);
      }

      await wait(attempt * 2000); // 2s, 4s, 6s, 8s
    }
  }
};

// Platforms like Render send SIGTERM on every redeploy. Close the pool so we
// don't leak connections against the Atlas cluster's connection limit.
export const registerDbShutdownHandlers = () => {
  const shutdown = async (signal: string) => {
    console.log(`${signal} received — closing MongoDB connection`);
    try {
      await mongoose.connection.close();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("Error while closing MongoDB connection:", message);
    } finally {
      process.exit(0);
    }
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
};
