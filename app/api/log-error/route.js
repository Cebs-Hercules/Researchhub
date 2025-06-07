import { NextResponse } from "next/server"

// Prevent this route from being prerendered
export const dynamic = "force-dynamic"

export async function POST(request) {
  try {
    const data = await request.json()

    // Log the error details
    console.error("Client-side error:", data.error)
    console.error("Error info:", data.info)
    console.error("Stack trace:", data.stack)

    // In a real application, you might store this in a database
    // or send it to an error tracking service

    return NextResponse.json({ status: "success" })
  } catch (error) {
    console.error("Error logging error:", error)
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 })
  }
}
