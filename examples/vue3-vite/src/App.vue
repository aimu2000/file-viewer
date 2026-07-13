<script setup lang="ts">
import { FileViewer, type ViewerOptions } from '@file-viewer/vue3-full'
import { computed, ref } from 'vue'

const selectedFile = ref<File>()
const filename = computed(() => selectedFile.value?.name ?? 'sample.pdf')

const options: ViewerOptions = {
  locale: 'en-US',
  theme: 'light',
  styleIsolation: 'shadow',
  toolbar: { position: 'bottom-right' },
  search: { enabled: true }
}

function chooseFile(event: Event) {
  const input = event.currentTarget as HTMLInputElement
  selectedFile.value = input.files?.[0]
}
</script>

<template>
  <main class="app-shell">
    <header class="hero">
      <div class="brand-mark" aria-hidden="true">FV</div>
      <div class="hero-copy">
        <p class="eyebrow">Vue 3 · Vite · Full package</p>
        <h1>One component, the complete format matrix</h1>
        <p>All 206 maintained extension mappings, with heavy renderers loaded only when needed.</p>
      </div>
      <div class="hero-actions">
        <label class="button button-primary" for="file-input">Choose any supported file</label>
        <input id="file-input" type="file" @change="chooseFile" />
        <a
          class="button"
          href="https://doc.file-viewer.app/guide/quickstart-vue3"
          target="_blank"
          rel="noreferrer"
          >Read the guide</a
        >
      </div>
    </header>

    <section class="viewer-card" aria-label="File preview">
      <div class="viewer-meta">
        <div>
          <span class="status-dot" aria-hidden="true"></span>
          <strong>{{ filename }}</strong>
        </div>
        <span class="preset-chip">full · 206 extensions</span>
      </div>
      <div class="viewer-host">
        <FileViewer
          :url="selectedFile ? undefined : '/sample.pdf'"
          :file="selectedFile"
          :options="options"
        />
      </div>
    </section>
  </main>
</template>
