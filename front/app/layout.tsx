import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import PriceMarquee from '@/components/layout/PriceMarquee'
import SolanaProvider from '@/components/providers/WalletProvider'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Analytics } from '@vercel/analytics/next'

export const metadata: Metadata = {
  title: 'TendanceSwap - Solana Token Swapper',
  description: 'The fastest way to swap Solana tokens. Powered by Jupiter.',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <SolanaProvider>
          <PriceMarquee />
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          <SpeedInsights />
          <Analytics />
        </SolanaProvider>
      </body>
    </html>
  )
}
