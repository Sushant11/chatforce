import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { ReactQueryProvider } from '@/components/providers/ReactQueryProvider'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'ChatforceAI – Turn Your Docs Into Intelligent Chatbots',
  description:
    'Upload documents, pick a personality, set safety rules, and deploy a customized AI chatbot in minutes. No code required.',
  openGraph: {
    title: 'ChatforceAI',
    description: 'Build customized AI chatbots from your documents.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="font-sans antialiased bg-background text-foreground">
        <ReactQueryProvider>
          {children}
          <Toaster richColors position="top-right" />
        </ReactQueryProvider>
      </body>
    </html>
  )
}
