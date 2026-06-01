import type { Metadata } from "next";
import { absoluteUrl } from "../../lib/seo";

export const metadata: Metadata = {
  title: "Find Dance Instructors in Brisbane",
  description:
    "Search approved instructors for hip hop, ballet, tap, jazz, contemporary, acro, wedding dance, Pilates, yoga, school workshops, studio cover, and private lessons.",
  alternates: {
    canonical: "/instructors",
  },
  openGraph: {
    title: "Find Dance Instructors in Brisbane",
    description:
      "Search approved instructors for dance classes, school workshops, studio relief teaching, private lessons, and events.",
    url: absoluteUrl("/instructors"),
  },
};

export default function InstructorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
