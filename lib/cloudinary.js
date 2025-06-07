// Cloudinary utility functions

export const uploadToCloudinary = async (file) => {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary cloud name or upload preset is not set.")
  }

  if (!file) {
    throw new Error("No file selected.")
  }

  const formData = new FormData()
  formData.append("file", file)
  formData.append("upload_preset", uploadPreset)

  // Always use auto for resource_type to let Cloudinary determine the best type
  formData.append("resource_type", "auto")

  try {
    // Use the auto upload endpoint for all file types
    const uploadEndpoint = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`

    const response = await fetch(uploadEndpoint, {
      method: "POST",
      body: formData,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data?.error?.message || "Failed to upload file.")
    }

    console.log("Cloudinary upload response:", data)

    return {
      public_id: data.public_id,
      secure_url: data.secure_url,
      resource_type: data.resource_type,
      format: data.format,
    }
  } catch (error) {
    console.error("Cloudinary Upload Error:", error)
    throw error
  }
}

export async function deletePdf(publicId) {
  if (!publicId) return { success: false, message: "No public ID provided" }

  try {
    // This would typically be a server-side operation
    // For client-side, we need to call our API endpoint
    const response = await fetch(`/api/cloudinary/delete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        publicId,
        resourceType: "auto", // Use auto to let Cloudinary determine the resource type
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || "Failed to delete file")
    }

    return { success: true }
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error)
    return { success: false, message: error.message }
  }
}

export function extractPublicIdFromUrl(url) {
  if (!url) return null

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

  if (!cloudName || !url.includes(cloudName)) {
    return null
  }

  // This regex handles both image and raw/auto uploads
  const regex = new RegExp(
    `https://res.cloudinary.com/${cloudName}/(?:image|raw|auto)/upload/(?:v\\d+/)?(?:[^/]+/)?(.+)`,
  )
  const match = url.match(regex)

  return match ? match[1] : null
}

// Helper function to get a PDF-friendly URL from Cloudinary
export function getPdfFriendlyUrl(url) {
  if (!url) return null

  // If it's already a PDF-friendly URL (ends with .pdf), return it
  if (url.endsWith(".pdf")) return url

  // For Cloudinary URLs, ensure we're using the fl_attachment flag
  // This helps with direct PDF viewing
  if (url.includes("cloudinary.com")) {
    // Add fl_attachment to the URL if it's not already there
    if (!url.includes("fl_attachment")) {
      // Insert fl_attachment before the upload part
      return url.replace("/upload/", "/upload/fl_attachment/")
    }
  }

  return url
}
