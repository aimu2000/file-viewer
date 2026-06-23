declare module 'sql.js' {
  export interface SqlJsStatic {
    Database: new (data?: Uint8Array) => {
      exec(sql: string): Array<{ columns: string[]; values: unknown[][] }>;
      close(): void;
    };
  }

  const initSqlJs: (options?: { locateFile?: (file: string) => string }) => Promise<SqlJsStatic>;
  export default initSqlJs;
}

declare module 'avsc/etc/browser/avsc.js' {
  const avsc: any;
  export = avsc;
}
