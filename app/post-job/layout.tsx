import type { Metadata } from "next";
import { absoluteUrl } from "../../lib/seo";

export const metadata: Metadata = {
  title: "Post a Job for an Instructor",
  description:
    "Post a request for a dance teacher, relief instructor, school workshop, studio class, private lesson, event instructor, or ongoing teaching role.",
  alternates: {
    canonical: "/post-job",
  },
  openGraph: {
    title: "Post a Job for an Instructor",
    description:
      "Tell BookAnInstructor what you need and receive replies from suitable approved instructors.",
    url: absoluteUrl("/post-job"),
  },
};

export default function PostJobLayout({ children }: { children: React.ReactNode }) {
  return children;
}
