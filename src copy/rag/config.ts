import { getPref } from "../utils/prefs"

export const dataDir = Zotero.DataDirectory.dir + "\\\\storage\\\\" + "rag"

const llmUrl = getPref("llm-url") as string
const llmApiKey = getPref("llm-apikey") as string
const llmModel = getPref("llm-model") as string
const embeddingUrl = getPref("embedding-url") as string
const embeddingApiKey = getPref("embedding-apikey") as string
const embeddingModel = getPref("embedding-model") as string

export const lightRagConfig = {
    "RAG_DIR": dataDir,
    "LLM_MODEL": llmModel,
    "LLM_API_KEY": llmApiKey,
    "LLM_BASE_API_URL": llmUrl,
    "EMBEDDING_MODEL_BASE_API_URL": embeddingUrl,
    "EMBEDDING_MODEL_API_KEY": embeddingApiKey,
    "EMBEDDING_MODEL": embeddingModel,
    "EMBEDDING_MAX_TOKEN_SIZE": 2048,
}
