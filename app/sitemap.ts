import type { MetadataRoute } from "next";
import { absoluteUrl } from "../lib/seo";

const publicRoutes = [
  { path: "/", priority: 1 },
  { path: "/instructors", priority: 0.95 },
  { path: "/post-job", priority: 0.9 },
  { path: "/instructor-signup", priority: 0.85 },
  { path: "/how-it-works", priority: 0.8 },
  { path: "/jobs", priority: 0.75 },
  { path: "/faqs", priority: 0.7 },
  { path: "/terms", priority: 0.35 },
  { path: "/privacy", priority: 0.35 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return publicRoutes.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified,
    changeFrequency: route.path === "/" ? "weekly" : "monthly",
    priority: route.priority,
  }));
}
