export function formatDate(date) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function truncateText(text, maxLength = 150) {
  if (!text) return ""
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + "..."
}

export function getStatusBadgeColor(status) {
  switch (status) {
    case "DRAFT":
      return "bg-gray-200 text-gray-800"
    case "PENDING_HOD":
      return "bg-yellow-100 text-yellow-800"
    case "PENDING_FACULTY":
      return "bg-orange-100 text-orange-800"
    case "PENDING_ADMIN":
      return "bg-blue-100 text-blue-800"
    case "PUBLISHED":
      return "bg-green-100 text-green-800"
    case "REJECTED":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export function getStatusLabel(status) {
  switch (status) {
    case "DRAFT":
      return "Draft"
    case "PENDING_DRO":
      return "Pending DRO Verification"
    case "PENDING_ADMIN":
      return "Pending Admin Verification"
    case "PUBLISHED":
      return "Published"
    case "REJECTED":
      return "Rejected"
    default:
      return status
  }
}

export function getBlogSummary(blog) {
  if (!blog) return ""
  return truncateText(blog.abstract || "", 150)
}
