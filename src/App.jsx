import { useEffect } from 'react'
import { Link, Routes, Route, useLocation } from 'react-router-dom'
import Spline from '@splinetool/react-spline'
import { mergeTools } from './components/tools'
import ToolPage from './components/ToolPage'
import { Home, Scissors, Layers, Compress, Image as ImageIcon, FileImage, Unlock, Type } from 'lucide-react'

function Navbar() {
  const location = useLocation()
  return (
    <header className="sticky top-0 z-20 backdrop-blur supports-[backdrop-filter]:bg-white/40 bg-white/60 dark:bg-slate-900/60 border-b border-slate-200/60 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">PDFMaster Pro</Link>
        <nav className="flex items-center gap-6 text-sm text-slate-600 dark:text-slate-300">
          <Link className={"hover:text-blue-600 transition-colors" + (location.pathname === '/' ? ' text-blue-600' : '')} to="/">Home</Link>
          <a className="hover:text-blue-600" href="https://github.com" target="_blank" rel="noreferrer">GitHub</a>
        </nav>
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer className="border-t border-slate-200/60 dark:border-slate-800 py-8 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-500 dark:text-slate-400">
        <p>© {new Date().getFullYear()} PDFMaster Pro</p>
        <p>Made by Amrit</p>
      </div>
    </footer>
  )
}

function Hero() {
  useEffect(() => {
    document.body.classList.add('bg-white', 'dark:bg-slate-950')
    return () => {
      document.body.classList.remove('bg-white', 'dark:bg-slate-950')
    }
  }, [])

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1200px] h-[1200px] bg-gradient-to-b from-blue-500/20 via-blue-400/10 to-transparent blur-3xl rounded-full" />
      </div>
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 items-center px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="relative z-10">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
            Powerful PDF tools in your browser
          </h1>
          <p className="mt-4 text-slate-600 dark:text-slate-300 text-lg">
            A fast, privacy-friendly toolbox to merge, split, compress, convert, unlock and watermark PDFs. Files are processed securely on the server and never stored.
          </p>
          <div className="mt-6 flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-2"><Layers className="w-4 h-4" /> Merge</div>
            <div className="flex items-center gap-2"><Scissors className="w-4 h-4" /> Split</div>
            <div className="flex items-center gap-2"><Compress className="w-4 h-4" /> Compress</div>
            <div className="flex items-center gap-2"><ImageIcon className="w-4 h-4" /> Image ⇄ PDF</div>
            <div className="flex items-center gap-2"><Unlock className="w-4 h-4" /> Unlock</div>
            <div className="flex items-center gap-2"><Type className="w-4 h-4" /> Watermark</div>
          </div>
        </div>
        <div className="h-[380px] rounded-2xl bg-white/20 dark:bg-white/5 ring-1 ring-slate-200/60 dark:ring-white/10 overflow-hidden">
          <Spline scene="https://prod.spline.design/41MGRk-UDPKO-l6W/scene.splinecode" style={{ width: '100%', height: '100%' }} />
        </div>
      </div>
    </section>
  )
}

function ToolCard({ to, Icon, name, desc }) {
  return (
    <Link to={to} className="group block rounded-2xl p-5 ring-1 ring-slate-200/60 dark:ring-white/10 bg-white/70 dark:bg-slate-900/60 backdrop-blur hover:shadow-lg transition-all hover:-translate-y-0.5">
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white grid place-items-center">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white">{name}</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">{desc}</p>
        </div>
      </div>
    </Link>
  )
}

function HomePage() {
  return (
    <main>
      <Hero />
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <ToolCard to="/merge" Icon={Layers} name="Merge PDF" desc="Combine multiple PDFs into one" />
          <ToolCard to="/split" Icon={Scissors} name="Split PDF" desc="Extract or split by page range" />
          <ToolCard to="/compress" Icon={Compress} name="Compress PDF" desc="Reduce file size with smart compression" />
          <ToolCard to="/image-to-pdf" Icon={ImageIcon} name="Image to PDF" desc="Convert JPG/PNG to PDF" />
          <ToolCard to="/pdf-to-image" Icon={FileImage} name="PDF to Image" desc="Export PDF pages to PNG" />
          <ToolCard to="/unlock" Icon={Unlock} name="Unlock PDF" desc="Remove password protection" />
          <ToolCard to="/watermark" Icon={Type} name="Watermark" desc="Add text watermark to pages" />
        </div>
      </section>
    </main>
  )
}

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/merge" element={<ToolPage tool="merge" />} />
        <Route path="/split" element={<ToolPage tool="split" />} />
        <Route path="/compress" element={<ToolPage tool="compress" />} />
        <Route path="/image-to-pdf" element={<ToolPage tool="image-to-pdf" />} />
        <Route path="/pdf-to-image" element={<ToolPage tool="pdf-to-image" />} />
        <Route path="/unlock" element={<ToolPage tool="unlock" />} />
        <Route path="/watermark" element={<ToolPage tool="watermark" />} />
      </Routes>
      <Footer />
    </div>
  )
}

export default App
