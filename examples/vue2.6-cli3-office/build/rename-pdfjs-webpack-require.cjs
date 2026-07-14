module.exports = function isolatePdfjsWebpackRuntime(source) {
  const normalizedPath = this.resourcePath.replace(/\\/g, '/')
  const shouldPatch =
    /\/pdfjs-dist\/legacy\/build\/pdf\.mjs$/.test(normalizedPath) ||
    /\/pdfjs-dist\/legacy\/web\/pdf_viewer\.mjs$/.test(normalizedPath)

  if (!shouldPatch) {
    return source
  }

  // PDF.js ships an ESM facade around its own webpack bootstrap. Webpack 4
  // reuses the same reserved identifiers for the outer module wrapper; in
  // particular, PDF.js' `var __webpack_exports__` is hoisted and shadows the
  // outer export parameter before harmony exports are registered. Isolate the
  // complete inner runtime namespace instead of patching only require().
  return source.replace(
    /\b__webpack_(modules|module_cache|exports|require)__\b/g,
    (_match, name) => `__pdfjs_webpack_${name}__`
  )
}
