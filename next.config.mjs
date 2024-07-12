/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      domains: ['m.media-amazon.com'],
    },
  };
  
  export default nextConfig;

  
// We updated the next.config.mjs
// Reason - To allow images from m.media-amazon.com in your Next.js project, you need to update your next.config.mjs file to include the images property with the appropriate domains.