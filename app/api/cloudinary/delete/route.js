import { NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"
import { getCurrentUser } from "@/lib/auth"

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

// Prevent this route from being prerendered
export const dynamic = "force-dynamic"

export async function POST(request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { publicId, resourceType = "auto" } = await request.json()

    if (!publicId) {
      return NextResponse.json({ message: "Public ID is required" }, { status: 400 })
    }

    // Delete the file from Cloudinary with the correct resource type
    // Using 'auto' lets Cloudinary determine the resource type
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType })

    if (result.result !== "ok") {
      return NextResponse.json({ message: "Failed to delete file from Cloudinary" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "File deleted successfully" })
  } catch (error) {
    console.error("Error deleting file from Cloudinary:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
