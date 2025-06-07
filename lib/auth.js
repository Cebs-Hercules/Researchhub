import { hash, compare } from "bcryptjs"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"

export async function hashPassword(password) {
  return hash(password, 12)
}

export async function verifyPassword(password, hashedPassword) {
  return compare(password, hashedPassword)
}

export async function getSession() {
  try {
    return await getServerSession(authOptions)
  } catch (error) {
    console.error("Error getting session:", error)
    return null
  }
}

export async function getCurrentUser() {
  try {
    const session = await getSession()
    return session?.user || null
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

export async function requireAuth(requiredRoles = []) {
  try {
    const session = await getSession()

    if (!session) {
      redirect("/auth/signin?callbackUrl=/dashboard")
    }

    if (requiredRoles.length > 0 && !requiredRoles.includes(session.user.role)) {
      redirect("/unauthorized")
    }

    return session.user
  } catch (error) {
    console.error("Error in requireAuth:", error)
    redirect("/auth/signin?callbackUrl=/dashboard&error=Authentication+failed")
  }
}

export function checkRole(user, allowedRoles) {
  if (!user) return false
  return allowedRoles.includes(user.role)
}

// Update the ROLES object to replace HOD and Faculty with DRO
export const ROLES = {
  LECTURER: "Lecturer",
  DRO: "Department Research Officer",
  SUPER_ADMIN: "Super-Admin",
}

// Update the ROLE_HIERARCHY to reflect the new roles
export const ROLE_HIERARCHY = {
  [ROLES.LECTURER]: 1,
  [ROLES.DRO]: 2,
  [ROLES.SUPER_ADMIN]: 3,
}
