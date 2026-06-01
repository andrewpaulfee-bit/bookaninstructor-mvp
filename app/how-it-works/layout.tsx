import type { Metadata } from "next";
import { absoluteUrl } from "../../lib/seo";

export const metadata: Metadata = {
  title: "How BookAnInstructor Works",
  description:
    "Learn how clients post instructor jobs, approved instructors submit offers, bookings are confirmed, reviews are collected, and payouts are reviewed.",
  alternates: {
    canonical: "/how-it-works",
  },
  openGraph: {
    title: "How BookAnInstructor Works",
    description:
      "A clear booking process for instructor requests, offers, messaging, agreements, payments, reviews, and payouts.",
    url: absoluteUrl("/how-it-works"),
  },
};

export default function HowItWorksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
