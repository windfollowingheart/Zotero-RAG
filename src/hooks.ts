import {
  BasicExampleFactory,
  HelperExampleFactory,
  KeyExampleFactory,
  PromptExampleFactory,
  UIExampleFactory,
} from "./modules/examples";
import { config } from "../package.json";
import { getString, initLocale } from "./utils/locale";
import { registerPrefsScripts } from "./modules/preferenceScript";
import { createZToolkit } from "./utils/ztoolkit";
import { createMainContainerUi } from "./utils/ui";
import { registerLightRag, registerLightRagUi, registerZoteroRagButtonContainer } from "./utils/items";



async function onStartup() {
  await Promise.all([
    Zotero.initializationPromise,
    Zotero.unlockPromise,
    Zotero.uiReadyPromise,
  ]);

  initLocale();


  BasicExampleFactory.registerPrefs();

  BasicExampleFactory.registerNotifier();

  // KeyExampleFactory.registerShortcuts();
  KeyExampleFactory.registerZoteroRagMenuShowShortCuts();

  await UIExampleFactory.registerExtraColumn();

  await UIExampleFactory.registerExtraColumnWithCustomCell();

  // UIExampleFactory.registerTestTab();
  // UIExampleFactory.registerItemPaneSection();

  // UIExampleFactory.registerReaderItemPaneSection();

  await Promise.all(
    Zotero.getMainWindows().map((win) => onMainWindowLoad(win)),
  );
}

async function onMainWindowLoad(win: Window): Promise<void> {
  // Create ztoolkit for every window
  addon.data.ztoolkit = createZToolkit();

  // @ts-ignore This is a moz feature
  win.MozXULElement.insertFTLIfNeeded(`${config.addonRef}-mainWindow.ftl`);

  // const mainContainer = createMainContainerUi()
  // addon.data.lightRagUi = mainContainer

  UIExampleFactory.registerStyleSheet(win);

  UIExampleFactory.registerRightClickMenuItem();

  // UIExampleFactory.registerRightClickMenuPopup(win);

  UIExampleFactory.registerWindowMenuWithSeparator();

  // 注册lightRag和lightRagUi
  // UIExampleFactory.registerLightRag();
  // UIExampleFactory.registerLightRagUi();
  setTimeout(()=>{
    registerLightRag()
    registerLightRagUi()
  }, 1000)
  
  // UIExampleFactory.registerZoteroRagButtonContainer();
  registerZoteroRagButtonContainer()

  PromptExampleFactory.registerNormalCommandExample();

  PromptExampleFactory.registerAnonymousCommandExample(win);

  PromptExampleFactory.registerConditionalCommandExample();
  // UIExampleFactory.registerReaderItemPaneSection(win);




  await Zotero.Promise.delay(1000);

}



async function onMainWindowUnload(win: Window): Promise<void> {

  ztoolkit.unregisterAll();
  addon.data.dialog?.window?.close();
}


//关闭应用程序时执行
function onShutdown(): void {
  ztoolkit.unregisterAll();
  addon.data.dialog?.window?.close();
  addon.data.alive = false;
  delete Zotero[config.addonInstance];

  if (addon.data.zoteroRagButtonDialog && addon.data.zoteroRagChatDialog) {
    addon.data.zoteroRagButtonDialog.window.close()

    // addon.data.zoteroRagChatDialog.window.close = addon.data.zoteroRagChatDialogWindowOriginalClose
    addon.data.zoteroRagChatDialog?.window.close()
    addon.data.lightRagUi?.insertTaskListContainerDiv?.remove()
  }
}

/**
 * This function is just an example of dispatcher for Notify events.
 * Any operations should be placed in a function to keep this funcion clear.
 */
async function onNotify(
  event: string,
  type: string,
  ids: Array<string | number>,
  extraData: { [key: string]: any },
) {
  // You can add your code to the corresponding notify type
  ztoolkit.log("notify", event, type, ids, extraData);
  console.log("notify", event, type, ids, extraData);
  if (
    event == "select" &&
    type == "tab" &&
    extraData[ids[0]].type == "reader"
  ) {
    BasicExampleFactory.exampleNotifierCallback();
  }
  else if (
    event == "close" &&
    type == "tab" &&
    ids.length == 1
  ) {

  }
  else {
    return;
  }
}

/**
 * This function is just an example of dispatcher for Preference UI events.
 * Any operations should be placed in a function to keep this funcion clear.
 * @param type event type
 * @param data event data
 */
async function onPrefsEvent(type: string, data: { [key: string]: any }) {
  switch (type) {
    case "load":
      console.log("ooooooooooooo", data)
      registerPrefsScripts(data.window);
      break;
    default:
      return;
  }
}

function onShortcuts(type: string) {
  switch (type) {
    case "larger":
      KeyExampleFactory.exampleShortcutLargerCallback();
      break;
    case "smaller":
      KeyExampleFactory.exampleShortcutSmallerCallback();
      break;
    default:
      break;
  }
}

function onDialogEvents(type: string) {
  switch (type) {
    case "dialogExample":
      HelperExampleFactory.dialogExample();
      break;
    case "clipboardExample":
      HelperExampleFactory.clipboardExample();
      break;
    case "filePickerExample":
      HelperExampleFactory.filePickerExample();
      break;
    case "progressWindowExample":
      HelperExampleFactory.progressWindowExample();
      break;
    case "vtableExample":
      HelperExampleFactory.vtableExample();
      break;
    default:
      break;
  }
  ztoolkit.log("dialog", type);
  // ztoolkit.getGlobal("alert")("hello");
  ztoolkit.log("hello121321")

}

// Add your hooks here. For element click, etc.
// Keep in mind hooks only do dispatch. Don't add code that does real jobs in hooks.
// Otherwise the code would be hard to read and maintain.

export default {
  onStartup,
  onShutdown,
  onMainWindowLoad,
  onMainWindowUnload,
  onNotify,
  onPrefsEvent,
  onShortcuts,
  onDialogEvents,
};
