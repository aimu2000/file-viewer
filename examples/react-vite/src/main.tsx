import officePreset from '@file-viewer/preset-office'
import FileViewer, { type ViewerOptions } from '@file-viewer/react'
import { StrictMode, useMemo, useState, type ChangeEvent } from 'react'
import { createRoot } from 'react-dom/client'
import './style.css'

type PreviewSource = {
  url?: string
  file?: File
  filename: string
}

function App() {
  const [source, setSource] = useState<PreviewSource>({
    url: '/sample.pdf',
    filename: 'sample.pdf'
  })

  const options = useMemo<ViewerOptions>(
    () => ({
      preset: officePreset,
      rendererMode: 'replace',
      locale: 'en-US',
      theme: 'light',
      styleIsolation: 'shadow',
      toolbar: { position: 'bottom-right' },
      search: { enabled: true }
    }),
    []
  )

  const chooseFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setSource({ file, filename: file.name })
  }

  return (
    <main className="app-shell">
      <header className="hero">
        <div className="brand-mark" aria-hidden="true">
          FV
        </div>
        <div className="hero-copy">
          <p className="eyebrow">React 18/19 · Vite · Office preset</p>
          <h1>Native React document preview</h1>
          <p>PDF/OFD, Word, spreadsheet, and presentation support without a conversion backend.</p>
        </div>
        <div className="hero-actions">
          <label className="button button-primary" htmlFor="file-input">
            Choose an Office file
          </label>
          <input
            id="file-input"
            type="file"
            accept=".pdf,.ofd,.doc,.docx,.xls,.xlsx,.xlsm,.ppt,.pptx,.rtf,.odt,.ods,.odp"
            onChange={chooseFile}
          />
          <a
            className="button"
            href="https://doc.file-viewer.app/guide/quickstart-react"
            target="_blank"
            rel="noreferrer"
          >
            Read the guide
          </a>
        </div>
      </header>

      <section className="viewer-card" aria-label="File preview">
        <div className="viewer-meta">
          <div>
            <span className="status-dot" aria-hidden="true"></span>
            <strong>{source.filename}</strong>
          </div>
          <span className="preset-chip">preset-office</span>
        </div>
        <div className="viewer-host">
          <FileViewer {...source} options={options} />
        </div>
      </section>
    </main>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
