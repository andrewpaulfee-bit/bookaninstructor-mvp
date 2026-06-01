import './globals.css'
import type { Metadata } from 'next'
import { absoluteUrl, defaultDescription, seoKeywords, siteUrl } from '../lib/seo'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'BookAnInstructor | Find and Book Instructors in Brisbane',
    template: '%s | BookAnInstructor'
  },
  description: defaultDescription,
  keywords: seoKeywords,
  alternates: {
    canonical: '/'
  },
  openGraph: {
    type: 'website',
    url: siteUrl,
    siteName: 'BookAnInstructor',
    title: 'BookAnInstructor | Find and Book Instructors in Brisbane',
    description: defaultDescription,
    images: [
      {
        url: absoluteUrl('/hero-main.png'),
        width: 1200,
        height: 630,
        alt: 'BookAnInstructor dance instructor booking platform'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BookAnInstructor | Find and Book Instructors in Brisbane',
    description: defaultDescription,
    images: [absoluteUrl('/hero-main.png')]
  },
  robots: {
    index: true,
    follow: true
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>
}
