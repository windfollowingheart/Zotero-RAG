import { createAgentChatBox, createUserChatBox, sendQueryMessage, vaildUserInputValidity } from "./chat"
import { getString } from "./locale"
import { config } from "../../package.json";
import { ragItems } from "./items";
import { getKG } from "../rag/graph";


function createMainContainerUi(){
    // 创建rag insert的容器
    const ragInsertContainer = ztoolkit.UI.createElement(document, "div", {
        namespace: "html",
        classList: ["rag-insert-container"],
        styles:{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100px",
          width: "100%",
          // backgroundColor: "red",
          fontSize: "12px",
        },
      })
      // 创建UI按钮
      const ragItemPdfButtonContainer = ztoolkit.UI.createElement(document, "div", {
        namespace: "html",
        classList: ["rag-item-pdf-button-container"],
        styles:{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "50px",
          width: "100%",
          fontSize: "12px",
          
        },  
      })



      const ragSelectItemsPdfButton = ztoolkit.UI.createElement(document, "div", {
        properties: {
          innerHTML: getString("rag-select-items-button-title")
        },
        classList: ["rag-select-items-pdf-button"],
        styles:{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "30px",
          width: "150px",
          border: "1px solid rgb(172, 172, 172)",
          borderRadius: "5px",
          margin: "0 10px",
          cursor: "pointer",
        }
      })

      const ragKnowledgeGraphButton = ztoolkit.UI.createElement(document, "div", {
        properties: {
          innerHTML: getString("rag-knowledge-graph-button-title")
        },
        classList: ["rag-knowledge-graph-button"],
        styles:{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "30px",
          width: "150px",
          border: "1px solid rgb(172, 172, 172)",
          borderRadius: "5px",
          margin: "0 10px",
          cursor: "pointer",
        }
      })

      const ragSelectCollectionsPdfButton = ztoolkit.UI.createElement(document, "div", {
        properties: {
          innerHTML: getString("rag-select-collections-button-title")
        },
        styles:{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "30px",
          width: "150px",
          // backgroundColor: "red",
          border: "1px solid rgb(172, 172, 172)",
          borderRadius: "5px",
          margin: "0 10px",
          cursor: "pointer",
        }
      })

      // ragItemPdfButtonContainer.append(ragSelectItemsPdfButton, ragSelectCollectionsPdfButton)
      ragItemPdfButtonContainer.append(ragSelectItemsPdfButton, ragKnowledgeGraphButton)

      // 创建insert进度显示区域
      const ragInsertProgressContainer = ztoolkit.UI.createElement(document, "div", {
        namespace: "html",
        classList: ["rag-insert-progress-container"],
        styles:{
          display: "none",
          alignItems: "center",
          // justifyContent: "center",
          height: "30px",
          width: "90%",
          // backgroundColor: "pink",
          border: "1px solid rgb(172, 172, 172)",
          borderRadius: "5px",
          fontSize: "12px",
        },
      })
      const loadingImgDiv = ztoolkit.UI.createElement(document, "div", {
        namespace: "html",
        classList: ["rag-insert-progress-loading-div"],
        styles:{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "25px",
          width: "25px",
          cursor: "pointer",
        },
        properties:{
          innerHTML: ""
        }
      })

      const progressTextDiv = ztoolkit.UI.createElement(document, "div", {
        namespace: "html",
        classList: ["rag-insert-progress-text-div"],
        styles:{
          display: "flex",
          alignItems: "center",
          // justifyContent: "center",
          height: "30px",
          width: "100%",
          fontSize: "12px",
          // backgroundColor: "green",
        },
        
      })

      ragInsertProgressContainer.append(loadingImgDiv, progressTextDiv)

      ragInsertContainer.append(ragItemPdfButtonContainer, ragInsertProgressContainer)

      // 显示区域
      const displayAreaContainer = ztoolkit.UI.createElement(document, "div", {
        namespace: "html",
        classList: ["display-area-container"],
        styles:{
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          overflowY: "auto",
          flexDirection: "column",
          height: "500px",
          width: "100%",
          backgroundColor: "#F6F6F6",
          fontSize: "12px",
          padding: "5px",
          borderRadius: "5px",
        }
      })
      

      // 输入区域
      const userInputAreaContainer = ztoolkit.UI.createElement(document, "div", {
        namespace: "html",
        classList: ["user-input-area-container"],
        styles:{
          boxSizing: "border-box",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          height: "150px",
          width: "100%",
          // backgroundColor: "green",
          fontSize: "12px",
          padding: "10px"
        },
        
      })
      const userInputTextArea = ztoolkit.UI.createElement(document, "textArea", {
        namespace: "html",
        styles:{
          boxSizing: "border-box",
          overflowY: "auto",
          height: "120px",
          width: "90%",
          fontSize: "12px",
          borderRadius: "5px",
          padding: "10px",
          backgroundColor: "#fff",
        },
        properties: {
          placeholder: "请输入您的问题"
        }
      }) as HTMLTextAreaElement

      const userSendMessageButtonDiv = ztoolkit.UI.createElement(document, "div", {
        namespace: "html",
        styles:{
          
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "30px",
          width: "60px",
          border: "1px solid rgb(172, 172, 172)",
          borderRadius: "5px",
          margin: "5px",
          cursor: "pointer"
        },
        properties: {
          innerHTML: "发送"
        }
      })

      userInputAreaContainer.append(userInputTextArea,  userSendMessageButtonDiv)

      const mainContainer = ztoolkit.UI.createElement(document, "div", {
        namespace: "html",
        styles:{
          boxSizing: "border-box",
          display: "flex",
          justifyContent: "center",
          height: "100%",
          width: "95%",
          fontSize: "12px",
          flexDirection: "column",
          padding: "10px",
          margin: "10px",
          // border: "1px solid rgb(172, 172, 172)",
          borderRadius: "10px",
          boxShadow: "0 0 5px rgba(143, 143, 143, 0.5)"
        },

      })
      mainContainer.append(ragInsertContainer, displayAreaContainer, userInputAreaContainer)

      let isShiftPressed = false;
      function handleKeyDown(e: any) {
        if (e.key === 'Shift') {
          isShiftPressed = true;
        }
      }
      function handleKeyUp(e: any) {
        if (e.key === 'Shift') {
          isShiftPressed = false;
        }
      }
      const handleKeyPress = (e: any) => {
          // 检查是否按下了Enter键
          if (e.key === 'Enter') {
              // 如果Shift键没有被按下，提交表单
              if (!isShiftPressed) {
                  e.preventDefault(); // 阻止默认行为，如换行
                  handleSendMessage()

              } else {
                  userInputTextArea.textContent += '\n';
              }
          }
      }
      userInputTextArea.addEventListener('keydown', handleKeyDown);
      userInputTextArea.addEventListener('keyup', handleKeyUp);
      userInputTextArea.addEventListener('keypress', handleKeyPress);

      // 添加监听
      userSendMessageButtonDiv.addEventListener("click", () => {
        
        handleSendMessage()
      })

      function handleSendMessage(){
        if(!vaildUserInputValidity(userInputTextArea)){
          ztoolkit.getGlobal("alert")("请输入有效字符")
          return
        }
        const message = userInputTextArea.value
        userInputTextArea.value = ""
        const userMessageDiv = createUserChatBox(message)
        const [agentMessageContainer, agentMessage] = createAgentChatBox()

        displayAreaContainer.append(userMessageDiv, agentMessageContainer)

        sendQueryMessage({
          message: message,
          agentMessageDiv: agentMessage,
          displayAreaContainer: displayAreaContainer,
          userSendMessageButtonDiv:userSendMessageButtonDiv,
          mode: "hybrid",
          useStream: true,
        })
      }

      ragSelectItemsPdfButton.addEventListener("click", () => {
        // 
        ragItems()
        
      })

      ragKnowledgeGraphButton.addEventListener("click", () => {
        getKG()
      })

    return mainContainer
}

function createTestUi(){
  const nav = document.querySelectorAll("#zotero-context-pane-sidenav")
  if(nav.length!==1){
    console.log("nav not found")
    return
  }
  console.log("nav@@",nav)
  const navContainer = nav[0] as HTMLElement
  console.log("navContainer",navContainer)
  const relativeContainer = ztoolkit.UI.createElement(document, "div", {
    namespace: "html",
    classList: ['nav-sidebar-menu-container-div']
  })
  console.log("relativeContainer",relativeContainer)
  navContainer.append(relativeContainer)

  ztoolkit.UI.appendElement({
    tag: "link",
    id: `${config.addonRef} -link`,
    properties: {
      type: "text/css",
      rel: "stylesheet",
      href: `chrome://${config.addonRef}/content/main.css`
    }
  }, relativeContainer)
}

export {
  createMainContainerUi,
  createTestUi
}