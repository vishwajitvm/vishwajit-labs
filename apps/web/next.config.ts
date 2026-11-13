import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Project thumbnails are public images; allow other sites to read them (e.g. to attach as LinkedIn media).
  async headers() {
    return [
      {
        source: "/project-thumbs/:file*",
        headers: [{ key: "Access-Control-Allow-Origin", value: "*" }],
      },
    ];
  },
};

export default nextConfig;
