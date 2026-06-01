import type { MetadataRoute } from "next";
import { absoluteUrl, siteUrl } from "../lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/agreements",
        "/api",
        "/client-profile",
        "/login",
        "/messages",
        "/my-agreements",
        "/my-jobs",
        "/onboarding",
        "/reviews",
      ],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: siteUrl,
  };
}
