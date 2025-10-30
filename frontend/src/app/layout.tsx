import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ApolloWrapper } from '@/lib/apollo-wrapper'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://your-netlify-domain.netlify.app'),
  title: 'HarvestLedger - Agriculture Supply Chain & Financing',
  description: 'Transparent, secure, and efficient platform for tracking agricultural products and enabling harvest-backed financing through Hedera blockchain technology.',
  keywords: 'agriculture, blockchain, supply chain, financing, Hedera, farming, harvest, tokenization',
  authors: [{ name: 'HarvestLedger Team' }],
  creator: 'HarvestLedger',
  publisher: 'HarvestLedger',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://your-netlify-domain.netlify.app',
    title: 'HarvestLedger - Agriculture Supply Chain & Financing',
    description: 'Transparent, secure, and efficient platform for tracking agricultural products and enabling harvest-backed financing through Hedera blockchain technology.',
    siteName: 'HarvestLedger',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HarvestLedger - Agriculture Supply Chain & Financing',
    description: 'Transparent, secure, and efficient platform for tracking agricultural products and enabling harvest-backed financing through Hedera blockchain technology.',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#16a34a',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#16a34a" />
      </head>
      <body className={inter.className}>
        <ApolloWrapper>
          {children}
          <Toaster />
        </ApolloWrapper>
      </body>
    </html>
  )
}