import { ColumnOptions } from "zotero-plugin-toolkit/dist/helpers/virtualizedTable";
import { DialogHelper } from "zotero-plugin-toolkit/dist/helpers/dialog";
import hooks from "./hooks";
import { createZToolkit } from "./utils/ztoolkit";
import { getRag } from "./rag/rag";
import { createLightRAGUI, LightRAG, lightRAGUI } from "lightrag-js";
import { createMainContainerUi } from "./utils/ui";


class Addon {
  public data: {
    alive: boolean;
    // Env type, see build.js
    env: "development" | "production";
    ztoolkit: ZToolkit;
    locale?: {
      current: any;
    };
    prefs?: {
      window: Window;
      columns: Array<ColumnOptions>;
      rows: Array<{ [dataKey: string]: string }>;
    };
    dialog?: DialogHelper;
    lightRag?: LightRAG;
    // lightRagUi?: HTMLDivElement;
    lightRagUi?: lightRAGUI;
    zoteroRagButtonDialog?: DialogHelper;
    zoteroRagChatDialog?: DialogHelper;
    zoteroRagChatDialogWindowOriginalClose?: any;
  };
  // Lifecycle hooks
  public hooks: typeof hooks;
  // APIs
  public api: object;

  constructor() {
    this.data = {
      alive: true,
      env: __env__,
      ztoolkit: createZToolkit(),
    };
    this.hooks = hooks;
    this.api = {};
    // getRag().then(rag=>{
    //   this.data.lightRag = rag
    // })
    // this.data.lightRagUi = createLightRAGUI()
    // const mainContainer = createMainContainerUi()
    // this.data.lightRagUi = mainContainer
  }
}

export default Addon;
