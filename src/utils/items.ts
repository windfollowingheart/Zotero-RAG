import { RagProcess } from "lightrag-js/dist/node/rag/lightrag"
import { config } from "../../package.json";
import { getString } from "./locale";
import { parse } from "path";
import { getRag } from "../rag/rag";
import { InsertTask, queryAnswerHistory } from "lightrag-js/dist/node/ui";
import { createLightRAG, createLightRAGUI, queryLocalHostNeedRagData, QueryParam } from "lightrag-js";
import { getPref, setPref } from "./prefs";
import { minerDownloadResultZip, minerExtractZip, minerGetExtractMdResult, minerPdfExtractPipeLine, mineruGetUploadUrl, mineruUploadFile } from "./miner_pdf";
// import * as pdfjsLib from "pdfjs-dist";
// import * as pdfJs from "pdfjs-dist";

// import pdfWorker from "pdfjs-dist/build/pdf.worker";




async function ragItems() {
    if(!addon.data.lightRag){
        console.log("lightRag is undefine")
        // return
        addon.data.lightRag = await getRag()
    }

    // //找到显示进度的dom
    // const ragSelectItemsPdfButton = document.querySelector(".rag-select-items-pdf-button") as HTMLDivElement
    // const ragInsertProgressContainer = document.querySelector(".rag-insert-progress-container") as HTMLDivElement
    // const loadingImgDiv = document.querySelector(".rag-insert-progress-loading-div") as HTMLDivElement
    // const progressTextDiv = document.querySelector(".rag-insert-progress-text-div") as HTMLDivElement
    // if(!ragInsertProgressContainer || !loadingImgDiv || !progressTextDiv){
    //     console.log("ragInsertProgressContainer  loadingImgDiv progressTextDiv is undefine")
    //     return
    // }
    // ragSelectItemsPdfButton.style.opacity = "0.5"
    // ragSelectItemsPdfButton.style.cursor = "not-allowed"
    // ragSelectItemsPdfButton.style.pointerEvents = "none"
    
    // loadingImgDiv.innerHTML = `<img src="chrome://${config.addonRef}/content/icons/insertLoading.svg" width="20px" height="20px" alt="${getString("rag-progress-loading-stop-img-alt")}"/>`
    // loadingImgDiv.setAttribute("title", getString("rag-progress-loading-stop-img-alt"))
    // ragInsertProgressContainer.style.display = "flex"
    // loadingImgDiv.addEventListener("click", handleClickLoadingDiv)

    const items = ZoteroPane.getSelectedItems()

    if(!addon.data.lightRagUi){
        return
    }
    const unFinishTask = addon.data.lightRagUi.insertTaskList.filter((task: InsertTask) => task.isFinished == false)

    for (let i = 0; i < items.length; i++) {
        const item = items[i]
        console.log(item)
        // continue
        const pdfContent = await getItemPdfContent(item.id)
        const title = item.getDisplayTitle()
        console.log(pdfContent)
        const task = {
            insertTitle: title,
            insertContent: pdfContent,
            isFinished: false
        } as InsertTask
        if(!addon.data.lightRagUi){
            return
        }
        addon.data.lightRagUi.insertTaskList.push(task)

        // const unFinishTask = addon.data.lightRagUi.insertTaskList.filter((task: InsertTask) => task.isFinished == false)
        // if(unFinishTask.length == 0){
        //     addon.data.lightRagUi.insertTaskList.push(task)
        //     await startInsertLightRagTask()
        // }else{
        //     addon.data.lightRagUi.insertTaskList.push(task)
        // }
        
    }
    if(!addon.data.lightRagUi){
        return
    }
    if(unFinishTask.length == 0){
        await startInsertLightRagTask()
    }
}

async function getItemPdfContent(itemId:number):Promise<string> {
    console.log("getItemPdfContent",itemId)
    console.log("Zotero.Items.get(itemId)",Zotero.Items.get(itemId))
    const bestAttachmentState = await Zotero.Items.get(itemId).getBestAttachmentState() as any
    const attachmentKey = bestAttachmentState.key
    const libraryId = Zotero.Items.get(itemId).libraryID
    const dataDir = Zotero.DataDirectory.dir
    const _attachmentItem = Zotero.Items.getByLibraryAndKey(libraryId, attachmentKey) as any
    const _attachmentName =_attachmentItem.attachmentPath.replace("storage:", "")
    const pdfUrl = dataDir + "\\\\storage\\\\" + `${attachmentKey}\\` + _attachmentName
    const pdfContent = await minerPdfExtractPipeLine(pdfUrl)
    
   
    return pdfContent
}

async function startInsertLightRagTask(){
    if(!addon.data.lightRag || !addon.data.lightRagUi){
        return
    }
    for(let i = 0; i < addon.data.lightRagUi.insertTaskList.length; i++){
        const task = addon.data.lightRagUi.insertTaskList[i]
        if(task.isFinished){
            continue
        }
        // ztoolkit.getGlobal("alert")("开始处理")
        await addon.data.lightRag.insert(task.insertContent)
        task.isFinished = true
    }
    new ztoolkit.ProgressWindow(config.addonName)
      .createLine({
        text: "文件解析完毕",
        type: "success",
      })
      .show();
}

async function lightRagChatQuery(args: any){
    
    // ztoolkit.getGlobal("alert")("开始查询1")
    console.log("addon.data.lightRag", addon.data.lightRag)
    console.log("addon.data.lightRagUi",addon.data.lightRagUi)
    if(!addon.data.lightRag || !addon.data.lightRagUi){
        return
    }
    // ztoolkit.getGlobal("alert")("开始查询")
    const query = args.queryMessage
    const agentMessageContainer = args.agentMessageContainer
    const agentMessageDiv = agentMessageContainer.querySelector(".query-task-list-item-detail-agent-message-div")
    
    // query
    const param = new QueryParam()
    param.mode = 'hybrid'


    // 使用流式输出
    param.isStreamResponse = true
    const stream = await addon.data.lightRag.query(query, param)
    agentMessageDiv.innerHTML = ""
    for await (const chunk of stream) {
        // if(agentMessageDiv.innerHTML = "正在加载..."){
        //     agentMessageDiv.innerHTML = ""
        // }
        console.log(chunk)
        agentMessageDiv.innerHTML += chunk
    }
    // window.alert("回答完毕")
    //query_btn.disabled = false
    //再次回答相同的内容会使用缓存
    new ztoolkit.ProgressWindow(config.addonName)
      .createLine({
        text: "回答完毕",
        type: "success",
      })
      .show();
    
    const queryAnswerHistory: queryAnswerHistory = {
        queryString: query,
        answerString: agentMessageDiv.textContent
    }
    addon.data.lightRagUi.queryAnswerHistoryList.push(queryAnswerHistory)
}

async function registerLightRag(){
    // const rag = await createLightRAG()
    const rag = await getRag()
    addon.data.lightRag = rag
    // ztoolkit.getGlobal("alert")("registerLightRag")
}

function registerLightRagUi(){
    const lightRagUi =  createLightRAGUI()
    addon.data.lightRagUi = lightRagUi
    setPromptListToLightRagUi()
    addon.data.lightRagUi.updatePromptCallBackFunc = updatePromptCallBackFunc
    
    const url = "http://127.0.0.1:8000/"
    const queryLocalHostCallBack = (args:any)=>{
        const ragData = args.response
        console.log("ragData", ragData)
    }
    queryLocalHostNeedRagData(url, queryLocalHostCallBack)
}

function registerZoteroRagButtonContainer() {
    let maxTimes = 100
    const intervalId = setInterval(() => {
        maxTimes--;
        if (addon.data.lightRag) {
            createZoteroRagButtonContainer()
            clearInterval(intervalId);
        }
        if(maxTimes <= 0){
            clearInterval(intervalId);
        }
        // 你的代码逻辑
    }, 500);

    
}

function createZoteroRagButtonContainer(){
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
                  listener: async () => {
                    
                    
                    if(!addon.data.lightRagUi){
                      return
                    }
                    addon.data.lightRagUi.insertTaskListContainerDiv?.remove()
                    const insertTaskListContainerDiv = addon.data.lightRagUi.createInsertTaskListContainerDiv(document) as HTMLDivElement
                    console.log(document)
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
                    if(!addon.data.lightRagUi){
                      return
                    }
                    // if(!addon.data.zoteroRagChatDialog 
                    //     || !addon.data.zoteroRagChatDialog.window
                    //     || !addon.data.zoteroRagChatDialogWindowOriginalClose){
                    //     return
                    //   }
                    // addon.data.zoteroRagChatDialog.window.close = addon.data.zoteroRagChatDialogWindowOriginalClose
                    // addon.data.zoteroRagChatDialog?.window.close()
                    // if(addon.data.zoteroRagChatDialog){
                    //     return
                    //   }

                    const dialogChat = new ztoolkit.Dialog(1,1)
                    .addCell(0, 0, {
                      tag: "div",
                      classList: ["zotero-rag-chat-container-1-div"],
                      styles: {
                        width: "790px",
                        height: "490px",
                        // width: "100%",
                        // height: "100%",
                        // display: "flex",
                        // justifyContent: "center",
                        // backgroundColor: "white",
                      },
                    })
                    .open("Zotero-RAG 聊天界面", 
                      {
                        width: 800,
                        height: 500,
                        resizable: false,
                        centerscreen: true,
                      }
                    )
                    
                    setTimeout(()=>{
                        if(!addon.data.lightRagUi){
                            return
                        }
                        const hhh = dialogChat.window.document.querySelector(".zotero-rag-chat-container-1-div")
                        // addon.data.zoteroRagChatDialogWindowOriginalClose = dialogChat.window.close
                        // dialogChat.window.close = () => {
                        //     dialogChat.window.blur()
                        // }
                        // if(!addon.data.lightRagUi.chatMainContainerDiv){
                        //     const chatMainContainerDiv = addon.data.lightRagUi.createchatMainContainerDiv(dialogChat.window.document)
                        //     // if(!addon.data.zoteroRagChatDialog 
                        //     //     || !addon.data.zoteroRagChatDialog.window
                        //     //     || !addon.data.zoteroRagChatDialogWindowOriginalClose){
                        //     //     return
                        //     // }
                        //     // addon.data.zoteroRagChatDialog.window.close = addon.data.zoteroRagChatDialogWindowOriginalClose
                        //     // addon.data.zoteroRagChatDialog?.window.close()
                        // }
                        const chatMainContainerDiv = addon.data.lightRagUi.createchatMainContainerDiv(dialogChat.window.document)
                        // const chatMainContainerDiv = addon.data.lightRagUi.createchatMainContainerDiv(document)
                        hhh?.appendChild((addon.data.lightRagUi.chatMainContainerDiv) as HTMLDivElement)
                        addon.data.lightRagUi.sendMessageCallBackFunc = lightRagChatQuery
                        addon.data.zoteroRagChatDialog = dialogChat
                    }, 500)

                  }
              }
            ]
          }
        ]
        
      })

      .open("Zotero-RAG 功能菜单", {
        width: 200,
        height: 50,
        resizable: false,
        centerscreen: true,
      })
    
    addon.data.zoteroRagButtonDialog = dialogHelper
}

function updatePromptCallBackFunc(args: any){
    // 更新lightragui的promptArrString到prefs
    if(!addon.data.lightRagUi){
        return
    }
    setPref("prompt-arr-string", addon.data.lightRagUi.promptArrString)
}

function setPromptListToLightRagUi(){
    // 将prefs中的prompt-arr-string设置到lightRagUi
    if(!addon.data.lightRagUi){
        return
    }
    const promptArrString = getPref("prompt-arr-string") as string
    
    addon.data.lightRagUi.promptArrString = promptArrString
    if(promptArrString.length == 0){
        addon.data.lightRagUi.promptList = []
        return
    }
    addon.data.lightRagUi.promptList = addon.data.lightRagUi.promptArrString
    .split(addon.data.lightRagUi.promptSplit).map((promptString) => {
        const promptStringArr = promptString.split((addon.data.lightRagUi?.frontBackPromptSplit) as string)
        return {
            "frontPrompt": promptStringArr[0],
            "backPrompt": promptStringArr[1]
        }
    })

}


export {
    ragItems,
    lightRagChatQuery,
    registerLightRag,
    registerLightRagUi,
    registerZoteroRagButtonContainer,
    updatePromptCallBackFunc
}