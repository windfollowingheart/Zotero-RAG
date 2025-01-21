import { config } from "../../package.json";
import { getLocaleID, getString } from "../utils/locale";
import { getPref, setPref, clearPref } from "../utils/prefs"
import { createAgentChatBox, createUserChatBox, query, sendQueryMessage, vaildUserInputValidity } from "../utils/chat";
import { createMainContainerUi, createTestUi } from "../utils/ui";
import { createLightRAG, createLightRAGUI } from "lightrag-js";
import { lightRagChatQuery, ragItems } from "../utils/items";
// importScripts(`chrome://${config.addonRef}/content/pdf.min.js`)




function example(
  target: any,
  propertyKey: string | symbol,
  descriptor: PropertyDescriptor,
) {
  const original = descriptor.value;
  descriptor.value = function (...args: any) {
    try {
      console.log(`Calling example ${target.name}.${String(propertyKey)}`);
      return original.apply(this, args);
    } catch (e) {
      console.log(`Error in example ${target.name}.${String(propertyKey)}`, e);
      throw e;
    }
  };
  return descriptor;
}

export class BasicExampleFactory {
  @example
  static registerNotifier() {
    const callback = {
      notify: async (
        event: string,
        type: string,
        ids: number[] | string[],
        extraData: { [key: string]: any },
      ) => {
        if (!addon?.data.alive) {
          this.unregisterNotifier(notifierID);
          return;
        }
        addon.hooks.onNotify(event, type, ids, extraData);
      },
    };

    // Register the callback in Zotero as an item observer
    const notifierID = Zotero.Notifier.registerObserver(callback, [
      "tab",
      "item",
      "file",
    ]);

    Zotero.Plugins.addObserver({
      shutdown: ({ id: pluginID }) => {
        console.log("Shutting down plugin");
        this.unregisterNotifier(notifierID);
        // addon.hooks.onShutdown();
      },
    });
  }

  @example
  static async exampleNotifierCallback() {
    new ztoolkit.ProgressWindow(config.addonName)
      .createLine({
        text: "Open Tab Detected!",
        type: "success",
        progress: 100,
      })
      .show();
  }

  @example
  private static unregisterNotifier(notifierID: string) {
    Zotero.Notifier.unregisterObserver(notifierID);
  }

  @example
  static registerPrefs() {
    Zotero.PreferencePanes.register({
      pluginID: config.addonID,
      src: rootURI + "chrome/content/preferences.xhtml",
      label: getString("prefs-title"),
      image: `chrome://${config.addonRef}/content/icons/favicon.png`,
    });
  }
}

export class KeyExampleFactory {
  @example
  static registerShortcuts() {
    // Register an event key for Alt+L
    ztoolkit.Keyboard.register((ev, keyOptions) => {
      console.log(ev, keyOptions.keyboard);
      if (keyOptions.keyboard?.equals("shift,l")) {
        addon.hooks.onShortcuts("larger");
      }
      if (ev.shiftKey && ev.key === "S") {
        addon.hooks.onShortcuts("smaller");
      }
    });

    new ztoolkit.ProgressWindow(config.addonName)
      .createLine({
        text: "Example Shortcuts: Alt+L/S/C",
        type: "success",
      })
      .show();
  }

  @example
  static exampleShortcutLargerCallback() {
    new ztoolkit.ProgressWindow(config.addonName)
      .createLine({
        text: "Larger!",
        type: "default",
      })
      .show();
  }

  @example
  static exampleShortcutSmallerCallback() {
    new ztoolkit.ProgressWindow(config.addonName)
      .createLine({
        text: "Smaller!",
        type: "default",
      })
      .show();
  }

  static registerZoteroRagMenuShowShortCuts() {
    // Register an event key for Alt+L
    ztoolkit.Keyboard.register((ev, keyOptions) => {
      console.log(ev, keyOptions.keyboard);
      if (keyOptions.keyboard?.equals("alt,l")) {
        console.log("Show ZoteroRagButtonContainer", addon.data.zoteroRagButtonDialog)
        // if(addon.data.zoteroRagButtonDialog){
        //   addon.data.zoteroRagButtonDialog.window.open()
        //   return
        // }
        addon.data.zoteroRagButtonDialog?.window.close()
        // addon.data.zoteroRagButtonDialog?.window.focus()
        UIExampleFactory.registerZoteroRagButtonContainer();
      }
    });
    
  }

  
}

export class UIExampleFactory {
  @example
  static registerStyleSheet(win: Window) {
    const doc = win.document;
    const styles = ztoolkit.UI.createElement(doc, "link", {
      properties: {
        type: "text/css",
        rel: "stylesheet",
        href: `chrome://${config.addonRef}/content/zoteroPane.css`,
      },
    });
    doc.documentElement.appendChild(styles);
    doc.getElementById("zotero-item-pane-content")?.classList.add("makeItRed");
  }

  @example
  static registerRightClickMenuItem() {
    // const menuIcon = `chrome://${config.addonRef}/content/icons/favicon@0.5x.png`;
    const menuIcon = `chrome://${config.addonRef}/content/icons/favicon.png`;
    // item menuitem with icon
    ztoolkit.Menu.register("item", {
      // tag: "menuitem",
      tag: "menu",
      id: "zotero-itemmenu-addontemplate-test",
      label: getString("menuitem-label"),
      // commandListener: (ev) => addon.hooks.onDialogEvents("dialogExample"),
      // commandListener: (ev) => {
      //   // addon.hooks.onDialogEvents("dialogExample")
      //   ragItems()
      // },
      icon: menuIcon,
      children: [
        {
          tag: "menuitem",
          label: getString("menuitem-submenulabel"),
          commandListener: (ev) => {
            // addon.hooks.onDialogEvents("dialogExample")
            ragItems()
          },
        },
        // {
        //   tag: "menuitem",
        //   label: getString("menuitem-submenulabel"),
        //   oncommand: "alert('Hello World! Sub Menuitem.')",
        // },
      ],
    });
  }

  @example
  static registerRightClickMenuPopup(win: Window) {
    ztoolkit.Menu.register(
      "item",
      {
        tag: "menu",
        label: getString("menupopup-label"),
        children: [
          {
            tag: "menuitem",
            label: getString("menuitem-submenulabel"),
            oncommand: "alert('Hello World! Sub Menuitem.')",
          },
        ],
      },
      
      "before",
      win.document.querySelector(
        "#zotero-itemmenu-addontemplate-test",
      ) as XUL.MenuItem,
    );
  }

  @example
  static registerWindowMenuWithSeparator() {
    ztoolkit.Menu.register("menuFile", {
      tag: "menuseparator",
    });
    // menu->File menuitem
    ztoolkit.Menu.register("menuFile", {
      tag: "menuitem",
      label: getString("menuitem-filemenulabel"),
      oncommand: "alert('Hello World! File Menuitem.')",
    });
  }

  @example
  static async registerExtraColumn() {
    const field = "test1";
    await Zotero.ItemTreeManager.registerColumns({
      pluginID: config.addonID,
      dataKey: field,
      label: "text column",
      dataProvider: (item: Zotero.Item, dataKey: string) => {
        return field + String(item.id);
      },
      iconPath: "chrome://zotero/skin/cross.png",
    });
  }

  @example
  static async registerExtraColumnWithCustomCell() {
    const field = "test2";
    await Zotero.ItemTreeManager.registerColumns({
      pluginID: config.addonID,
      dataKey: field,
      label: "custom column",
      dataProvider: (item: Zotero.Item, dataKey: string) => {
        return field + String(item.id);
      },
      renderCell(index, data, column) {
        console.log("Custom column cell is rendered!");
        const span = Zotero.getMainWindow().document.createElementNS(
          "http://www.w3.org/1999/xhtml",
          "span",
        );
        span.className = `cell ${column.className}`;
        span.style.background = "#0dd068";
        span.innerText = "⭐" + data;
        return span;
      },
    });
  }

  @example
  static registerTestTab() {
    Zotero.ItemPaneManager.registerSection({
      paneID: "test",
      pluginID: config.addonID,
      header: {
        l10nID: getLocaleID("item-section-example1-head-text"),
        icon: "chrome://zotero/skin/16/universal/book.svg",
      },
      sidenav: {
        l10nID: getLocaleID("item-section-example1-sidenav-tooltip"),
        icon: `chrome://${config.addonRef}/content/icons/zotero_rag.svg`,
      },
      onToggle: () => {
        ztoolkit.getGlobal("alert")("wwww");
      },
      sectionButtons: [
        {
          type: "test",
          icon: "chrome://zotero/skin/16/universal/empty-trash.svg",
          l10nID: getLocaleID("item-section-example2-button-tooltip"),
          onClick: ({ item, paneID }) => {
            ztoolkit.getGlobal('alert')("Section clicked!" + item?.id);
          },
        },
      ],


    })
  }
  @example
  static registerItemPaneSection() {
    Zotero.ItemPaneManager.registerSection({
      paneID: "example",
      pluginID: config.addonID,
      header: {
        l10nID: getLocaleID("item-section-example1-head-text"),
        icon: "chrome://zotero/skin/16/universal/book.svg",
      },
      sidenav: {
        l10nID: getLocaleID("item-section-example1-sidenav-tooltip"),
        icon: `chrome://${config.addonRef}/content/icons/zotero_rag.svg`,
      },
      bodyXHTML: `<html:h1 id="test"></html:h1>`,
      onRender: (props) => {
        createTestUi()
        // body.textContent = JSON.stringify({
        //   id: item?.id,
        //   editable,
        //   tabType,
        // });
        // const mainNode = body.querySelector("#test");
        // const mainContainer = createMainContainerUi()
        // const { body, item, editable, tabType } = props;
        // console.log( "pp", props,)
        // console.log("@", Zotero.Reader.getByTabID(Zotero_Tabs.selectedID)._item.id, item.id)
        
        // setTimeout(() => {
          
          // if(Zotero.Reader.getByTabID(Zotero_Tabs.selectedID)._item.id === item.id){
          //   const mainContainer = addon.data.lightRagUi
          //   if(mainContainer){
          //     body.appendChild(mainContainer)
          //   }
          // }
        // }, 1000);
        

      },
      onItemChange: ({ item, setEnabled, tabType,body }) => {
        
        
      },
    });
  }

  @example
  static async registerReaderItemPaneSection(win: Window) {
    Zotero.ItemPaneManager.registerSection({
      paneID: "reader-example",
      pluginID: config.addonID,
      header: {
        l10nID: getLocaleID("item-section-example2-head-text"),
        // Optional
        l10nArgs: `{"status": "Initialized"}`,
        // Can also have a optional dark icon
        icon: "chrome://zotero/skin/16/universal/book.svg",
      },
      sidenav: {
        l10nID: getLocaleID("item-section-example2-sidenav-tooltip"),
        // icon: "chrome://zotero/skin/20/universal/save.svg",
        icon: `chrome://${config.addonRef}/content/icons/zotero_rag.svg`,
      },
      // Optional
      // bodyXHTML: `<html:h1 id="${getTabKeyAndPdfName().tabKey}-test"></html:h1>`,
      bodyXHTML: `<html:h1 id="test"></html:h1>`,

      onInit: ({ item }) => {
        console.log("Section init!", item?.id);
        //清空prefs中的selected_tab_chat_file_refs
        Zotero.Prefs.clear(`${config.prefsPrefix}.selected_tab_chat_file_refs`, true);
      },
      // Optional, Called when the section is destroyed, must be synchronous

      onDestroy: (props) => {
        console.log("Section destroy!");
        console.log(props)
        const { paneID, doc, body } = props;
      },
      // Optional, Called when the section data changes (setting item/mode/tabType/inTrash), must be synchronous. return false to cancel the change
      onItemChange: (props) => {
        const { item, setEnabled, tabType, body } = props;
        console.log(`Section item data changed to ${item?.id} `);
        console.log("change to", props)

        setEnabled(tabType === "reader");

        return true;
      },
      // Called when the section is asked to render, must be synchronous.
      onRender: ({
        body,
        doc,
        item,
        setL10nArgs,
        setSectionSummary,
        setSectionButtonStatus,
      }) => {
        console.log("Section rendered!", item?.id);
        console.log("Section rendered!", item?.id);

        

        


        

        setL10nArgs(`{ "status": "Loading" }`);
        setSectionSummary("loading!");
        setSectionButtonStatus("test", { hidden: true });
      },
      // Optional, can be asynchronous.
      onAsyncRender: async ({
        body,
        item,
        setL10nArgs,
        setSectionSummary,
        setSectionButtonStatus,
      }) => {
        console.log("Section secondary render start!", item?.id);
        await Zotero.Promise.delay(1000);
        console.log("Section secondary render finish!", item?.id);
        
        setL10nArgs(`{ "status": "Loaded" }`);
        setSectionSummary("rendered!");
        setSectionButtonStatus("test", { hidden: false });
      },
      // Optional, Called when the section is toggled. Can happen anytime even if the section is not visible or not rendered
      onToggle: ({ item }) => {
        console.log("Section toggled!", item?.id);
      },
      // Optional, Buttons to be shown in the section header
      sectionButtons: [
        {
          type: "test",
          icon: "chrome://zotero/skin/16/universal/empty-trash.svg",
          l10nID: getLocaleID("item-section-example2-button-tooltip"),
          onClick: ({ item, paneID }) => {
            console.log("Section clicked!", item?.id);
            Zotero.ItemPaneManager.unregisterSection(paneID);
          },
        },
        {
          type: "test",
          icon: "chrome://zotero/skin/16/universal/empty-trash.svg",
          l10nID: getLocaleID("item-section-example2-button-tooltip"),
          onClick: ({ item, paneID }) => {
            console.log("Section clicked!", item?.id);
            Zotero.ItemPaneManager.unregisterSection(paneID);
          },
        },
      ],
    });
  }


  static async registerLightRag(){
    const rag = await createLightRAG()
    addon.data.lightRag = rag
  }

  static  registerLightRagUi(){
    const lightRagUi =  createLightRAGUI()
    addon.data.lightRagUi = lightRagUi
  }

  static registerZoteroRagButtonContainer() {
    const maxTimes = 100
    
    const dialogHelper = new ztoolkit.Dialog(1, 1)
      .addCell(0, 0, {
        tag: "div",
        styles: {
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "space-evenly",
          cursor: "pointer",
          userSelect: "none",
        },
        children:[
          {
            tag: "div",
            classList: ["zotero-rag-insert-task-list-container-show-button-div"],
            styles: {
              backgroundColor:"rgb(190, 211, 214)",
              borderRadius: "5px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "5px"
            },
            properties: {
              innerHTML: "文档解析"
            },
            listeners: [
              {
                  type: "click",
                  listener: () => {
                    // ztoolkit.getGlobal("alert")("Command triggered1!")
                    if(!addon.data.lightRagUi){
                      return
                    }
                    const insertTaskListContainerDiv = addon.data.lightRagUi.createInsertTaskListContainerDiv(document) as HTMLDivElement
                    // console.log(document)
                    Zotero.getMainWindow().document.documentElement.appendChild(insertTaskListContainerDiv)
                  }
              }
            ]
          },
          {
            tag: "div",
            classList: ["zotero-rag-chat-container-show-button-div"],
            styles: {
              backgroundColor:"rgb(190, 211, 214)",
              borderRadius: "5px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "5px"
            },
            properties: {
              innerHTML: "聊天界面",
            },
            listeners: [
              {
                  type: "click",
                  listener: () => {
                    // ztoolkit.getGlobal("alert")("Command triggered2!")
                    if(!addon.data.lightRagUi){
                      return
                    }
                    const dialogChat = new ztoolkit.Dialog(1,1)
                    .addCell(0, 0, {
                      tag: "div",
                      classList: ["zotero-rag-chat-container-1-div"],
                      styles: {
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        justifyContent: "center",
                        backgroundColor: "white",
                      },
                    })
                    .open("Zotero-RAG 聊天界面", 
                      {
                        width: 800,
                        height: 500,
                        resizable: true,
                        centerscreen: true,
                      }
                    )
                    const container1 = ztoolkit.UI.createElement(dialogChat.window.document, "div", {
                      styles: {
                        width: "100%",
                        height: "100%",
                        backgroundColor: "rgb(97, 213, 231)",
                      },
                    })
                    // dialogChat.window.document.body.innerHTML = '<html id="hhh"></html>'
                    setTimeout(()=>{
                      if(!addon.data.lightRagUi){
                        return
                      }
                      const hhh = dialogChat.window.document.querySelector(".zotero-rag-chat-container-1-div")
                      const hhh1 = dialogChat.window.document.documentElement.querySelector(".zotero-rag-chat-container-1-div")
                      console.log("hhh",hhh)
                      console.log("hhh1",hhh1)
                      console.log("dialogChat",dialogChat.window)
                      // hhh?.appendChild(container1)
                      const chatMainContainerDiv = addon.data.lightRagUi.createchatMainContainerDiv(dialogChat.window.document)
                      // dialogChat.window.document.documentElement.appendChild((addon.data.lightRagUi.chatMainContainerDiv) as HTMLDivElement)
                      hhh?.appendChild((addon.data.lightRagUi.chatMainContainerDiv) as HTMLDivElement)
                      // console.log("dialogChat.window.document.body",dialogChat.window.document)
                      // console.log("dialogChat.window.document.documentElement",dialogChat.window.document.documentElement)
                      
                      addon.data.lightRagUi.sendMessageCallBackFunc = lightRagChatQuery
                    },500)
                    dialogChat.window.document.body.style.width = "100%"
                    dialogChat.window.document.body.style.height = "100%"
                    console.log("dialogChat",dialogChat.window)
                    console.log("dialogChat.window.document",dialogChat.window.document)
                    console.log("dialogChat.window.body",dialogChat.window.innerWidth)
                    console.log("dialogChat.window.body",dialogChat.window.innerHeight)
                    console.log("dialogChat.window.body",dialogChat.window.document.body.style.width)
                    // const chatMainContainerDiv = addon.data.lightRagUi.createchatMainContainerDiv(dialogChat.window.document)
                    // // dialogChat.window.document.documentElement.appendChild((addon.data.lightRagUi.chatMainContainerDiv) as HTMLDivElement)
                    // dialogChat.window.document.body.appendChild((addon.data.lightRagUi.chatMainContainerDiv) as HTMLDivElement)
                    // console.log("dialogChat.window.document.body",dialogChat.window.document)
                    // console.log("dialogChat.window.document.documentElement",dialogChat.window.document.documentElement)
                    
                    // addon.data.lightRagUi.sendMessageCallBackFunc = query
                  }
              }
            ]
          }
        ]
        
      })
      // .addCell(0, 1, {
      //   tag: "div",
      //   properties: { 
      //     innerHTML: `<div class="zotero-rag-chat-container-show-button-div">
      //       聊天界面
      //     </div>`
      //   },
      // })
      .open("Zotero-RAG 功能菜单", {
        width: 200,
        height: 50,
        resizable: false,
        // left: win.screenLeft + 30,
        // top: win.screenTop + 30,
        centerscreen: true,
        // alwaysRaised: true
      })
    
    addon.data.zoteroRagButtonDialog = dialogHelper
    // const doc1 = dialogHelper.window.document
    
    // setTimeout(()=>{
    //   console.log("000000000000000000000")
    //   console.log(doc1.body.innerHTML)
    // },1000)
    // const insertShowButtonDiv = doc1.querySelector(".zotero-rag-insert-task-list-container-show-button-div")
    // const chatShowButtonDiv = doc1.querySelector(".zotero-rag-chat-container-show-button-div")
    // ztoolkit.getGlobal("alert")(insertShowButtonDiv)
    // insertShowButtonDiv?.addEventListener("click", ()=>{
    //   ztoolkit.getGlobal("alert")("Command triggered1!")
    // })
    // chatShowButtonDiv?.addEventListener("click", ()=>{
    //   ztoolkit.getGlobal("alert")("Command triggered2!")
    // })
  }

  static registerZoteroRagButtonContainer2(win: Window) {
    
    const div1 = ztoolkit.UI.createElement(win.document, "div", {
      styles: {
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        cursor: "pointer",
        userSelect: "none",
      },
      children:[
        {
          tag: "div",
          classList: ["zotero-rag-insert-task-list-container-show-button-div"],
          styles: {
            backgroundColor:"rgb(190, 211, 214)",
            borderRadius: "5px",
            padding: "5px"
          },
          properties: {
            innerHTML: "文档解析"
          }
        },
        {
          tag: "div",
          classList: ["zotero-rag-chat-container-show-button-div"],
          styles: {
            backgroundColor:"rgb(190, 211, 214)",
            borderRadius: "5px",
            padding: "5px"
          },
          properties: {
            innerHTML: "聊天界面",
          }
        }
      ]
    })
    
    const dialogHelper = new ztoolkit.Dialog(1, 1)
      .open("Zotero-RAG 功能菜单", {
        width: 200,
        height: 50,
        resizable: false,
        // left: win.screenLeft + 30,
        // top: win.screenTop + 30,
        centerscreen: true,
      })
    
    
    addon.data.zoteroRagButtonDialog = dialogHelper
    const doc1 = dialogHelper.window.document
    
    setTimeout(()=>{
      dialogHelper.window.document.body.appendChild(div1)
      console.log("000000000000000000000")
      console.log(doc1.body.innerHTML)
      const insertShowButtonDiv = doc1.querySelector(".zotero-rag-insert-task-list-container-show-button-div")
      const chatShowButtonDiv = doc1.querySelector(".zotero-rag-chat-container-show-button-div")
      insertShowButtonDiv?.addEventListener("click", ()=>{
        ztoolkit.getGlobal("alert")("Command triggered1!")
      })
      chatShowButtonDiv?.addEventListener("click", ()=>{
        ztoolkit.getGlobal("alert")("Command triggered2!")
      })
    },100)
    
  }
}

export class PromptExampleFactory {
  @example
  static registerNormalCommandExample() {
    ztoolkit.Prompt.register([
      {
        name: "Normal Command Test",
        label: "Plugin Template",
        callback(prompt) {
          ztoolkit.getGlobal("alert")("Command triggered!");
        },
      },
    ]);
  }

  @example
  static registerAnonymousCommandExample(window: Window) {
    ztoolkit.Prompt.register([
      {
        id: "search",
        callback: async (prompt) => {
          // https://github.com/zotero/zotero/blob/7262465109c21919b56a7ab214f7c7a8e1e63909/chrome/content/zotero/integration/quickFormat.js#L589
          function getItemDescription(item: Zotero.Item) {
            const nodes = [];
            let str = "";
            let author,
              authorDate = "";
            if (item.firstCreator) {
              author = authorDate = item.firstCreator;
            }
            let date = item.getField("date", true, true) as string;
            if (date && (date = date.substr(0, 4)) !== "0000") {
              authorDate += " (" + parseInt(date) + ")";
            }
            authorDate = authorDate.trim();
            if (authorDate) nodes.push(authorDate);

            const publicationTitle = item.getField(
              "publicationTitle",
              false,
              true,
            );
            if (publicationTitle) {
              nodes.push(`<i>${publicationTitle}</i>`);
            }
            let volumeIssue = item.getField("volume");
            const issue = item.getField("issue");
            if (issue) volumeIssue += "(" + issue + ")";
            if (volumeIssue) nodes.push(volumeIssue);

            const publisherPlace = [];
            let field;
            if ((field = item.getField("publisher")))
              publisherPlace.push(field);
            if ((field = item.getField("place"))) publisherPlace.push(field);
            if (publisherPlace.length) nodes.push(publisherPlace.join(": "));

            const pages = item.getField("pages");
            if (pages) nodes.push(pages);

            if (!nodes.length) {
              const url = item.getField("url");
              if (url) nodes.push(url);
            }

            // compile everything together
            for (let i = 0, n = nodes.length; i < n; i++) {
              const node = nodes[i];

              if (i != 0) str += ", ";

              if (typeof node === "object") {
                const label =
                  Zotero.getMainWindow().document.createElement("label");
                label.setAttribute("value", str);
                label.setAttribute("crop", "end");
                str = "";
              } else {
                str += node;
              }
            }
            if (str.length) str += ".";
            return str;
          }
          function filter(ids: number[]) {
            ids = ids.filter(async (id) => {
              const item = (await Zotero.Items.getAsync(id)) as Zotero.Item;
              return item.isRegularItem() && !(item as any).isFeedItem;
            });
            return ids;
          }
          const text = prompt.inputNode.value;
          prompt.showTip("Searching...");
          const s = new Zotero.Search();
          s.addCondition("quicksearch-titleCreatorYear", "contains", text);
          s.addCondition("itemType", "isNot", "attachment");
          let ids = await s.search();
          // prompt.exit will remove current container element.
          // @ts-ignore ignore
          prompt.exit();
          const container = prompt.createCommandsContainer();
          container.classList.add("suggestions");
          ids = filter(ids);
          console.log(ids.length);
          if (ids.length == 0) {
            const s = new Zotero.Search();
            const operators = [
              "is",
              "isNot",
              "true",
              "false",
              "isInTheLast",
              "isBefore",
              "isAfter",
              "contains",
              "doesNotContain",
              "beginsWith",
            ];
            let hasValidCondition = false;
            let joinMode = "all";
            if (/\s*\|\|\s*/.test(text)) {
              joinMode = "any";
            }
            text.split(/\s*(&&|\|\|)\s*/g).forEach((conditinString: string) => {
              const conditions = conditinString.split(/\s+/g);
              if (
                conditions.length == 3 &&
                operators.indexOf(conditions[1]) != -1
              ) {
                hasValidCondition = true;
                s.addCondition(
                  "joinMode",
                  joinMode as Zotero.Search.Operator,
                  "",
                );
                s.addCondition(
                  conditions[0] as string,
                  conditions[1] as Zotero.Search.Operator,
                  conditions[2] as string,
                );
              }
            });
            if (hasValidCondition) {
              ids = await s.search();
            }
          }
          ids = filter(ids);
          console.log(ids.length);
          if (ids.length > 0) {
            ids.forEach((id: number) => {
              const item = Zotero.Items.get(id);
              const title = item.getField("title");
              const ele = ztoolkit.UI.createElement(window.document, "div", {
                namespace: "html",
                classList: ["command"],
                listeners: [
                  {
                    type: "mousemove",
                    listener: function () {
                      // @ts-ignore ignore
                      prompt.selectItem(this);
                    },
                  },
                  {
                    type: "click",
                    listener: () => {
                      prompt.promptNode.style.display = "none";
                      ztoolkit.getGlobal("Zotero_Tabs").select("zotero-pane");
                      ztoolkit.getGlobal("ZoteroPane").selectItem(item.id);
                    },
                  },
                ],
                styles: {
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "start",
                },
                children: [
                  {
                    tag: "span",
                    styles: {
                      fontWeight: "bold",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    },
                    properties: {
                      innerText: title,
                    },
                  },
                  {
                    tag: "span",
                    styles: {
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    },
                    properties: {
                      innerHTML: getItemDescription(item),
                    },
                  },
                ],
              });
              container.appendChild(ele);
            });
          } else {
            // @ts-ignore ignore
            prompt.exit();
            prompt.showTip("Not Found.");
          }
        },
      },
    ]);
  }

  @example
  static registerConditionalCommandExample() {
    ztoolkit.Prompt.register([
      {
        name: "Conditional Command Test",
        label: "Plugin Template",
        // The when function is executed when Prompt UI is woken up by `Shift + P`, and this command does not display when false is returned.
        when: () => {
          const items = ztoolkit.getGlobal("ZoteroPane").getSelectedItems();
          return items.length > 0;
        },
        callback(prompt) {
          prompt.inputNode.placeholder = "Hello World!";
          const items = ztoolkit.getGlobal("ZoteroPane").getSelectedItems();
          ztoolkit.getGlobal("alert")(
            `You select ${items.length} items!\n\n${items
              .map(
                (item, index) =>
                  String(index + 1) + ". " + item.getDisplayTitle(),
              )
              .join("\n")}`,
          );
        },
      },
    ]);
  }
}

export class HelperExampleFactory {
  @example
  static async dialogExample() {
    const dialogData: { [key: string | number]: any } = {
      inputValue: "test",
      checkboxValue: true,
      loadCallback: () => {
        console.log(dialogData, "Dialog Opened!");
      },
      unloadCallback: () => {
        console.log(dialogData, "Dialog closed!");
      },
    };
    const dialogHelper = new ztoolkit.Dialog(10, 2)
      .addCell(0, 0, {
        tag: "h1",
        properties: { innerHTML: "Helper Examples" },
      })
      .addCell(1, 0, {
        tag: "h2",
        properties: { innerHTML: "Dialog Data Binding" },
      })
      .addCell(2, 0, {
        tag: "p",
        properties: {
          innerHTML:
            "Elements with attribute 'data-bind' are binded to the prop under 'dialogData' with the same name.",
        },
        styles: {
          width: "200px",
        },
      })
      .addCell(3, 0, {
        tag: "label",
        namespace: "html",
        attributes: {
          for: "dialog-checkbox",
        },
        properties: { innerHTML: "bind:checkbox" },
      })
      .addCell(
        3,
        1,
        {
          tag: "input",
          namespace: "html",
          id: "dialog-checkbox",
          attributes: {
            "data-bind": "checkboxValue",
            "data-prop": "checked",
            type: "checkbox",
          },
          properties: { label: "Cell 1,0" },
        },
        false,
      )
      .addCell(4, 0, {
        tag: "label",
        namespace: "html",
        attributes: {
          for: "dialog-input",
        },
        properties: { innerHTML: "bind:input" },
      })
      .addCell(
        4,
        1,
        {
          tag: "input",
          namespace: "html",
          id: "dialog-input",
          attributes: {
            "data-bind": "inputValue",
            "data-prop": "value",
            type: "text",
          },
        },
        false,
      )
      .addCell(5, 0, {
        tag: "h2",
        properties: { innerHTML: "Toolkit Helper Examples" },
      })
      .addCell(
        6,
        0,
        {
          tag: "button",
          namespace: "html",
          attributes: {
            type: "button",
          },
          listeners: [
            {
              type: "click",
              listener: (e: Event) => {
                addon.hooks.onDialogEvents("clipboardExample");
              },
            },
          ],
          children: [
            {
              tag: "div",
              styles: {
                padding: "2.5px 15px",
              },
              properties: {
                innerHTML: "example:clipboard",
              },
            },
          ],
        },
        false,
      )
      .addCell(
        7,
        0,
        {
          tag: "button",
          namespace: "html",
          attributes: {
            type: "button",
          },
          listeners: [
            {
              type: "click",
              listener: (e: Event) => {
                addon.hooks.onDialogEvents("filePickerExample");
              },
            },
          ],
          children: [
            {
              tag: "div",
              styles: {
                padding: "2.5px 15px",
              },
              properties: {
                innerHTML: "example:filepicker",
              },
            },
          ],
        },
        false,
      )
      .addCell(
        8,
        0,
        {
          tag: "button",
          namespace: "html",
          attributes: {
            type: "button",
          },
          listeners: [
            {
              type: "click",
              listener: (e: Event) => {
                addon.hooks.onDialogEvents("progressWindowExample");
              },
            },
          ],
          children: [
            {
              tag: "div",
              styles: {
                padding: "2.5px 15px",
              },
              properties: {
                innerHTML: "example:progressWindow",
              },
            },
          ],
        },
        false,
      )
      .addCell(
        9,
        0,
        {
          tag: "button",
          namespace: "html",
          attributes: {
            type: "button",
          },
          listeners: [
            {
              type: "click",
              listener: (e: Event) => {
                addon.hooks.onDialogEvents("vtableExample");
              },
            },
          ],
          children: [
            {
              tag: "div",
              styles: {
                padding: "2.5px 15px",
              },
              properties: {
                innerHTML: "example:virtualized-table",
              },
            },
          ],
        },
        false,
      )
      .addButton("Confirm", "confirm")
      .addButton("Cancel", "cancel")
      .addButton("Help", "help", {
        noClose: false,
        callback: (e) => {
          dialogHelper.window?.alert(
            "Help Clicked! Dialog will not be closed.",
          );
        },
      })
      .addButton("测试一下", "test", {
        callback: (e) => {
          this.test();
        },
      })
      .setDialogData(dialogData)
      .open("Dialog Example");
    addon.data.dialog = dialogHelper;
    await dialogData.unloadLock.promise;
    addon.data.dialog = undefined;
    if (addon.data.alive)
      ztoolkit.getGlobal("alert")(
        `Close dialog with ${dialogData._lastButtonId}.\nCheckbox: ${dialogData.checkboxValue}\nInput: ${dialogData.inputValue}.`,
      );
    console.log(dialogData);
  }

  @example
  static clipboardExample() {
    new ztoolkit.Clipboard()
      .addText(
        "![Plugin Template](https://github.com/windingwind/zotero-plugin-template)",
        "text/unicode",
      )
      .addText(
        '<a href="https://github.com/windingwind/zotero-plugin-template">Plugin Template</a>',
        "text/html",
      )
      .copy();

    ztoolkit.getGlobal("alert")("Copied!");
  }
  static async getreader1() {
    const reader = await ztoolkit.Reader.getReader();
    console.log(reader);
  }

  @example
  static async filePickerExample() {
    const path = await new ztoolkit.FilePicker(
      "Import File",
      "open",
      [
        ["PNG File(*.png)", "*.png"],
        ["Any", "*.*"],
      ],
      "image.png",
    ).open();
    ztoolkit.getGlobal("alert")(`Selected 11 ${path}`);
  }

  @example
  static progressWindowExample() {
    new ztoolkit.ProgressWindow(config.addonName)
      .createLine({
        text: "ProgressWindow Example!",
        type: "success",
        progress: 100,
      })
      .show();
  }

  @example
  static vtableExample() {
    ztoolkit.getGlobal("alert")("See src/modules/preferenceScript.ts");
  }

  @example
  static test() {
    ztoolkit.getGlobal("alert")("测试一下");
  }
}
