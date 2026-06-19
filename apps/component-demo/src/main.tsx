import React, { useEffect, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import FileViewer from '@file-viewer/react'
import { mountViewer, type ViewerController } from '@file-viewer/web'
import './styles.css'

const docxPreviewUrl = '/example/word.docx'

function WebViewerPanel() {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!containerRef.current) {
      return
    }

    const controller: ViewerController = mountViewer(containerRef.current, {
      url: docxPreviewUrl
    })

    return () => {
      controller.destroy()
    }
  }, [])

  return <div ref={containerRef} className="viewer-host" data-testid="web-viewer-host" />
}

function App() {
  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <h1>Flyfish Viewer</h1>
          <p>Native component smoke test</p>
        </div>
        <nav className="topbar-actions" aria-label="Demo links">
          <a href="/manual-js.html" target="_blank" rel="noreferrer">
            Manual JS
          </a>
          <a href="/manual-iife.html" target="_blank" rel="noreferrer">
            Script tag
          </a>
          <a href="/jquery.html" target="_blank" rel="noreferrer">
            jQuery
          </a>
          <a href="/vue3.html" target="_blank" rel="noreferrer">
            Vue 3
          </a>
          <a href="/svelte-action.html" target="_blank" rel="noreferrer">
            Svelte
          </a>
        </nav>
      </header>

      <section className="viewer-grid" aria-label="Component preview">
        <article className="viewer-panel">
          <h2>React</h2>
          <div className="viewer-frame">
            <FileViewer url={docxPreviewUrl} data-testid="react-viewer" />
          </div>
        </article>

        <article className="viewer-panel">
          <h2>Web</h2>
          <div className="viewer-frame">
            <WebViewerPanel />
          </div>
        </article>
      </section>
    </main>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
