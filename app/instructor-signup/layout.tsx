import type { Metadata } from "next";
import { absoluteUrl } from "../../lib/seo";

export const metadata: Metadata = {
  title: "Become an Instructor",
  description:
    "Create your BookAnInstructor profile and apply to be listed for dance teaching, studio relief work, school workshops, private lessons, and events.",
  alternates: {
    canonical: "/instructor-signup",
  },
  openGraph: {
    title: "Become an Instructor",
    description:
      "Join BookAnInstructor as an approved instructor and receive relevant client requests.",
    url: absoluteUrl("/instructor-signup"),
  },
};

export default function InstructorSignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
