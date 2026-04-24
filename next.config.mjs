/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["pdfkit"],
  allowedDevOrigins: ["192.168.1.96"],
};

export default nextConfig;
