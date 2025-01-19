import { lightRagSendUint8Array } from "lightrag-js";


async function mineruGetUploadUrl(apiToken: string, fileName: string) {
    const url = 'https://mineru.org.cn/api/v4/file-urls/batch';
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiToken}`
    };
    const data = {
        "enable_formula": true,
        "language": "en",
        "layout_model": "doclayout_yolo",
        "enable_table": true,
        "files": [
            { "name": fileName, "is_ocr": true, "data_id": "abcd" }
        ]
    };

    const xhr = await Zotero.HTTP.request("POST", url, {
        body: JSON.stringify(data),
        headers: headers
    });
    const response = JSON.parse(xhr.responseText);
    // console.log("response", response);
    const uploadUrl = response.data.file_urls[0];
    const batchId = response.data.batch_id
    // console.log("uploadUrl", uploadUrl);
    // console.log("batchId", batchId);
    return { uploadUrl, batchId }
}

async function mineruUploadFile(uploadUrl: string, filePath: string): Promise<boolean> {
    if(!addon.data.lightRag){
        return false
    }
    const uint8Array = await IOUtils.read(filePath)
    const uploadFileResponse = await lightRagSendUint8Array({
        file: uint8Array,
        url: uploadUrl,
        method: "PUT",
        headers: {}
    })
    console.log("uploadFileResponse", uploadFileResponse)
    if(uploadFileResponse.isok){
        return true
    }else{
        return false
    }
}

async function minerGetExtractMdResult(apiToken: string, batchId: string) {
    const url = `https://mineru.org.cn/api/v4/extract-results/batch/${batchId}`;
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiToken}`
    };

    const xhr = await Zotero.HTTP.request("GET", url, {
        headers: headers
    });
    const response = JSON.parse(xhr.responseText);
    // console.log("response1111", response);
    // const state = response.data.extract_result[0].state
    // if(state === 'done'){
    //     return 
    // }else{
    //     return false
    // }
    return response.data
    
}

async function minerDownloadResultZip(zipUrl: string):Promise<Uint8Array>{
    const xhr = await Zotero.HTTP.request("GET", zipUrl, {
        responseType: "arraybuffer",
    })
    const uint8Array = new Uint8Array(xhr.response);
    console.log("uint8Array", uint8Array);
    return uint8Array
}

async function minerExtractZip(uint8Array: Uint8Array){
    const zipSavePath = Zotero.DataDirectory.dir + "\\\\storage\\\\" + "rag" + "\\\\" + "pdf_extract_result.zip"
    await IOUtils.write(zipSavePath, uint8Array)
    // @ts-ignore
    const zipReader = Components.classes["@mozilla.org/libjar/zip-reader;1"].
    createInstance(Components.interfaces.nsIZipReader);
    zipReader.open(Zotero.File.pathToFile(zipSavePath));
    const entries = zipReader.findEntries(null);
    while (entries.hasMore()) {
        const entryName = entries.getNext();
        console.log("entryName", entryName)
    }
}


async function minerPdfExtractPipeLine(){
    const apiToken = "eyJ0eXBlIjoiSldUIiwiYWxnIjoiSFM1MTIifQ.eyJqdGkiOiI2NDIwODUzNyIsInJvbCI6IlJPTEVfUkVHSVNURVIiLCJpc3MiOiJPcGVuWExhYiIsImlhdCI6MTczNzE4NDk0NSwiY2xpZW50SWQiOiI0bTJ3b25lbWt2MnJtMzdud2VuOCIsInBob25lIjoiIiwidXVpZCI6IjFlMDk4OTVmLWJlMjctNDY3ZS04ZDI5LWFiMjU5ODMxM2Y5NiIsImVtYWlsIjoiIiwiZXhwIjoxNzM4Mzk0NTQ1fQ.Mb2GSRmqH-rE5-gvcNQcTsnmrpMV-GD9cYzpizy8jdIKS2KMK-f_Z6KWDsVEsKjySSx7uVeKv1YrxbnfaoicLw"
    const filePath = "C:\\Users\\DELL\\Desktop\\dsaf.pdf"
    const fileName = filePath.split('\\').pop() || "test.pdf"
    const {uploadUrl, batchId} = await mineruGetUploadUrl(apiToken, fileName)
    const isUploadSuccess = await mineruUploadFile(uploadUrl, filePath)
    if(isUploadSuccess){
        let maxTimes = 100
        const intervalId = setInterval(async () => {
            const extractMdResult = await minerGetExtractMdResult(apiToken, batchId)
            const state = extractMdResult.extract_result[0].state
            if(state === "done"){
                clearInterval(intervalId);
                const resultZipUrl = extractMdResult.extract_result[0].full_zip_url
                console.log("resultZipUrl", resultZipUrl)
            }
            console.log("正在检测。。。。")
        }, 5000);
        
    }
}

export {
    mineruGetUploadUrl,
    mineruUploadFile,
    minerGetExtractMdResult,
    minerDownloadResultZip,
    minerPdfExtractPipeLine
}