chrome.runtime.onMessage.addListener(function(data, sender, sendResponse) {
    console.log("chrome.runtime.onMessage: "+data.command);
    switch(data.command) {
        case "copy_licence_holders" :
            console.log("La je copie");
            sendResponse({
                response: {
                    "dzqdzqdqz" : "dzqdqzdqz",
                    "dzdzq" : "dsqdqzd"
                }
            });
            break; 
        default:
        sendResponse({
            response: "Error"
        });
    }
});