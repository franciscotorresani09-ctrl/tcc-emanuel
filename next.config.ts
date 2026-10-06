import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // a pasta deste projeto é a raiz (evita confundir com outros package.json acima)
  outputFileTracingRoot: path.join(__dirname),
  turbopack: {
    root: path.join(__dirname),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
