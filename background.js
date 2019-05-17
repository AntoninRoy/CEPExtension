chrome.runtime.onMessage.addListener(function(data, sender, sendResponse) {
    switch(data.command){
        case "user_validate" :
            user_validate(data.actual_user)
            break;
        case "clean" : 
            chrome.storage.local.set({ "added": null }, null);
            break;
    }
});


function user_validate(actual_user){
    chrome.storage.local.get(["added","users"], function(items){
        if(items.added == null || items.added.length == 0){
            //create added array
            const newAdherent = JSON.parse(actual_user);
            var newAdded = [
                newAdherent
            ];

            var users = items.users;
            for(var i = 0; i < users.length; i++)
            {
                const element = users[i];
                if(element.id == newAdherent.id){
                    users.splice(i,1);
                }
            }

            //Set value "added" in chrome extension storage local 
            chrome.storage.local.set({ "added": newAdded }, null);
            chrome.storage.local.set({ "users": users }, null);
        }else{
            var newAdded = items.added;
            var users = items.users;
            //forEach loop to test if the adherent is not already in the added array
            let flag = true;
            const newAdherent = JSON.parse(actual_user);
            newAdded.forEach(function (element) {
                if(element.id == newAdherent.id){
                    flag=false;
                }
            });

            var users = items.users;
            for(var i = 0; i < users.length; i++)
            {
                const element = users[i];
                if(element.id == newAdherent.id){
                    users.splice(i,1);
                }
            }

            if(flag)
                newAdded.push(newAdherent);

             //Set value "added" in chrome extension storage local 
            chrome.storage.local.set({ "added": newAdded }, null);
            chrome.storage.local.set({ "users": users }, null);
        }
      });
}