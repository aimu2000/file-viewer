import jquery from 'jquery'
import { installJQueryFileViewer } from '@file-viewer/jquery'
import './styles.css'

const sampleUrl = '/example/preview.md'
const host = document.getElementById('jquery-viewer')

if (!host) {
  throw new Error('Missing #jquery-viewer host element.')
}

const $ = jquery
installJQueryFileViewer($)

$(host).fileViewer({
  url: sampleUrl,
  options: {
    theme: 'light',
    toolbar: {
      position: 'bottom-right'
    }
  }
})

document.body.setAttribute('data-component', 'jquery')
