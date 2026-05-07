import './globals.css'
import Navbar from '@/components/Navbar'
import { ToastProvider } from '@/components/Toast'

export const metadata = {
  title: 'Hallaq — Barbershop Booking',
  description: 'Platform booking barbershop terpercaya',
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <ToastProvider>
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
          <footer className="bg-white border-t border-slate-100 py-12 mt-20">
            <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <span className="text-brand-500 text-2xl drop-shadow-sm">✂</span>
                <span className="text-slate-900 font-bold text-xl tracking-tight">Hallaq</span>
              </div>
              <p className="text-sm text-slate-500 text-center md:text-right font-medium">
                © 2026 All Rights Reserved
              </p>
            </div>
          </footer>
        </ToastProvider>
      </body>
    </html>
  )
}
