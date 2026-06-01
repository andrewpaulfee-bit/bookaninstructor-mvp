import type { Metadata } from "next";
import { absoluteUrl } from "../../lib/seo";

export const metadata: Metadata = {
  title: "FAQs",
  description:
    "Answers to common questions about finding instructors, posting requests, payments, messaging, reviews, and Working with Children requirements.",
  alternates: {
    canonical: "/faqs",
  },
  openGraph: {
    title: "BookAnInstructor FAQs",
    description:
      "Common questions about using BookAnInstructor as a client or instructor.",
    url: absoluteUrl("/faqs"),
  },
};

export default function FAQsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
