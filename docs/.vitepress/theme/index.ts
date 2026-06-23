import DefaultTheme from 'vitepress/theme'
import { inBrowser, useRouter } from 'vitepress'
import { onMounted } from 'vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  setup() {
    const router = useRouter()

    onMounted(() => {
      if (!inBrowser) {
        return
      }

      const path = window.location.pathname.replace(/\/index\.html$/, '/')
      const isDocsRoot = path === '/' || path === ''
      if (!isDocsRoot || window.location.search.includes('no_lang_redirect=1')) {
        return
      }

      const languages = navigator.languages?.length
        ? navigator.languages
        : [navigator.language].filter(Boolean)
      const prefersChinese = languages.some(language => language.toLowerCase().startsWith('zh'))
      const redirected = window.sessionStorage.getItem('flyfish-docs-lang-redirect')

      if (!prefersChinese && !redirected) {
        window.sessionStorage.setItem('flyfish-docs-lang-redirect', 'en')
        router.go('/en/')
      }
    })
  }
}
