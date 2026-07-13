import litePreset from '@file-viewer/preset-lite'
import {
  defineFileViewerElement,
  type FileViewerElement,
  type ViewerOptions
} from '@file-viewer/web'
import './style.css'

defineFileViewerElement()

const viewer = document.querySelector<FileViewerElement>('#viewer')
const fileInput = document.querySelector<HTMLInputElement>('#file-input')
const filename = document.querySelector<HTMLElement>('#filename')

if (!viewer || !fileInput || !filename) {
  throw new Error('The Vanilla example could not find its viewer controls.')
}

const options: ViewerOptions = {
  preset: litePreset,
  rendererMode: 'replace',
  locale: 'en-US',
  theme: 'light',
  toolbar: { position: 'bottom-right' },
  search: { enabled: true }
}

viewer.options = options

fileInput.addEventListener('change', () => {
  const file = fileInput.files?.[0]
  if (!file) return

  filename.textContent = file.name
  viewer.source = {
    file,
    filename: file.name,
    options
  }
})
