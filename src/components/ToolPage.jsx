import { useMemo, useRef, useState } from 'react'
import { Loader2, Upload, X, Check, Download } from 'lucide-react'

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

const toolMeta = {
  merge: { title: 'Merge PDF', accept: 'application/pdf', multiple: true, endpoint: '/api/merge' },
  split: { title: 'Split PDF', accept: 'application/pdf', multiple: false, endpoint: '/api/split' },
  compress: { title: 'Compress PDF', accept: 'application/pdf', multiple: false, endpoint: '/api/compress' },
  'image-to-pdf': { title: 'Image to PDF', accept: 'image/*', multiple: true, endpoint: '/api/image-to-pdf' },
  'pdf-to-image': { title: 'PDF to Image', accept: 'application/pdf', multiple: false, endpoint: '/api/pdf-to-image' },
  unlock: { title: 'Unlock PDF', accept: 'application/pdf', multiple: false, endpoint: '/api/unlock' },
  watermark: { title: 'Watermark Tool', accept: 'application/pdf', multiple: false, endpoint: '/api/watermark' },
}

export default function ToolPage({ tool }) {
  const meta = toolMeta[tool]
  const [files, setFiles] = useState([])
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [resultUrl, setResultUrl] = useState(null)
  const [error, setError] = useState('')

  // tool options state
  const [ranges, setRanges] = useState('1-3')
  const [level, setLevel] = useState('medium')
  const [password, setPassword] = useState('')
  const [wmText, setWmText] = useState('CONFIDENTIAL')
  const [wmPos, setWmPos] = useState('center')

  const inputRef = useRef(null)

  const onSelect = (ev) => {
    setError('')
    const arr = Array.from(ev.target.files || [])
    setFiles(meta.multiple ? arr : arr.slice(0, 1))
  }

  const onDrop = (ev) => {
    ev.preventDefault()
    setError('')
    const arr = Array.from(ev.dataTransfer.files || [])
    const filtered = arr.filter(f => !meta.accept || f.type.startsWith(meta.accept.split('/')[0]))
    setFiles(meta.multiple ? filtered : filtered.slice(0, 1))
  }

  const removeFile = (idx) => setFiles(prev => prev.filter((_, i) => i !== idx))
  const reset = () => { setFiles([]); setResultUrl(null); setError(''); setProgress(0) }

  const canProcess = useMemo(() => files.length > 0 && !processing, [files, processing])

  const process = async () => {
    setProcessing(true)
    setError('')
    setResultUrl(null)
    setProgress(5)
    try {
      const form = new FormData()
      if (tool === 'merge') {
        files.forEach(f => form.append('files', f))
      } else if (tool === 'image-to-pdf') {
        files.forEach(f => form.append('files', f))
      } else {
        form.append('file', files[0])
      }

      if (tool === 'split') form.append('ranges', ranges)
      if (tool === 'compress') form.append('level', level)
      if (tool === 'unlock' && password) form.append('password', password)
      if (tool === 'watermark') { form.append('text', wmText); form.append('position', wmPos) }

      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 1000 * 60 * 2) // 2 min

      const res = await fetch(`${API_BASE}${meta.endpoint}` , { method: 'POST', body: form, signal: controller.signal })
      clearTimeout(timeout)

      if (!res.ok) {
        const maybeJson = await res.clone().json().catch(() => null)
        const msg = maybeJson?.detail || res.statusText
        throw new Error(msg)
      }
      setProgress(85)
      const blob = await res.blob()
      setProgress(95)
      const url = URL.createObjectURL(blob)
      setResultUrl(url)
      setProgress(100)
    } catch (e) {
      setError(e.message || 'Something went wrong')
    } finally {
      setProcessing(false)
    }
  }

  const suggestedName = () => {
    switch (tool) {
      case 'merge': return 'merged.pdf'
      case 'split': return 'split.pdf'
      case 'compress': return `compressed_${level}.pdf`
      case 'image-to-pdf': return 'images.pdf'
      case 'pdf-to-image': return 'pages.zip'
      case 'unlock': return 'unlocked.pdf'
      case 'watermark': return 'watermarked.pdf'
      default: return 'output.bin'
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6">{meta.title}</h2>

      <div
        className="rounded-2xl ring-1 ring-slate-200/60 dark:ring-white/10 bg-white/70 dark:bg-slate-900/60 backdrop-blur p-6"
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
      >
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="flex-1">
            <div className="border-2 border-dashed rounded-xl p-6 text-center bg-white/60 dark:bg-slate-900/40">
              <input ref={inputRef} type="file" multiple={meta.multiple} accept={meta.accept} className="hidden" onChange={onSelect} />
              <button onClick={() => inputRef.current?.click()} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium">
                <Upload className="w-4 h-4" /> Upload {meta.multiple ? 'Files' : 'File'}
              </button>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">or drag & drop here • up to 30 MB</p>
            </div>

            {files.length > 0 && (
              <ul className="mt-4 space-y-2">
                {files.map((f, i) => (
                  <li key={i} className="flex items-center justify-between text-sm rounded-lg px-3 py-2 bg-white/80 dark:bg-slate-800/60 ring-1 ring-slate-200/60 dark:ring-white/10">
                    <span className="truncate">{f.name} <span className="text-slate-500">({(f.size/1024/1024).toFixed(2)} MB)</span></span>
                    <button className="text-slate-500 hover:text-red-500" onClick={() => removeFile(i)}><X className="w-4 h-4" /></button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="w-full sm:w-80 space-y-4">
            {tool === 'split' && (
              <div>
                <label className="block text-sm font-medium mb-1">Page ranges</label>
                <input value={ranges} onChange={e=>setRanges(e.target.value)} placeholder="e.g. 1-3,5,8-10"
                  className="w-full rounded-lg px-3 py-2 bg-white/80 dark:bg-slate-800/60 ring-1 ring-slate-200/60 dark:ring-white/10" />
              </div>
            )}
            {tool === 'compress' && (
              <div>
                <label className="block text-sm font-medium mb-1">Compression level</label>
                <select value={level} onChange={e=>setLevel(e.target.value)} className="w-full rounded-lg px-3 py-2 bg-white/80 dark:bg-slate-800/60 ring-1 ring-slate-200/60 dark:ring-white/10">
                  <option value="low">Low (best quality)</option>
                  <option value="medium">Medium</option>
                  <option value="high">High (smallest size)</option>
                </select>
              </div>
            )}
            {tool === 'unlock' && (
              <div>
                <label className="block text-sm font-medium mb-1">Password (if required)</label>
                <input value={password} onChange={e=>setPassword(e.target.value)} type="password" className="w-full rounded-lg px-3 py-2 bg-white/80 dark:bg-slate-800/60 ring-1 ring-slate-200/60 dark:ring-white/10" />
              </div>
            )}
            {tool === 'watermark' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Text</label>
                  <input value={wmText} onChange={e=>setWmText(e.target.value)} className="w-full rounded-lg px-3 py-2 bg-white/80 dark:bg-slate-800/60 ring-1 ring-slate-200/60 dark:ring-white/10" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Position</label>
                  <select value={wmPos} onChange={e=>setWmPos(e.target.value)} className="w-full rounded-lg px-3 py-2 bg-white/80 dark:bg-slate-800/60 ring-1 ring-slate-200/60 dark:ring-white/10">
                    <option value="top-left">Top-left</option>
                    <option value="top-right">Top-right</option>
                    <option value="center">Center</option>
                  </select>
                </div>
              </>
            )}

            <button disabled={!canProcess} onClick={process} className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600 disabled:bg-blue-300 hover:bg-blue-700 text-white font-medium">
              {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} {processing ? 'Processing...' : 'Process'}
            </button>

            {processing && (
              <div className="w-full h-2 bg-slate-200/70 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 transition-all" style={{ width: `${progress}%` }} />
              </div>
            )}

            {error && <p className="text-sm text-red-600">{error}</p>}

            {resultUrl && (
              <div className="pt-2 flex items-center gap-3">
                <a href={resultUrl} download={suggestedName()} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium">
                  <Download className="w-4 h-4" /> Download
                </a>
                <button onClick={reset} className="px-3 py-2 rounded-lg ring-1 ring-slate-200/60 dark:ring-white/10">Start new task</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
