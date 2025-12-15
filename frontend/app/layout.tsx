import './globals.css'
import './enhanced-styles.css'
import './rounded-styles.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Navigation } from '@/components/navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Meda - AI Medical Diagnostics',
  description: 'Advanced AI-powered medical diagnostic platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
          {/* Medical pattern overlay */}
          <div className="fixed inset-0 medical-pattern pointer-events-none z-0"></div>

          <Navigation />
          <main className="relative z-10">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
