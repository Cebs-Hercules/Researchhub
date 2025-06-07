import { NextResponse } from "next/server"

export function middleware(request) {
  // Log the request path
  console.log(`Request path: ${request.nextUrl.pathname}`)

  // Continue to the next middleware or route handler
  return NextResponse.next()
}

// Only run the middleware on specific paths
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
