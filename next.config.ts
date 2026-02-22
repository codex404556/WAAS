import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const payloadUrl = process.env.NEXT_PUBLIC_PAYLOAD_URL;
const payloadHostname = payloadUrl
  ? (() => {
      try {
        return new URL(payloadUrl).hostname;
      } catch {
        return null;
      }
    })()
  : null;

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 7,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
        pathname: "/**",
      },
      ...(payloadHostname
        ? [
            {
              protocol: "https" as const,
              hostname: payloadHostname,
              pathname: "/**",
            },
          ]
        : []),
    ],
  },
};

export default withPayload(nextConfig);
