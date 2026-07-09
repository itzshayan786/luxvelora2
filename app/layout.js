import './globals.css'
import { Providers } from './providers'
import { Toaster } from 'sonner'

export const metadata = {
  title: 'Velora — Wear the Future',
  description: 'Velora is a futuristic Indian luxury fashion house. Premium oversized streetwear, cutting-edge silhouettes and next-generation design. Wear the Future.',
  keywords: 'Velora, luxury fashion India, premium streetwear, oversized clothing, futuristic fashion, designer clothing India',
  openGraph: {
    title: 'Velora — Wear the Future',
    description: 'Premium futuristic Indian luxury clothing.',
    type: 'website',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Ctext y='26' font-size='28' font-family='Space Grotesk' font-weight='700' fill='%230a0a0a'%3EV%3C/text%3E%3C/svg%3E" />
        <script dangerouslySetInnerHTML={{__html:'window.addEventListener("error",function(e){if(e.error instanceof DOMException&&e.error.name==="DataCloneError"&&e.message&&e.message.includes("PerformanceServerTiming")){e.stopImmediatePropagation();e.preventDefault()}},true);'}} />
      </head>
      <body className="bg-[#fafaf9] text-neutral-900 antialiased">
        <Providers>
          {children}
          <Toaster theme="light" position="bottom-right" toastOptions={{ style: { background: 'rgba(255,255,255,0.95)', border: '1px solid rgba(0,0,0,0.08)', color: '#0a0a0a', backdropFilter: 'blur(20px)', boxShadow: '0 10px 40px rgba(0,0,0,0.08)' } }} />
        </Providers>
      </body>
    </html>
  )
}
