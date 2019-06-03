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
        //Cas ou la liste des utilisateurs a synchroniser est vide
        if(items.to_sync_users == null || items.to_sync_users.length == 0){
            //recuperation de l'user a ajouter
            const user_to_sync = JSON.parse(user);

            //Boucle afin de supprimer l'user de la liste des éléments a copier
            var to_paste_users = items.to_paste_users;
            for(var i = 0; i < to_paste_users.length; i++)
            {
                const element = to_paste_users[i];
                if(element.id == user_to_sync.id){
                    to_paste_users.splice(i,1);
                }
            }

            //Actualisation de la liste "to_paste_users"
            chrome.storage.local.set({ "to_paste_users": to_paste_users }, null);
        }else{
            //recuperation des listes du storage chrome
            var to_sync_users = items.to_sync_users;
            var to_paste_users = items.to_paste_users;
            
            //recuperation de l'user a ajouter
            const user_to_sync = JSON.parse(user);

            //Boucle afin de detecter si l'user n'est pas déja dans la liste des synchronisés
            let flag = true;
            for(var i = 0; i < to_sync_users.length; i++)
            {
                const element = to_sync_users[i];
                if(element.id == user_to_sync.id){
                    flag=false;
                }
            }

            //Boucle afin de supprimer l'user de la liste des éléments a copier
            for(var i = 0; i < to_paste_users.length; i++)
            {
                const element = to_paste_users[i];
                if(element.id == user_to_sync.id){
                    to_paste_users.splice(i,1);
                }
            }

            //si non présents dans la liste des synchronisés, on l'ajoute dans la liste
            if(flag)
                to_sync_users.push(user_to_sync);

             //Actualisation de la liste "to_paste_users" et "to_sync_users"
            chrome.storage.local.set({ "to_sync_users": to_sync_users }, null);
            chrome.storage.local.set({ "to_paste_users": to_paste_users }, null);
        }
      });
}