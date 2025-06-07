"use server"

import { v2 as cloudinary } from "cloudinary"
import { getCurrentUser } from "@/lib/auth"

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

export async function uploadPdfAction(formData) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return { error: "Unauthorized" }
    }

    const file = formData.get("file")
    if (!file) {
      return { error: "No file provided" }
    }

    // We'll use client-side direct upload instead
    // This function is kept for backward compatibility
    return { error: "Please use client-side upload" }
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error)
    return { error: "Failed to upload PDF" }
  }
}

export async function deletePdfAction(publicId) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return { error: "Unauthorized" }
    }

    await cloudinary.uploader.destroy(publicId)
    return { success: true }
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error)
    return { error: "Failed to delete PDF" }
  }
}
