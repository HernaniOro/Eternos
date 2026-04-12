import type { NextConfig } from "next";

const isCapacitor = process.env.BUILD_TARGET === "capacitor";

const nextConfig: NextConfig = {
  output: "export",
  ...(isCapacitor
    ? {}
    : {
        basePath: "/Eternos",
        assetPrefix: "/Eternos/",
      }),
};

export default nextConfig;
