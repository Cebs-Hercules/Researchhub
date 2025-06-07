/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Ensure server components can import mongoose
  experimental: {
    serverComponentsExternalPackages: [
      "mongoose",
      "mongodb",
      "@napi-rs/snappy-linux-x64-gnu",
      "@napi-rs/snappy-linux-x64-musl",
      "kerberos",
      "mongodb-client-encryption",
      "@mongodb-js/zstd",
      "aws4",
    ],
    esmExternals: "loose",
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Disable image optimization which can cause issues
  images: {
    unoptimized: true,
    domains: ["res.cloudinary.com"],
  },
  // Increase the timeout for builds
  staticPageGenerationTimeout: 180,
  // Disable strict mode temporarily for debugging
  reactStrictMode: false,
  webpack: (config, { isServer }) => {
    // This is to handle the binary modules error
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        "util/types": false,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        os: false,
        path: false,
        stream: false,
        zlib: false,
        http: false,
        https: false,
        dns: false,
        dgram: false,
        child_process: false,
      }
    }
    return config
  },
}

module.exports = nextConfig
