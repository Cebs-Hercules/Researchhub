import { NextResponse } from "next/server"
import { checkDatabaseConnection } from "@/lib/mongoose"
import { getSession } from "@/lib/auth"

// Prevent this route from being prerendered
export const dynamic = "force-dynamic"

export async function GET(request) {
  try {
    // Check environment variables
    const envVars = {
      MONGODB_URI: process.env.MONGODB_URI ? "Set" : "Not set",
      MONGODB_DB: process.env.MONGODB_DB ? "Set" : "Not set",
      NEXTAUTH_URL: process.env.NEXTAUTH_URL ? "Set" : "Not set",
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "Set" : "Not set",
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? "Set" : "Not set",
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? "Set" : "Not set",
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_URL: process.env.VERCEL_URL || "Not set",
    }

    // Check database connection
    const dbStatus = await checkDatabaseConnection()

    // Check auth session
    let sessionStatus = "Not checked"
    try {
      const session = await getSession()
      sessionStatus = session ? "Valid session" : "No session"
    } catch (error) {
      sessionStatus = `Error: ${error.message}`
    }

    // Return diagnostic information
    return NextResponse.json({
      status: "success",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      environmentVariables: envVars,
      databaseStatus: dbStatus,
      authStatus: sessionStatus,
      nodeVersion: process.version,
    })
  } catch (error) {
    console.error("Diagnostics error:", error)
    return NextResponse.json(
      {
        status: "error",
        message: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
