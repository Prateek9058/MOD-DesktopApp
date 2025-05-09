/** @type {import('next').NextConfig} */
module.exports = {
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
    distDir: process.env.NODE_ENV === 'production' ? '../app' : '.next',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    return config
  },
}
