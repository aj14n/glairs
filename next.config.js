/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/comfyui/:path*',
        destination: 'http://127.0.0.1:8188/:path*',
      },
    ]
  },
}

module.exports = nextConfig 