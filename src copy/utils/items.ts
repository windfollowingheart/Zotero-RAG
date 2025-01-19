import { RagProcess } from "lightrag-js/dist/node/rag/lightrag"
import { config } from "../../package.json";
import { getString } from "./locale";
import { parse } from "path";
import { getRag } from "../rag/rag";
// import * as pdfjsLib from "pdfjs-dist";
// import * as pdfJs from "pdfjs-dist";

// import pdfWorker from "pdfjs-dist/build/pdf.worker";




async function ragItems() {
    if(!addon.data.lightRag){
        console.log("lightRag is undefine")
        // return
        addon.data.lightRag = await getRag()
    }

    //找到显示进度的dom
    const ragSelectItemsPdfButton = document.querySelector(".rag-select-items-pdf-button") as HTMLDivElement
    const ragInsertProgressContainer = document.querySelector(".rag-insert-progress-container") as HTMLDivElement
    const loadingImgDiv = document.querySelector(".rag-insert-progress-loading-div") as HTMLDivElement
    const progressTextDiv = document.querySelector(".rag-insert-progress-text-div") as HTMLDivElement
    if(!ragInsertProgressContainer || !loadingImgDiv || !progressTextDiv){
        console.log("ragInsertProgressContainer  loadingImgDiv progressTextDiv is undefine")
        return
    }
    ragSelectItemsPdfButton.style.opacity = "0.5"
    ragSelectItemsPdfButton.style.cursor = "not-allowed"
    ragSelectItemsPdfButton.style.pointerEvents = "none"
    
    loadingImgDiv.innerHTML = `<img src="chrome://${config.addonRef}/content/icons/insertLoading.svg" width="20px" height="20px" alt="${getString("rag-progress-loading-stop-img-alt")}"/>`
    loadingImgDiv.setAttribute("title", getString("rag-progress-loading-stop-img-alt"))
    ragInsertProgressContainer.style.display = "flex"
    // loadingImgDiv.addEventListener("click", handleClickLoadingDiv)

    const items = ZoteroPane.getSelectedItems()

    for (let i = 0; i < items.length; i++) {
        const item = items[i]
        const pdfContent = await getItemPdfContent(item.id)
        console.log(pdfContent)
        // 开启定时器查询进度
        let _insertProgress: any
        const interval = setInterval(()=>{
            _insertProgress = addon.data.lightRag?.getRagProgress()
            // interface RagProcess {
            // totalInsertChunks: number;
            // readyInsertChunks: number;
            // isInsertReady: boolean;
            // isQueryReady: boolean;
            // }

            if(_insertProgress){
                // 更新进度
                const _progress = 0.8 * (_insertProgress.readyInsertChunks/_insertProgress.totalInsertChunks) + 
                0.1 * (_insertProgress.calcNodes/(_insertProgress.totalNodes+1)) + 
                0.1 * (_insertProgress.calcEdges/(_insertProgress.totalEdges+1))
                progressTextDiv.textContent = `当前解析条目:
                ${item.getDisplayTitle().length>16?item.getDisplayTitle().substring(0,16)+"...":item.getDisplayTitle()}  
                解析进度:${Math.floor(_progress*100)}%,
                总条目解析进度: ${i}/${items.length}`
            }
        }, 5000)

        await addon.data.lightRag?.insert(pdfContent)
        // addon.data.lightRag.insert(pdfContent)
        clearInterval(interval)

        
        progressTextDiv.textContent = `当前解析条目:
        ${item.getDisplayTitle().length>16?item.getDisplayTitle().substring(0,16)+"...":item.getDisplayTitle()}  
        解析进度:100%,
        总条目解析进度: ${i+1}/${items.length}`
    }
    loadingImgDiv.innerHTML = `<img src="chrome://${config.addonRef}/content/icons/insertSuccess.svg" width="20px" height="20px" alt="${getString("rag-progress-loading-success-img-alt")}"/>`
    loadingImgDiv.setAttribute("title", getString("rag-progress-loading-success-img-alt"))

    function handleClickLoadingSuccessDiv(){
        ragInsertProgressContainer.style.display = "none"
        loadingImgDiv.removeEventListener("click", handleClickLoadingSuccessDiv)
    }
    function handleClickLoadingDiv(){
        // stopRagItem = true
        
        loadingImgDiv.removeEventListener("click", handleClickLoadingDiv)
    }

    loadingImgDiv.addEventListener("click", handleClickLoadingSuccessDiv)

    ragSelectItemsPdfButton.style.opacity = "1"
    ragSelectItemsPdfButton.style.cursor = "pointer"
    ragSelectItemsPdfButton.style.pointerEvents = "auto"
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
    const uint8Array = await IOUtils.read(pdfUrl)
    // const pdfJs = await import('pdfjs-dist/build/pdf');
    const pdfJs = await import('../pdf/pdfjs-dist');
    // const pdfjsWorker = await import('pdfjs-dist/build/pdf.worker.entry');
    pdfJs.GlobalWorkerOptions.workerSrc = `chrome://${config.addonRef}/content/pdf.worker.js`
    const pdfDoc = await pdfJs.getDocument({ data: uint8Array }).promise;
    const numPages = pdfDoc.numPages;
    const allText = [];
    
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdfDoc.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join('');
        allText.push(pageText);
    }
    const pdfContent = allText.join('\n')
   
    return pdfContent
}


async function getItemPdfContent1(itemId:number):Promise<string> {
    console.log("getItemPdfContent",itemId)
    console.log("Zotero.Items.get(itemId)",Zotero.Items.get(itemId))
    const bestAttachmentState = await Zotero.Items.get(itemId).getBestAttachmentState() as any
    const attachmentKey = bestAttachmentState.key
    const libraryId = Zotero.Items.get(itemId).libraryID
    const dataDir = Zotero.DataDirectory.dir
    const _attachmentItem = Zotero.Items.getByLibraryAndKey(libraryId, attachmentKey) as any
    const _attachmentName =_attachmentItem.attachmentPath.replace("storage:", "")
    const pdfUrl = dataDir + "\\\\storage\\\\" + `${attachmentKey}\\` + _attachmentName
    const uint8Array = await IOUtils.read(pdfUrl)
    console.log
    console.log("uint8Array", uint8Array)
    let pdfContent = ""
    // 加载PDF文档
    pdfContent = await (new Promise((resolve, reject) =>{
        const myWorker = new Worker(`chrome://${config.addonRef}/content/pdf_worker.js`);
        myWorker.postMessage({uint8Array})
        myWorker.onmessage = (event) => {
            resolve(event.data)
        }
    }))
   
    return pdfContent
}



export {
    ragItems
}