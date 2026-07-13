import { setDefaultFullAssetBaseUrl } from '@file-viewer/vue3-full'
import { createApp } from 'vue'
import App from './App.vue'
import './style.css'

setDefaultFullAssetBaseUrl('/')
createApp(App).mount('#app')
