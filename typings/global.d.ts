declare const _globalThis: {
  [key: string]: any;
  Zotero: _ZoteroTypes.Zotero;
  ztoolkit: ZToolkit;
  addon: typeof addon;
};

declare type ZToolkit = ReturnType<
  typeof import("../src/utils/ztoolkit").createZToolkit
>;

declare const ztoolkit: ZToolkit;

declare const rootURI: string;

declare const addon: import("../src/addon").default;

declare const __env__: "production" | "development";

declare module 'pdfjs-dist/build/pdf.worker';
declare module 'pdfjs-dist';
declare module 'pdfjs-dist/build/pdf';
declare module 'pdfjs-dist/build/pdf.worker.entry';
declare module '../pdf/pdf.min';
declare module 'pdfjs-dist/build/pdf.worker.entry';


// declare module 'chrome://zoterorag/content/pdf.min'
declare module '../pdf/pdf1'
