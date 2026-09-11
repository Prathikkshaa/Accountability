/** @type {import('next').NextConfig} */
// Fully static, client-side app — no server. Builds to ./out, hostable
// anywhere and wrappable into an APK (PWABuilder/TWA). NEXT_PUBLIC_BASE_PATH
// lets it live under a subpath (e.g. GitHub Pages /Accountability).
const base = process.env.NEXT_PUBLIC_BASE_PATH || '';

const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
  basePath: base || undefined,
  assetPrefix: base || undefined,
};

export default nextConfig;
