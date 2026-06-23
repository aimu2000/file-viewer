# @file-viewer/renderer-spreadsheet

Standalone spreadsheet renderer package for Flyfish File Viewer. It is powered by `styled-exceljs` and `e-virt-table`, previews XLSX, XLSM, XLSB, XLS, CSV, ODS, FODS, Numbers, and compatible spreadsheet files in the browser, and resolves the optional worker URL through the File Viewer asset manifest for offline enterprise deployments.

## Usage

```ts
import FileViewer from '@file-viewer/vue3'
import { spreadsheetRenderer } from '@file-viewer/renderer-spreadsheet'

const options = {
  rendererMode: 'replace',
  renderers: spreadsheetRenderer,
}
```

You can also compose it with other renderer packages:

```ts
import { pdfRenderer } from '@file-viewer/renderer-pdf'
import { spreadsheetRenderer } from '@file-viewer/renderer-spreadsheet'

const options = {
  rendererMode: 'replace',
  renderers: [pdfRenderer, spreadsheetRenderer],
}
```

## Capabilities

- Supports `.xlsx`, `.xltx`, `.xlsm`, `.xlsb`, `.xls`, `.xlt`, `.xltm`, `.csv`, `.ods`, `.fods`, and `.numbers`.
- Uses main-thread parsing by default to avoid worker stalls caused by local servers, mobile WebViews, MIME configuration, or strict CSP.
- Can opt into the static worker path with `options.spreadsheet.worker: true` and `options.spreadsheet.workerUrl`.
- Supports multiple sheets, horizontally scrollable sheet tabs, merged cells, row and column sizing, borders, fills, alignment, text color, workbook images, the global zoom provider, and optional header drag column resizing.
- Uses virtual rendering for interaction. Host components usually hide full-document print for spreadsheets to avoid printing only the current viewport.

## Offline Assets

The optional worker path is:

- `vendor/xlsx/sheet.worker.js`

For private deployments, override it with `options.spreadsheet.workerUrl`. The official Vite plugin and demo worker build script generate this file from this package's worker entry.

## Migration Note

Spreadsheet preview has moved completely out of `@file-viewer/core`. Core now only keeps the asset manifest, shared types, and a compatibility error message, and it no longer installs `styled-exceljs`, `e-virt-table`, or `tinycolor2` by default. Install this package and pass it through `renderers`, or use `@file-viewer/preset-all` for the complete spreadsheet experience.
