import type { WorkBook } from 'styled-exceljs';
import { read, utils } from 'styled-exceljs';
import SheetJsModel from './SheetJsModel.js';
import type { SheetDefinition } from '../type.js';

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
    if (!ref && !drawingBounds.rowCount && !drawingBounds.colCount) {
      return result;
    }
    const range = ref ? utils.decode_range(ref) : utils.decode_range('A1');
    result.push({
      id: result.length,
      name,
      hidden: !!workbookSheets[sourceIndex]?.Hidden,
      rowCount: Math.max(range.e.r + 1, drawingBounds.rowCount),
      colCount: Math.max(range.e.c + 1, drawingBounds.colCount),
    });
    return result;
  }, []);

  return [{ type: 'sheets', payload: { sheets: context.sheets } }];
};

export const parseSpreadsheetWorkbook = (
  context: SpreadsheetParserContext,
  data: ArrayBuffer
): SpreadsheetWorkerResponse[] => {
  try {
    context.workbook = read(data, readOptions);
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
): SpreadsheetWorkerResponse[] => {
  switch (request.type) {
    case 'parseWorkbook':
      return parseSpreadsheetWorkbook(context, request.payload?.workbook);
    case 'parseSheet':
      return parseSpreadsheetSheet(context, request.payload);
    default:
      return [];
  }
};
