/**
 * MongoDB Configuration
 *
 * MongoDB connection setup for The Copy application
 */

import { MongoClient, ServerApiVersion, Db } from "mongodb";
import { logger } from "@/utils/logger";

// MongoDB connection URI - MUST be provided via MONGODB_URI environment variable
// Never hardcode credentials in source code for security reasons
const uri = process.env.MONGODB_URI;

if (!uri) {
  logger.error("[MongoDB] MONGODB_URI environment variable is not set");
  throw new Error(
    "MONGODB_URI environment variable is required. Please set it in your .env file."
  );
}

// Enhanced connection options for production reliability
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  // Connection pool settings
  maxPoolSize: 10,
  minPoolSize: 2,

  // Timeout settings
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 10000,

  // Retry settings
  retryWrites: true,
  retryReads: true,

  // SSL/TLS settings
  tls: true,
  tlsAllowInvalidCertificates: false,
  tlsAllowInvalidHostnames: false,
});

let db: Db | null = null;
let isConnecting = false;

/**
 * Connect to MongoDB with enhanced error handling and retry logic
 */
export async function connectMongoDB(): Promise<Db> {
  try {
    // Prevent multiple simultaneous connection attempts
    if (isConnecting) {
      logger.info("[MongoDB] Connection already in progress, waiting...");
      while (isConnecting) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      if (db) return db;
    }

    if (!db) {
      isConnecting = true;
      logger.info("[MongoDB] Attempting to connect...");

      await client.connect();
      db = client.db("thecopy");

      // Test connection with timeout
      await Promise.race([
        client.db("admin").command({ ping: 1 }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Connection test timeout")), 5000)
        ),
      ]);

      logger.info("[MongoDB] Successfully connected!");
      isConnecting = false;
    }

    return db;
  } catch (error) {
    isConnecting = false;

    const errorMessage = error instanceof Error ? error.message : String(error);

    // Check for common SSL/IP whitelist errors
    if (errorMessage.includes("SSL") || errorMessage.includes("handshake")) {
      logger.error(
        "🚨 MongoDB SSL/Connection Error: This is likely due to IP Whitelisting."
      );
      logger.error(
        "Please ensure 0.0.0.0/0 is added to your MongoDB Atlas Network Access whitelist."
      );
    }

    logger.error("[MongoDB] Connection failed:", {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      uri: uri?.replace(/\/\/([^:]+):([^@]+)@/, "//$1:****@"), // Hide password in logs
    });
    throw error;
  }
}

/**
 * Get MongoDB database instance
 */
export function getMongoDB(): Db {
  if (!db) {
    throw new Error("MongoDB not connected. Call connectMongoDB() first.");
  }
  return db;
}

/**
 * Health check function
 */
export async function checkMongoDBHealth(): Promise<boolean> {
  try {
    if (!db) return false;
    await client.db("admin").command({ ping: 1 });
    return true;
  } catch (error) {
    logger.error("[MongoDB] Health check failed:", error);
    return false;
  }
}

/**
 * Close MongoDB connection
 */
export async function closeMongoDB(): Promise<void> {
  try {
    if (client) {
      await client.close();
      db = null;
      logger.info("[MongoDB] Connection closed");
    }
  } catch (error) {
    logger.error("[MongoDB] Error closing connection:", error);
  }
}

// Graceful shutdown
const shutdown = async () => {
  await closeMongoDB();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
