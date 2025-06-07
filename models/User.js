import mongoose from "mongoose"
// import { ROLES } from "@/lib/auth"

const ROLES = {
  LECTURER: "Lecturer",
  DRO: "Department-Research-Officer",
  SUPER_ADMIN: "Super-Admin",
}

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
      maxlength: [60, "Name cannot be more than 60 characters"],
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: false, // Not required for OAuth users
    },
    image: {
      type: String,
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.LECTURER,
    },
    // New fields for researcher profile
    department: {
      type: String,
      default: "",
    },
    position: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
    },
    researchInterests: {
      type: [String],
      default: [],
    },
    institution: {
      type: String,
      default: "",
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
UserSchema.pre("save", function (next) {
  this.updatedAt = Date.now()
  next()
})

// Check if the model already exists to prevent overwriting during hot reloads
export default mongoose.models.User || mongoose.model("User", UserSchema)
