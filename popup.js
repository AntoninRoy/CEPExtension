// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
const days = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
const months = ["Décembre", "Janvier", "Fevrier", "Mars", "Avril", "Mai", "Juin", "Juillet", "Aout", "Septembre", "Octobre", "Novembre"];


document.addEventListener('DOMContentLoaded', () => {
  $('#toPaste').DataTable({
    "bPaginate": true,
    "bLengthChange": false,
    "bFilter": true,
    "bInfo": false,
    "bAutoWidth": false,
    "columns": [
      { "width": "60%" },
      { "width": "20%" },
      { "width": "20%" },
    ],
    "pageLength": 4
  });

  $('#toSync').DataTable({
    "bPaginate": true,
    "bLengthChange": false,
    "bFilter": true,
    "bInfo": false,
    "bAutoWidth": false,
    "columns": [
      { "width": "80%" },
      { "width": "20%" },
    ],
    "pageLength": 4
  });

  chrome.storage.local.get(["to_paste_users", "added","last_update"], function (items) {
    displayInitUsers(items.to_paste_users);
    displaySyncUsers(items.added);

    if (items.last_update != null) {
      const last_update_date = new Date(items.last_update);
      document.getElementById("last_update").textContent = 'Dernière initialisation : ' + days[last_update_date.getDay()] + " " + last_update_date.getDate() + " " + months[last_update_date.getDay()] + ", " + last_update_date.getHours() + "h" + last_update_date.getMinutes();
    } else {
      document.getElementById("last_update").textContent = "Dernière initialisation : Jamais";
    }

    $('table#toPaste tbody').on('click', '.btn_paste', function (event) {
      document.getElementById("paste_info").textContent = "Copie en cours ...";
      paste(event.currentTarget.id);
    });

    $('table#toPaste tbody').on('click', '.btn_toAdded', function (event) {
      console.log("dqzdqz");
      //Récupeartion de l'id de l'adhérent ou le bouton a été déclenché
      const id = event.currentTarget.id;

      //Recuperation dans le storage local des adhérents initialisés "to_paste_users" et des adhérents à synchroniser "added "
      chrome.storage.local.get(["added", "to_paste_users"], function (items_bis) {
        var added = items_bis.added;
        if(added ==null)
          added = [];

        var users = items_bis.to_paste_users;
        if(users ==null)
           users = [];

        //Recherche de l'adhérent dans la liste "to_paste_users"
        for (let j = 0; j < users.length; j++) {
          const element = users[j];
          if (element.id == id) {

            //On le retire de la liste "to_paste_users"
            users.splice(j, 1);
            //Et on l'ajoute dans les "added"
            added.push(element);
          }
        }

        chrome.storage.local.set({ "added": added }, null);
        chrome.storage.local.set({ "to_paste_users": users }, null);

        displaySyncUsers(added);
        displayInitUsers(users);
      });
    });

    $('table#toSync tbody').on('click', '.btn_return', function (event) {

      //Récupeartion de l'id de l'adhérent ou le bouton a été déclenché
      const id = event.currentTarget.id;

      //Recuperation dans le storage local des adhérents initialisés "to_paste_users" et des adhérents à synchroniser "added "
      chrome.storage.local.get(["added", "to_paste_users"], function (items_bis) {
        var added = items_bis.added;
        if(added ==null)
          added = [];

        var users = items_bis.to_paste_users;
        if(users ==null)
           users = [];

        //Recherche de l'adhérent dans la liste "added"
        for (let j = 0; j < added.length; j++) {
          const element = added[j];
          if (element.id == id) {
            //On le retire de la liste "added"
            added.splice(j, 1);
            //Et on l'ajoute dans les "to_paste_users"
            users.push(element);
          }
        }

        chrome.storage.local.set({ "added": added }, null);
        chrome.storage.local.set({ "to_paste_users": users }, null);

        displaySyncUsers(added);
        displayInitUsers(users);
      });
    });
    
    document.getElementById("btn_copy").addEventListener("click", function () {
      document.getElementById("errorInit").textContent = "Initialisation en cours ...";
      copy();
    });


    document.getElementById("btn_sync").addEventListener("click", function () {
      document.getElementById("errorSync").textContent = "Synchronisation en cours ...";
      sync();
    });

  });



  chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, function (tabs) {
    chrome.tabs.executeScript({ file: 'content_script.js' });
  });
  //inject du javascript dans la page actuelle

});

function sync() {

  chrome.storage.local.get(["added"], function (items_bis) {


    let added = items_bis.added;
    if (added != null && added.length > 0) {
      let ids = [];

      added.forEach(element => {
        ids.push(element.id);
      });

      chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, function (tabs) {
        var data = new Object();
        data["command"] = "sync_added";
        data["ids"] = ids;

        chrome.tabs.sendMessage(tabs[0].id, data, null, function (obj) {
          if (obj.status == "ok") {
            document.getElementById("errorSync").textContent = "Synchronisation terminée .";
            window.close();
          } else {
            document.getElementById("errorSync").textContent = "Impossible de synchroniser sur cette page.";
          }

        });
      });
    } else {
      document.getElementById("errorSync").textContent = "Aucun élément a synchroniser.";
    }




  });
}
function copy() {

  chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, function (tabs) {

    chrome.storage.local.get(["added"], function (items) {
      if (items.added == null || items.added.length == 0) {
        var data = new Object();
        data["command"] = "copy_licence_holders";
        // request content_script to retrieve title element innerHTML from current tab
        chrome.tabs.sendMessage(tabs[0].id, data, null, function (obj) {
          if (obj == undefined || obj.response == undefined || obj.response.length < 1 || obj.response.length == undefined) {
            document.getElementById("errorInit").textContent = "Impossible de copier les données.";
          } else {
            setTimeout(function () {
              chrome.storage.local.set({ "to_paste_users": obj.response }, null);
              chrome.storage.local.set({ "last_update": Date.now() }, null);


              displayInitUsers(obj.response);

              const last_update_date = new Date();
              document.getElementById("last_update").textContent = 'Dernière initialisation : ' + days[last_update_date.getDay()] + " " + last_update_date.getDate() + " " + months[last_update_date.getDay()] + ", " + last_update_date.getHours() + "h" + last_update_date.getMinutes();
              document.getElementById("errorInit").textContent = "Données copiées avec succès.";
            }, 2000);

          }
        });
      } else {
        document.getElementById("errorInit").textContent = "Votre pile d'éléments à synchroniser doit être vide pour initialiser.";
      }

    });


  });
}

/**
 * Fonction qui va dans un premier temps récupérer un adhérent dans le local storage en fonction de son ID, puis lancé la fonction sendUserToContentScript
 * @param {*} id 
 */
function paste(id) {
  //Fonction qui permet d'accéder à une variable du localStorage d'une extension Google
  //Ici, nous aurons ensuite pouvoir accéder à la variable "to_paste_users" via items.to_paste_users
  chrome.storage.local.get(["to_paste_users"], function (items) {
    //variable qui contiendra l'adhérent a copier s'il est trouvé
    let to_paste_user_find = null;
    //boucle for sur les adhérents prêts à étre copié dans le formulaire
    items.to_paste_users.forEach(function (element) {
      //if pour savoir si l'ID de l'adhérent actuel est le même que celui qu'on cherche
      if (element.id == id) {
        //si oui l'element est sauvegardé dans la vairable prévu a cet effet
        to_paste_user_find = element;
      }
    });

    //If afin de savoir si un adhérent a été trouvé
    if (to_paste_user_find == null){
      //Modification du label d'information
      document.getElementById("paste_info").textContent = "Erreur";
    }else{
      //lancement de la contion d'envoi vers le content-script
      sendUserToContentScript(to_paste_user_find);
    } 
  });
}

/**
 * Envoi un utilisateur au content-script afin qu'il puisse ensuite injecter les informations dans le formulaire
 * @param {*} user 
 */
function sendUserToContentScript(user) {
  //Creation de l'objet qui sera envoyé au content-script (void doc)
  var data = new Object();
  //La valeur associée a command correspond a l'action qui devra être effectuée lors de la recpetion du message
  data["command"] = "paste_licence_holder";
  //valeur associée a user est l'adhérent a copier
  data["user"] = user;

  //cette fonction permet de récupérer l'onglet actif. Elle renvoie un tableau. L'onglet actif sera ensuite accessible via tabs[0]
  chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, function (tabs) {
    //Envoi un message à l'onglet spécifié au premier parametre. Le deuxième paramètre est les données expliqué précédemment.
    //Le dernier paramètre est la fonction callBack (exécutée lorsque une réponse sera renvoyée.)
    chrome.tabs.sendMessage(tabs[0].id, data, null, function (obj) {
      //s'excute lorsque une réponse est renvoyée.
      if (obj.status != null && obj.status == "ok") {
        //Modification du label d'information 
        document.getElementById("paste_info").textContent = "Adhérent copié avec succès.";
      }else{
         //Modification du label d'information
        document.getElementById("paste_info").textContent = "Erreur lors de la copie de l'adhérent.";
      }
    });
  });
}

/**
 * Actualise le tableau avec les utilisateurs prêts à etre synchronisés vers l'application web.
 * @param {*} to_sync_users 
 */
function displaySyncUsers(to_sync_users) {
  //Le tableau est vidé
  $('#toSync').DataTable().clear().draw();
  //si il y'a pas d'adhérent dans la liste rien n'est fait, le tableau reste vide
  if (to_sync_users != null) {
    //boucle for sur les adhérents des utilisateurs prêts à être sinchronisés
    to_sync_users.forEach(function (element) {
      //ajout d'une ligne dans le tableau.
      $('#toSync').DataTable().row.add([
        element.firstName + " " + element.lastName,
        '<button id="' + element.id + '" class="btn_return">Remettre dans la liste a copier</button>',
      ]).draw(false);
    })
  }
}

/**
 * Actualise le tableau avec les utilisateurs prêts copier dans le formulaire.
 * @param {*} to_paste_users 
 */
function displayInitUsers(to_paste_users) {
  //Le tableau est vidé.
  $('#toPaste').DataTable().clear().draw();
  //si il y'a pas d'adhérent dans la liste rien n'est fait, le tableau reste vide
  if (to_paste_users != null) {
    //boucle for sur les adhérents prêts à étre copié dans le formulaire
    to_paste_users.forEach(function (element) {
       //ajout d'une ligne dans le tableau.
      $('#toPaste').DataTable().row.add([
        element.firstName + " " + element.lastName,
        '<button id="' + element.id + '" class="btn_paste">Coller dans le formulaire</button>',
        '<button id="' + element.id + '" class="btn_toAdded">Ajouter aux synchronisés</button>'

      ]).draw(false);
    })
  }
}