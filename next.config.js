/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/chat',
        destination: '/chat.html',
      },
    ]
  },
}

module.exports = nextConfig
