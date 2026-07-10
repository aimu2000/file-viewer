import type { WorkBook } from 'styled-exceljs';
import { read, utils } from 'styled-exceljs';
import SheetJsModel from './SheetJsModel.js';
import { parseSpreadsheetCharts } from './chartParser.js';
import type { SheetChartDefinition, SheetDefinition } from '../type.js';

interface DrawingMarkerLike {
  row?: number;
  col?: number;
}

interface DrawingImageLike {
  anchor?: {
    from?: DrawingMarkerLike;
    to?: DrawingMarkerLike;
  };
}

interface WorksheetWithDrawings {
  '!drawings'?: {
    images?: DrawingImageLike[];
  };
}

export interface SpreadsheetParserContext {
  workbook: WorkBook | null;
  sheets: SheetDefinition[];
  charts: Record<string, SheetChartDefinition[]>;
}

export interface SpreadsheetWorkerRequest {
  type: string;
  payload?: Record<string, any>;
}

export interface SpreadsheetWorkerResponse {
  type: string;
  payload?: Record<string, any>;
}

const readOptions = {
  type: 'array' as const,
  dense: true,
  cellDates: true,
  cellStyles: true,
  browserPixels: true,
  drawings: true,
  validateMerges: true,
};

export const createSpreadsheetParserContext = (): SpreadsheetParserContext => ({
  workbook: null,
  sheets: [],
  charts: {},
});

const toErrorResponse = (
  error: unknown,
  payload: Record<string, any> = {}
): SpreadsheetWorkerResponse => ({
  type: 'parseError',
  payload: {
    ...payload,
    message: error instanceof Error ? error.message : String(error),
  },
});

const getDrawingBounds = (worksheet: WorksheetWithDrawings | undefined) => {
  const images = worksheet?.['!drawings']?.images || [];
  return images.reduce((bounds, image) => {
    const anchor = image.anchor;
    const row = Number(anchor?.to?.row ?? anchor?.from?.row);
    const col = Number(anchor?.to?.col ?? anchor?.from?.col);
    return {
      rowCount: Number.isFinite(row) ? Math.max(bounds.rowCount, row + 1) : bounds.rowCount,
      colCount: Number.isFinite(col) ? Math.max(bounds.colCount, col + 1) : bounds.colCount,
    };
  }, {
    rowCount: 0,
    colCount: 0,
  });
};

const getChartBounds = (charts: SheetChartDefinition[] | undefined) => {
  return (charts || []).reduce((bounds, chart) => {
    const estimatedRows = chart.ext?.height
      ? Math.ceil(chart.ext.height / 9525 / 20)
      : 0;
    const estimatedCols = chart.ext?.width
      ? Math.ceil(chart.ext.width / 9525 / 64)
      : 0;
    const row = chart.to?.row ?? chart.from.row + estimatedRows;
    const col = chart.to?.col ?? chart.from.col + estimatedCols;
    return {
      rowCount: Math.max(bounds.rowCount, row + 1),
      colCount: Math.max(bounds.colCount, col + 1),
    };
  }, {
    rowCount: 0,
    colCount: 0,
  });
};

const parseSheets = (context: SpreadsheetParserContext): SpreadsheetWorkerResponse[] => {
  const workbook = context.workbook;
  if (!workbook?.SheetNames) {
    return [];
  }

  const workbookSheets = workbook.Workbook?.Sheets || [];
  context.sheets = workbook.SheetNames.reduce<SheetDefinition[]>((result, name, sourceIndex) => {
    const worksheet = workbook.Sheets[name];
    const ref = worksheet?.['!ref'];
    const drawingBounds = getDrawingBounds(worksheet as WorksheetWithDrawings | undefined);
    const chartBounds = getChartBounds(context.charts[name]);
    if (!ref && !drawingBounds.rowCount && !drawingBounds.colCount && !chartBounds.rowCount && !chartBounds.colCount) {
      return result;
    }
    const range = ref ? utils.decode_range(ref) : utils.decode_range('A1');
    result.push({
      id: result.length,
      name,
      hidden: !!workbookSheets[sourceIndex]?.Hidden,
      rowCount: Math.max(range.e.r + 1, drawingBounds.rowCount, chartBounds.rowCount),
      colCount: Math.max(range.e.c + 1, drawingBounds.colCount, chartBounds.colCount),
    });
    return result;
  }, []);

  return [{ type: 'sheets', payload: { sheets: context.sheets } }];
};

export const parseSpreadsheetWorkbook = async (
  context: SpreadsheetParserContext,
  data: ArrayBuffer
): Promise<SpreadsheetWorkerResponse[]> => {
  try {
    context.workbook = read(data, readOptions);
    const signature = data.byteLength >= 2 ? new DataView(data).getUint16(0, false) : 0;
    if (signature === 0x504b) {
      try {
        context.charts = await parseSpreadsheetCharts(data);
      } catch (error) {
        context.charts = {};
        console.warn('[file-viewer] Spreadsheet chart parsing failed; continuing with cell content.', error);
      }
    } else {
      context.charts = {};
    }
    return parseSheets(context);
  } catch (error) {
    return [toErrorResponse(error)];
  }
};

export const parseSpreadsheetSheet = (
  context: SpreadsheetParserContext,
  payload: Record<string, any> = {}
): SpreadsheetWorkerResponse[] => {
  const {
    sheet,
    startRow = 0,
    pageSize = 500,
    sessionId = 0,
  } = payload;

  try {
    const workbook = context.workbook;
    const sheetName = context.sheets.find(item => item.id === sheet)?.name;
    if (!workbook?.Sheets || !sheetName) {
      return [];
    }

    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) {
      return [];
    }

    const sheetMeta = context.sheets.find(item => item.id === sheet);
    const sheetModel = SheetJsModel.create(worksheet, {
      startRow,
      pageSize,
      totalRows: sheetMeta?.rowCount,
      totalCols: sheetMeta?.colCount,
      charts: context.charts[sheetName],
    });
    const windowData = sheetModel.toObject();
    const structure = startRow === 0 ? sheetModel.structure : undefined;

    return [{
      type: 'parseSheet',
      payload: {
        sessionId,
        sheet,
        sheetData: structure ? {
          ...windowData,
          structure,
        } : windowData,
      },
    }];
  } catch (error) {
    return [toErrorResponse(error, { sessionId, startRow })];
  }
};

export const handleSpreadsheetWorkerRequest = (
  context: SpreadsheetParserContext,
  request: SpreadsheetWorkerRequest
): SpreadsheetWorkerResponse[] | Promise<SpreadsheetWorkerResponse[]> => {
  switch (request.type) {
    case 'parseWorkbook':
      return parseSpreadsheetWorkbook(context, request.payload?.workbook);
    case 'parseSheet':
      return parseSpreadsheetSheet(context, request.payload);
    default:
      return [];
  }
};
