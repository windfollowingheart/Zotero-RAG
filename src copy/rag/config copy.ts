import { getPref } from "../utils/prefs"

export const dataDir = Zotero.DataDirectory.dir + "\\\\storage\\\\" + "rag"

const llmUrl = getPref("llm-url")
const llmApiKey = getPref("llm-apikey")
const llmModel = getPref("llm-model")
const embeddingUrl = getPref("embedding-url")
const embeddingApiKey = getPref("embedding-apikey")
const embeddingModel = getPref("embedding-model")

export const lightRagConfig = {
    "RAG_DIR": dataDir,
    "LLM_MODEL": "deepseek-chat",
    "LLM_API_KEY": "sk-976bdb7c9741446a97e7d413c87372c7",
    "LLM_BASE_API_URL": "https://api.deepseek.com",
    "EMBEDDING_MODEL": "text-embedding-3-large",
    // "EMBEDDING_MODEL": "text-embedding-v1",
    // "EMBEDDING_MAX_TOKEN_SIZE": 8192,
    "EMBEDDING_MAX_TOKEN_SIZE": 2048,
    "EMBEDDING_MODEL_API_KEY": "sk-WVVoskAxYEI9Psr4FqDiDutrckwYZZp2QyhBGHiuEI8rKeLi",
    // "EMBEDDING_MODEL_API_KEY": "sk-366aa1f1ca994e6a915a1549147751db",
    "EMBEDDING_MODEL_BASE_API_URL": "https://api.chatanywhere.tech/v1",
    // "EMBEDDING_MODEL_BASE_API_URL": "https://dashscope.aliyuncs.com/compatible-mode/v1",
    "PORT": 5000
}
