import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'BookAnInstructor | Dance Instructors Brisbane',
  description: 'Find and book verified dance instructors, trainers and coaches in Brisbane.'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>
}
