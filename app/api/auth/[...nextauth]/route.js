import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { connectToDatabase } from "@/lib/mongoose"
import { verifyPassword } from "@/lib/auth"
import User from "@/models/User"

// Prevent this route from being prerendered
export const dynamic = "force-dynamic"

// Log NextAuth configuration for debugging
console.log("NextAuth configuration:", {
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || "Not set",
  NEXTAUTH_SECRET_SET: !!process.env.NEXTAUTH_SECRET,
  GOOGLE_CLIENT_ID_SET: !!process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET_SET: !!process.env.GOOGLE_CLIENT_SECRET,
})

// Function to validate UPSA email format
function isValidUPSAEmail(email) {
  // Check if email is from upsamail.edu.gh domain
  if (!email.endsWith("@upsamail.edu.gh")) {
    console.log("Email rejected: Not from UPSA domain", email)
    return false
  }

  // Get the part before @ symbol
  const localPart = email.split("@")[0]

  // Check if the local part contains any numbers (student emails)
  if (/\d/.test(localPart)) {
    console.log("Email rejected: Contains numbers (likely a student email)", email)
    return false
  }

  return true
}

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          console.log("Authorizing credentials...")

          // Validate email format
          if (!isValidUPSAEmail(credentials.email)) {
            throw new Error("Only UPSA faculty emails are allowed. Student emails are not permitted.")
          }

          await connectToDatabase()

          const user = await User.findOne({
            email: credentials.email,
          }).lean()

          if (!user) {
            console.log("No user found with email:", credentials.email)
            throw new Error("No user found with this email")
          }

          if (!user.password) {
            console.log("User has no password (OAuth user):", credentials.email)
            throw new Error("This account doesn't use password authentication")
          }

          const isValid = await verifyPassword(credentials.password, user.password)

          if (!isValid) {
            console.log("Invalid password for user:", credentials.email)
            throw new Error("Invalid password")
          }

          console.log("User authenticated successfully:", user.email)
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
          }
        } catch (error) {
          console.error("Authorization error:", error)
          throw error
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: "Lecturer", // Default role for new Google users
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.role = token.role
      }
      return session
    },
    async signIn({ user, account }) {
      try {
        // Validate email format for all sign-in methods
        if (!isValidUPSAEmail(user.email)) {
          console.log("Sign-in rejected: Invalid UPSA email format", user.email)
          return false // Reject sign-in
        }

        if (account.provider === "google") {
          await connectToDatabase()

          // Check if user exists
          const existingUser = await User.findOne({
            email: user.email,
          })

          // If not, create a new user with default role
          if (!existingUser) {
            await User.create({
              email: user.email,
              name: user.name,
              image: user.image,
              role: "Lecturer", // Default role for new users
            })
          }
        }

        return true
      } catch (error) {
        console.error("Sign in callback error:", error)
        return false // Reject sign-in on error
      }
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
}

// This is the correct way to export handlers for Next.js App Router
const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
