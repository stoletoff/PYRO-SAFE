import type { NextConfig } from "next";

const isVercel = process.env.VERCEL === "1";
const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: "export",
  // На Vercel сайт в корне домена (""), на GitHub Pages — "/PYRO-SAFE"
  basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? (isVercel ? "" : (isProd ? "/PYRO-SAFE" : "")),
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
