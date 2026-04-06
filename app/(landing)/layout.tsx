import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  )
}
