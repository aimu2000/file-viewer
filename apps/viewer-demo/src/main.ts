import { createApp } from 'vue'
import App from './App.vue'

import './assets/main.css'
import FileViewer from '@file-viewer/vue3'

createApp(App).use(FileViewer)
  .mount('#app')
