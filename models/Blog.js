import mongoose from "mongoose"
// import { BLOG_STATUS } from "@/lib/blogs"

const BLOG_STATUS = {
  DRAFT: "DRAFT",
  PENDING_DRO: "PENDING_DRO", // Changed from PENDING_HOD
  PENDING_ADMIN: "PENDING_ADMIN", // Removed PENDING_FACULTY
  PUBLISHED: "PUBLISHED",
  REJECTED: "REJECTED",
}

const VerificationHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    enum: Object.values(BLOG_STATUS),
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  role: {
    type: String,
    required: true,
  },
  verifierId: {
    type: String,
  },
  verifierName: {
    type: String,
  },
  comments: {
    type: String,
    default: "",
  },
})

const BlogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a title"],
      maxlength: [100, "Title cannot be more than 100 characters"],
    },
    author: {
      id: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
    },
    status: {
      type: String,
      enum: Object.values(BLOG_STATUS),
      default: BLOG_STATUS.DRAFT,
    },
    publishedAt: {
      type: Date,
    },
    verificationHistory: [VerificationHistorySchema], // Renamed from reviewHistory
    // Research paper fields
    pdfUrl: {
      type: String,
      required: [true, "PDF is required for research papers"],
    },
    pdfFilename: {
      type: String,
      default: "",
    },
    // Add the link field for research paper submissions
    link: {
      type: String,
      default: "",
    },
    // Add a field to track if the link has been verified
    linkVerified: {
      type: Boolean,
      default: false,
    },
    abstract: {
      type: String,
      required: [true, "Abstract is required for research papers"],
    },
    keywords: {
      type: [String],
      default: [],
    },
    authors: {
      type: [String],
      default: [],
    },
    doi: {
      type: String,
      default: "",
    },
    publicationDate: {
      type: Date,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    // This ensures virtual fields are included when converting to JSON/Objects
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// Update the updatedAt field on save
BlogSchema.pre("save", function (next) {
  this.updatedAt = Date.now()
  next()
})

// Check if the model already exists to prevent overwriting during hot reloads
export default mongoose.models.Blog || mongoose.model("Blog", BlogSchema)
