import {
    LightRAG,
    createLightRAG,
    embeddingFunc,
    llmModelFunc,
    openAiCompleteIfCache,
    openAiEmbedding
} from "lightrag-js"
import { lightRagConfig } from "../rag/config";

import { config } from "../../package.json";
import { getPref } from "../utils/prefs";

async function llm_model_func(
    prompt: string, options: any
) {
    const system_prompt = options?.system_prompt || '';
    const history_messages = options?.history_messages || [];
    const kwargs = options;
    return await openAiCompleteIfCache(
        lightRagConfig['LLM_MODEL'],
        prompt,
        system_prompt,
        history_messages,
        lightRagConfig['LLM_BASE_API_URL'],
        lightRagConfig['LLM_API_KEY'],
        kwargs,
        setNewLLMInfoFunc
    )
}

async function embedding_func(texts: string[]) {
    return await openAiEmbedding(
        texts,
        lightRagConfig['EMBEDDING_MODEL_BASE_API_URL'],
        lightRagConfig['EMBEDDING_MODEL_API_KEY'],
        lightRagConfig['EMBEDDING_MODEL'],
        setNewEmbeddingInfoFunc
    )
}

async function _loadJson(filePath: string):Promise<Record<string, any>>{
    //TODO
    try{
        const josnText = await Zotero.File.getContentsAsync(filePath) as string
        return JSON.parse(josnText)
    }catch(e:any){
        console.log("加载json失败", filePath, e)
        return {}
    }
    
    
}

async function _writeJson(jsonObject: Record<string, any>, filePath: string) {
    //TODO
    try{
        const fileName = Zotero.File.pathToFile(filePath).displayName
        const fileDir = await Zotero.File.getClosestDirectory(filePath) as string
        console.log("fileDir", fileDir)
        Zotero.File.createDirectoryIfMissing(fileDir)
        const jsonText = JSON.stringify(jsonObject, null, 4)
        Zotero.File.putContentsAsync(filePath, jsonText)
        
        
    }catch(e:any){
        console.log("写入json失败", filePath, e)
    }
}

function setNewLLMInfoFunc(){
    const newUrl = getPref("llm-url") as string
    const newApiKey = getPref("llm-apikey") as string
    const newModel = getPref("llm-model") as string
    console.log("newUrl", newUrl)
    console.log("newApiKey", newApiKey)
    console.log("newModel", newModel)
    return {newUrl, newApiKey, newModel}
}

function setNewEmbeddingInfoFunc(){
    const newUrl = getPref("embedding-url") as string
    const newApiKey = getPref("embedding-apikey") as string
    const newModel = getPref("embedding-model") as string
    console.log("newUrl", newUrl)
    console.log("newApiKey", newApiKey)
    console.log("newModel", newModel)
    return {newUrl, newApiKey, newModel}
}   

async function getRag() {
    const rag = await (createLightRAG(
        {
            workingDir: lightRagConfig['RAG_DIR'],
            llmModelFunc: new llmModelFunc(llm_model_func),
            embeddingFunc: new embeddingFunc(
                3072,
                lightRagConfig['EMBEDDING_MAX_TOKEN_SIZE'],
                embedding_func,
            ),
            loadJsonFunc: _loadJson,
            writeJsonFunc: _writeJson,
            llmModelMaxAsync: 2,
            embeddingFuncMaxAsync:2,
            llmModelMaxTokenSize: 2048,
            // chunkTokenSize: 512,
            embeddingBatchNum: 20,
            enableWorker: true,
            workerJs: `chrome://${config.addonRef}/content/worker.js`,
            enableMergeThenUpsertMultiThread: false
        }
    ))
    return rag
}

async function ragTextContent(content: string){
    addon.data.lightRag?.insert(content)
}

export {
    getRag,
    ragTextContent
}