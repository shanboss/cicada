/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["pdfkit"],
  allowedDevOrigins: ["192.168.1.96"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "towexkhijugmytktakxd.supabase.co",
      },
    ],
  },
};

export default nextConfig;
