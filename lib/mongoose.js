import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable")
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    }

    console.log("Connecting to MongoDB...")

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log("MongoDB connected successfully")
        return mongoose
      })
      .catch((error) => {
        console.error("MongoDB connection error:", error)
        // Clear the promise so we can retry on next request
        cached.promise = null
        throw error
      })
  }

  try {
    cached.conn = await cached.promise
    return cached.conn
  } catch (e) {
    console.error("Failed to resolve MongoDB connection promise:", e)
    cached.promise = null
    throw e
  }
}

// Add a diagnostic function to check connection status
export async function checkDatabaseConnection() {
  try {
    const conn = await connectToDatabase()
    const state = mongoose.connection.readyState
    const stateMap = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting",
    }

    return {
      status: "success",
      state: stateMap[state] || "unknown",
      host: mongoose.connection.host,
      name: mongoose.connection.name,
    }
  } catch (error) {
    return {
      status: "error",
      message: error.message,
      stack: error.stack,
    }
  }
}

// Handle connection errors
mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err)
})

// Handle process termination
process.on("SIGINT", async () => {
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close()
  }
  process.exit(0)
})
