"use server"

import { put, del } from "@vercel/blob"
import { getCurrentUser } from "@/lib/auth"

// Upload a PDF to Vercel Blob
export async function uploadPdfToBlob(formData) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { error: "Unauthorized" }
    }

    const file = formData.get("file")
    if (!file) {
      return { error: "No file provided" }
    }

    // Validate file type
    if (file.type !== "application/pdf") {
      return { error: "Only PDF files are allowed" }
    }

    // Generate a unique filename with timestamp and user ID
    const timestamp = Date.now()
    const filename = `${timestamp}-${user.id}-${file.name.replace(/\s+/g, "_")}`

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: "public",
      contentType: file.type,
    })

    return {
      success: true,
      url: blob.url,
      filename: blob.pathname,
    }
  } catch (error) {
    console.error("Error uploading PDF:", error)
    return { error: error.message || "Failed to upload PDF" }
  }
}

// Delete a PDF from Vercel Blob
export async function deletePdfFromBlob(filename) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { error: "Unauthorized" }
    }

    if (!filename) {
      return { error: "No filename provided" }
    }

    await del(filename)

    return { success: true }
  } catch (error) {
    console.error("Error deleting PDF:", error)
    return { error: error.message || "Failed to delete PDF" }
  }
}

// Get a signed URL for a PDF (useful for private files if needed)
export async function getPdfUrl(filename) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { error: "Unauthorized" }
    }

    if (!filename) {
      return { error: "No filename provided" }
    }

    // For public files, we can just return the URL directly
    // This is a placeholder for if you want to use private files later
    return {
      success: true,
      url: `https://vercel-blob.com/${filename}`,
    }
  } catch (error) {
    console.error("Error getting PDF URL:", error)
    return { error: error.message || "Failed to get PDF URL" }
  }
}
