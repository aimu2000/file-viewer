declare module '@ljheee/xmind-parser' {
  export function parseXmind8Xml(
    xmlString: string,
    options?: Record<string, unknown>
  ): Promise<any[]>;

  export function parseXmind2020Json(
    contentJson: string | unknown[],
    options?: Record<string, unknown>
  ): any[];
}
