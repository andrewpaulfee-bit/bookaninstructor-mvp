export const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL || "https://app.bookaninstructor.com";

export const seoKeywords = [
  "book a dance instructor",
  "dance instructors Brisbane",
  "dance teacher Brisbane",
  "hire a dance teacher",
  "relief dance teacher",
  "dance workshop instructor",
  "school dance workshops",
  "dance teacher for schools",
  "dance teacher for studios",
  "private dance lessons Brisbane",
  "kids dance classes Brisbane",
  "hip hop teacher Brisbane",
  "ballet teacher Brisbane",
  "tap teacher Brisbane",
  "jazz dance teacher Brisbane",
  "contemporary dance teacher Brisbane",
  "acro teacher Brisbane",
  "musical theatre instructor",
  "wedding dance teacher Brisbane",
  "Pilates instructor Brisbane",
  "yoga instructor Brisbane",
  "dance instructor Gold Coast",
  "dance instructor Sunshine Coast",
];

export const defaultDescription =
  "Find, compare, and book reviewed instructors for dance classes, school workshops, studio relief teaching, private lessons, and events across Brisbane and Queensland.";

export function absoluteUrl(path = "/") {
  return new URL(path, siteUrl).toString();
}

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "BookAnInstructor",
  url: siteUrl,
  logo: absoluteUrl("/logo-mark.png"),
  email: "info@bookaninstructor.com",
};

export const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "BookAnInstructor",
  url: siteUrl,
  potentialAction: {
    "@type": "SearchAction",
    target: `${absoluteUrl("/instructors")}?style={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};
