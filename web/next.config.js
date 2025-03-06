module.exports = {
  // Enable strict mode
  reactStrictMode: true,

  output: process.env.NEXT_EXPORT ? 'export' : undefined,

  assetPrefix: process.env.NEXT_EXPORT ? './' : '',
  publicRuntimeConfig: {
    // Set the base URL of your application
    baseUrl: './',
  },

  // Add the following lines for static export
  exportPathMap: async function () {
    return {
      '/': { page: '/' },
      '/avatars': { page: '/avatars' },
      '/mint': { page: '/mint' },
    }
  },

  // Disable Next.js Image Optimization API
  // necessary for static export
  images: {
    unoptimized: process.env.NEXT_EXPORT ? true : false,
  },
}
