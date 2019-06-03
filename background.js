//Le background.js est un fichier qui s'execute en arrière plan même quand le plugin n'est pas ouvert. 
//On peut donc modifier les variable du google storage et receptionner des messages sans que le plugin soit ouvert.

//Listener pour les message (les messages permettent de communiquer entre l'extension chrome et le javascript de la page)
chrome.runtime.onMessage.addListener(function(data, sender, sendResponse) {
    //switch afin d'executer le traitement voulu en fonction du parametre reçu dans le message.
    switch(data.command){
        //message reçu lorsque l'envoi du formulaire a été envoyé avec succès.
        case "user_validate" :
            user_validate(data.actual_user);
            break;
        
        //message reçu après une synchronisation réussi. 
        case "clean" : 
            chrome.storage.local.set({ "to_sync_users": null }, null);
            break;

        default : 
    }
});

/**
 * Fonction qui enlève un adhérent de la liste "a copier"
 * @param {*} user 
 */
function user_validate(user){
    chrome.storage.local.get(["to_sync_users","to_paste_users"], function(items){
        
        if(items.to_sync_users == null || items.to_sync_users.length == 0){
            //create to_sync_users array
            const newAdherent = JSON.parse(user);
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
            const newAdherent = JSON.parse(user);
            newto_sync_users.forEach(function (element) {
                if(element.id == newAdherent.id){
                    flag=false;
                }
            });


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