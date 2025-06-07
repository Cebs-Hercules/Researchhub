import { NextResponse } from "next/server"

// Prevent this route from being prerendered
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      env: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL_ENV: process.env.VERCEL_ENV,
      },
    })
  } catch (error) {
    console.error("Health check error:", error)
    return NextResponse.json(
      {
        status: "error",
        message: error.message,
      },
      { status: 500 },
    )
  }
}
