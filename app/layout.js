import './globals.css'
import Navbar from '@/components/Navbar'

export const metadata = {
  title: 'Hallaq — Barbershop Booking',
  description: 'Platform booking barbershop terpercaya',
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <Navbar />
        <main className="min-h-screen">
          {children}
        </main>
        <footer className="bg-gray-900 text-gray-400 text-center py-6 text-sm mt-12">
          © 2024 Hallaq — Platform Barbershop Booking
        </footer>
      </body>
    </html>
  )
}
