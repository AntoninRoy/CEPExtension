chrome.runtime.onMessage.addListener(function(data, sender, sendResponse) {
    switch(data.command){
        case "user_validate" :
            user_validate(data.actual_user);
            console.log(data.actual_user);
            break;
        case "clean" : 
            chrome.storage.local.set({ "to_sync_users": null }, null);
            break;
    }
});


function user_validate(actual_user){
    chrome.storage.local.get(["to_sync_users","to_paste_users"], function(items){
        
        if(items.to_sync_users == null || items.to_sync_users.length == 0){
            //create to_sync_users array
            const newAdherent = JSON.parse(actual_user);
            var newto_sync_users = [
                newAdherent
            ];

            var to_paste_users = items.to_paste_users;
            for(var i = 0; i < to_paste_users.length; i++)
            {
                const element = to_paste_users[i];
                if(element.id == newAdherent.id){
                    to_paste_users.splice(i,1);
                }
            }

            //Set value "to_sync_users" in chrome extension storage local 
            chrome.storage.local.set({ "to_sync_users": newto_sync_users }, null);
            chrome.storage.local.set({ "to_paste_users": to_paste_users }, null);
        }else{
            var newto_sync_users = items.to_sync_users;
            var to_paste_users = items.to_paste_users;
            //forEach loop to test if the adherent is not already in the to_sync_users array
            let flag = true;
            const newAdherent = JSON.parse(actual_user);
            newto_sync_users.forEach(function (element) {
                if(element.id == newAdherent.id){
                    flag=false;
                }
            });

            var to_paste_to_paste_users = items.to_paste_users;
            for(var i = 0; i < to_paste_users.length; i++)
            {
                const element = to_paste_users[i];
                if(element.id == newAdherent.id){
                    to_paste_users.splice(i,1);
                }
            }

            if(flag)
                newto_sync_users.push(newAdherent);

             //Set value "to_sync_users" in chrome extension storage local 
            chrome.storage.local.set({ "to_sync_users": newto_sync_users }, null);
            chrome.storage.local.set({ "to_paste_users": to_paste_users }, null);
        }
      });
}