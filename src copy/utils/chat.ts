import { QueryParam } from "lightrag-js"
import { getRag } from "../rag/rag"


async function query({useStream}:{
    useStream?:boolean
}){

}

function createUserChatBox(message: string): HTMLDivElement{
    const userMessageContainer = ztoolkit.UI.createElement(document, 'div', {
        namespace: "html",
        styles: {
            boxSizing: "border-box",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            width: "100%",
            margin: "10px 0",
            // backgroundColor: "#C0D6EC",

        }
    })

    const userMessage = ztoolkit.UI.createElement(document, 'div', {
        namespace: "html",
        styles: {
            display: "flex",
            padding: "5px",
            borderRadius: "10px 0 10px 10px",
            backgroundColor: "#C0D6EC",
            maxWidth: "100%",
            wordBreak: "break-all",
            whiteSpace: "pre-wrap",

        },
        properties:{
            textContent: message
        }
    })

    userMessageContainer.appendChild(userMessage)

    return userMessageContainer
}

function createAgentChatBox(): HTMLDivElement[]{
    const agentMessageContainer = ztoolkit.UI.createElement(document, 'div', {
        namespace: "html",
        styles: {
            boxSizing: "border-box",
            display: "flex",
            alignItems: "center",
            width: "100%",
            userSelect: "text",
            margin: "10px 0",
        }
    })

    const agentMessage = ztoolkit.UI.createElement(document, 'div', {
        namespace: "html",
        styles: {
            display: "flex",
            padding: "5px",
            borderRadius: "0px 10px 10px 10px",
            backgroundColor: "#fff",
            maxWidth: "100%",
            wordBreak: "break-all",
            whiteSpace: "pre-wrap",
        }
    })
    agentMessageContainer.appendChild(agentMessage)

    return [agentMessageContainer, agentMessage]
}

async function sendQueryMessage({
        message, 
        agentMessageDiv,
        displayAreaContainer,
        userSendMessageButtonDiv,
        mode,
        useStream
    }:{
        message:string,
        agentMessageDiv: HTMLDivElement,
        displayAreaContainer: HTMLDivElement,
        userSendMessageButtonDiv: HTMLDivElement,
        mode:"local" | "global" | "hybrid" | "naive",
        useStream:boolean
    }){
        
    if(!addon.data.lightRag){
        console.log("lightRag is undefine")
        // return
        addon.data.lightRag = await getRag()
    }

    userSendMessageButtonDiv.style.opacity = "0.5"
    userSendMessageButtonDiv.style.cursor = "not-allowed"
    userSendMessageButtonDiv.style.pointerEvents = "none"
    displayAreaContainer.scrollTop = displayAreaContainer.scrollHeight
    if(!addon.data.lightRag) return
    const param = new QueryParam()
    param.mode = mode
    param.isStreamResponse = useStream
    const rag = addon.data.lightRag
    const stream = await rag.query(message, param)
    for await (const chunk of stream) {
        // console.log(chunk)
        agentMessageDiv.textContent += chunk
        displayAreaContainer.scrollTop = displayAreaContainer.scrollHeight
    }

    userSendMessageButtonDiv.style.opacity = "1"
    userSendMessageButtonDiv.style.cursor = "pointer"
    userSendMessageButtonDiv.style.pointerEvents = "auto"
    
}

function vaildUserInputValidity(userInputTextArea: HTMLTextAreaElement): boolean{
    if(userInputTextArea.value?.trim().length ===0){
        return false
    }else{
        return true
    }
}

export {
    query,
    createUserChatBox,
    createAgentChatBox,
    sendQueryMessage,
    vaildUserInputValidity,
}