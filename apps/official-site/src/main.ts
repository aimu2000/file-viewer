import { createApp } from 'vue'

// vue-tsc in this workspace does not infer the generated default export for this SFC entry.
// @ts-ignore
import App from './App.vue'
import './styles.css'

createApp(App).mount('#app')
