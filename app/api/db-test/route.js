import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongoose-simple"

// Prevent this route from being prerendered
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    // Test database connection
    await connectToDatabase()

    return NextResponse.json({
      status: "ok",
      message: "Database connection successful",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Database test error:", error)
    return NextResponse.json(
      {
        status: "error",
        message: error.message,
        stack: error.stack,
      },
      { status: 500 },
    )
  }
}
