import { connectToDatabase } from "./mongoose"
import Blog from "@/models/Blog"
import { ROLES } from "./auth"

export const BLOG_STATUS = {
  DRAFT: "DRAFT",
  PENDING_DRO: "PENDING_DRO", // Changed from PENDING_HOD
  PENDING_ADMIN: "PENDING_ADMIN", // Removed PENDING_FACULTY
  PUBLISHED: "PUBLISHED",
  REJECTED: "REJECTED",
}

export async function getPublishedBlogs(limit = 0) {
  try {
    await connectToDatabase()

    const query = Blog.find({ status: BLOG_STATUS.PUBLISHED }).sort({ publishedAt: -1 })

    if (limit > 0) {
      query.limit(limit)
    }

    const blogs = await query.lean()

    return blogs.map((blog) => ({
      ...blog,
      _id: blog._id.toString(),
      id: blog._id.toString(),
      // Ensure these fields exist to prevent errors
      abstract: blog.abstract || "",
      keywords: blog.keywords || [],
      authors: blog.authors || [],
    }))
  } catch (error) {
    console.error("Error fetching published research papers:", error)
    // Return an empty array instead of throwing
    return []
  }
}

export async function getBlogById(id) {
  try {
    await connectToDatabase()

    const blog = await Blog.findById(id).lean()

    if (!blog) return null

    return {
      ...blog,
      _id: blog._id.toString(),
      id: blog._id.toString(),
      // Ensure these fields exist to prevent errors
      abstract: blog.abstract || "",
      keywords: blog.keywords || [],
      authors: blog.authors || [],
    }
  } catch (error) {
    console.error("Error fetching research paper:", error)
    return null
  }
}

export async function getBlogsByAuthor(authorId) {
  try {
    await connectToDatabase()

    const blogs = await Blog.find({ "author.id": authorId }).sort({ createdAt: -1 }).lean()

    return blogs.map((blog) => ({
      ...blog,
      _id: blog._id.toString(),
      id: blog._id.toString(),
      // Ensure these fields exist to prevent errors
      abstract: blog.abstract || "",
      keywords: blog.keywords || [],
      authors: blog.authors || [],
    }))
  } catch (error) {
    console.error("Error fetching research papers by author:", error)
    // Return an empty array instead of throwing
    return []
  }
}

// Update the getBlogsByStatus function to use the new status
export async function getBlogsByStatus(status) {
  await connectToDatabase()

  const blogs = await Blog.find({ status }).sort({ updatedAt: -1 }).lean()

  return blogs.map((blog) => ({
    ...blog,
    _id: blog._id.toString(),
    id: blog._id.toString(),
  }))
}

export async function createBlog(blogData, author) {
  await connectToDatabase()

  const newBlog = new Blog({
    ...blogData,
    author: {
      id: author.id,
      name: author.name,
      email: author.email,
    },
    status: BLOG_STATUS.DRAFT,
    reviewHistory: [],
  })

  await newBlog.save()

  return {
    ...newBlog.toObject(),
    _id: newBlog._id.toString(),
    id: newBlog._id.toString(),
  }
}

export async function updateBlog(id, blogData) {
  await connectToDatabase()

  const blog = await Blog.findByIdAndUpdate(id, { ...blogData }, { new: true }).lean()

  return {
    ...blog,
    _id: blog._id.toString(),
    id: blog._id.toString(),
  }
}

// Update the submitForReview function to use the new roles
export async function submitForVerification(id, currentRole) {
  await connectToDatabase()

  let nextStatus

  switch (currentRole) {
    case ROLES.LECTURER:
      nextStatus = BLOG_STATUS.PENDING_DRO
      break
    case ROLES.DRO:
      nextStatus = BLOG_STATUS.PENDING_ADMIN
      break
    default:
      throw new Error("Invalid role for verification submission")
  }

  const blog = await Blog.findByIdAndUpdate(
    id,
    {
      $set: { status: nextStatus },
      $push: {
        verificationHistory: {
          status: nextStatus,
          date: new Date(),
          role: currentRole,
        },
      },
    },
    { new: true },
  ).lean()

  return {
    ...blog,
    _id: blog._id.toString(),
    id: blog._id.toString(),
  }
}

// Update the approveBlog function to use the new roles
export async function verifyBlog(id, verifierRole, verifierId, verifierName, comments = "") {
  await connectToDatabase()

  let nextStatus

  switch (verifierRole) {
    case ROLES.DRO:
      nextStatus = BLOG_STATUS.PENDING_ADMIN
      break
    case ROLES.SUPER_ADMIN:
      nextStatus = BLOG_STATUS.PUBLISHED
      break
    default:
      throw new Error("Invalid role for verification")
  }

  const updateData = {
    status: nextStatus,
  }

  if (nextStatus === BLOG_STATUS.PUBLISHED) {
    updateData.publishedAt = new Date()
  }

  const blog = await Blog.findByIdAndUpdate(
    id,
    {
      $set: updateData,
      $push: {
        verificationHistory: {
          status: nextStatus,
          date: new Date(),
          role: verifierRole,
          verifierId,
          verifierName,
          comments,
        },
      },
    },
    { new: true },
  ).lean()

  return {
    ...blog,
    _id: blog._id.toString(),
    id: blog._id.toString(),
  }
}

// Update the rejectBlog function to use the new terminology
export async function rejectBlog(id, verifierRole, verifierId, verifierName, comments = "") {
  await connectToDatabase()

  const blog = await Blog.findByIdAndUpdate(
    id,
    {
      $set: { status: BLOG_STATUS.REJECTED },
      $push: {
        verificationHistory: {
          status: BLOG_STATUS.REJECTED,
          date: new Date(),
          role: verifierRole,
          verifierId,
          verifierName,
          comments,
        },
      },
    },
    { new: true },
  ).lean()

  return {
    ...blog,
    _id: blog._id.toString(),
    id: blog._id.toString(),
  }
}
