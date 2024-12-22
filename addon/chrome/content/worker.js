importScripts("tiktoken.min.js")



self.onmessage = function(e) {
    const type = e.data.type;
    if(type === "tiktoken_encode"){
        // type: "tiktoken_encode",
        // content: content,
        // modelName: modelName
        const modelName = e.data.modelName;
        const text = e.data.content;
        // console.log(tiktoken)
        // console.log(tiktoken.encodingForModel)
        const enc = tiktoken.encodingForModel(modelName)
        const tokens = enc.encode(text)
        postMessage(tokens);
    }else if(type === "tiktoken_decode"){
        // type: "tiktoken_decode",
        // tokens: tokens,
        // modelName: modelName
        const modelName = e.data.modelName;
        const tokens = e.data.tokens;
        const enc = tiktoken.encodingForModel(modelName)
        content = enc.decode(tokens)
        postMessage(content);
    }
    
}