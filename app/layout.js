import './globals.css'
import Navbar from '@/components/Navbar'
import { ToastProvider } from '@/components/Toast'
import { AuthModalProvider } from '@/components/AuthModal'

export const metadata = {
  title: 'Hallaq — Barbershop Booking',
  description: 'Platform booking barbershop terpercaya',
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <AuthModalProvider>
          <ToastProvider>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-1">
                {children}
              </main>
              <footer className="bg-slate-900 border-t border-slate-800 py-10 mt-12">
                <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-2">
                    <span className="text-brand-500 text-2xl drop-shadow-sm">✂</span>
                    <span className="text-white font-bold text-xl tracking-tight">Hallaq</span>
                  </div>
                  <p className="text-sm text-slate-400 text-center md:text-right font-medium">
                    © 2026 All Rights Reserved
                  </p>
                </div>
              </footer>
            </div>
          </ToastProvider>
        </AuthModalProvider>
      </body>
    </html>
  )
}
