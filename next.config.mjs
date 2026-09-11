/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fully static, client-side app — no server needed. Builds to ./out,
  // which can be hosted anywhere and wrapped into an APK (PWABuilder/TWA).
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
