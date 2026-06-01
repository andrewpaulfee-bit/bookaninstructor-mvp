import type { Metadata } from "next";
import { absoluteUrl } from "../../lib/seo";

export const metadata: Metadata = {
  title: "Instructor Jobs and Teaching Requests",
  description:
    "Browse available instructor jobs and teaching requests for dance classes, workshops, studio cover, private lessons, and ongoing bookings.",
  alternates: {
    canonical: "/jobs",
  },
  openGraph: {
    title: "Instructor Jobs and Teaching Requests",
    description:
      "Approved instructors can review open client requests and reply to suitable bookings.",
    url: absoluteUrl("/jobs"),
  },
};

export default function JobsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
