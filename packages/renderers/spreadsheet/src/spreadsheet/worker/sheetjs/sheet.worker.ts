import {
  createSpreadsheetParserContext,
  handleSpreadsheetWorkerRequest
} from './parser.js'

const ctx: Worker | null = typeof self === 'undefined'
  ? null
  : self as any

if (ctx) {
  const context = createSpreadsheetParserContext()

  ctx.onmessage = async (message) => {
    handleSpreadsheetWorkerRequest(context, message.data).forEach(response => {
      ctx.postMessage(response)
    })
  }

  ctx.onerror = (err) => {
    console.error(err)
  }
}
