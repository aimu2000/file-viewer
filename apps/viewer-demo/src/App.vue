<script setup lang='ts'>
import HelloWorld from './components/HelloWorld.vue'
</script>

<template>
  <HelloWorld />
</template>

<style>
html {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #eef5f1;
  color-scheme: light dark;
  font-family: Aptos, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

html[data-demo-theme='light'],
html[data-demo-theme='light'] body {
  background: #eef5f1;
  color-scheme: light;
}

html[data-demo-theme='dark'],
html[data-demo-theme='dark'] body {
  background: #0f171d;
  color-scheme: dark;
}

body {
  margin: 0;
  height: 100%;
  background: #eef5f1;
  overflow: hidden;
}

body,
#app {
  width: 100%;
  height: 100%;
}

#app {
  isolation: isolate;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

@media (prefers-color-scheme: dark) {
  html:not([data-demo-theme]),
  html:not([data-demo-theme]) body {
    background: #0f171d;
  }
}
</style>
