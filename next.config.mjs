import withPWAInit from "@ducanh2912/next-pwa";

const isCapacitor = process.env.BUILD_TARGET === "capacitor";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development" || isCapacitor,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: isCapacitor ? 'export' : undefined,
  images: { unoptimized: true }
};

export default isCapacitor ? nextConfig : withPWA(nextConfig);
