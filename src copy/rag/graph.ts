import { config } from "../../package.json";


async function getKG() {
    const rag = addon.data.lightRag
    const filePath = `chrome://${config.addonRef}/content/test3.html`
    // const filePath = `chrome://${config.addonRef}/content/reader.xhtml`
    // // Zotero.File.putContents(Zotero.File.pathToFile(filePath), html1)
    const newWindow = Zotero.getMainWindow().open(
        filePath,
        ``,
        `chrome,centerscreen,resizable,status,width=900,height=550`
    )
    if (newWindow) {
        const interval = setInterval(() => {
            console.log(newWindow.document.readyState)
            if (newWindow.document.readyState === "complete") {
                clearInterval(interval)
                aa1(newWindow)

            }
        }, 100)

    }

    function aa1(win: Window,) {
        if (!rag) {
            console.log("rag is null")
            return
        }
        const script1 = rag.getKnowledgeScript()
        const aaa = win.document.createElement("script")
        if (aaa) {
            console.log("aaa", aaa)
            aaa.textContent = script1;
            win.document.body.appendChild(aaa)
        }




    }
}

export {
    getKG
}