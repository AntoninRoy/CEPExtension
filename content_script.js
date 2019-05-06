chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log("Message reçu de la part du plugin : "+request);
    switch(request.command) {
        case "hello" :
            sendResponse("ok");
            break;    
        default:
            sendResponse(null);
    }
});