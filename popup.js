// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.


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

  chrome.storage.local.get(["to_paste_users", "to_sync_users", "last_update"], function (items) {

    //##### INITIALISATION DES DONNEES DU PLUGIN #####
                 
    //Affichage du tableau avec les adhérents prêts à etre copiés dans le formulaire de GestGym vers l'application web.
    displayInitUsers(items.to_paste_users);
    //Affichage du tableau avec les adhérents prêts à etre synchronisés vers l'application web.
    displaySyncUsers(items.to_sync_users);

    //test si il y a une date de dernière initialisation
    if (items.last_update != null) {
      //si oui actualisation de la date 
      const last_update_date = new Date(items.last_update);
      displayUpdateInitDate(last_update_date);
    } else {
      //si non modification du label d'information
      document.getElementById("last_update").textContent = "Dernière initialisation : Jamais";
    }

    //##### INITIALISATION DES LISTENERS DU PLUGIN #####


    //Ajout d'un listener (syntaxe différente que addListener car plusieurs listeners sont ajoutés en meme temps)
    //Les listeners sont ajouté aux boutons "Coller dans le formulaire, qui permettent d'injecter les données d'un adhérent 
    //le formulaire de GestGym
    $('table#toPaste tbody').on('click', '.btn_paste', function (event) {
      document.getElementById("paste_info").textContent = "Copie en cours ...";
      paste(event.currentTarget.id);
    });
    //Ajout d'un listener (syntaxe différente que addListener car plusieurs listeners sont ajoutés en meme temps)
    //Les listeners sont ajouté aux boutons "Ajouter au synchronisés", qui permettent de changer un adhérent de la liste
    //"to_paste_users" a "to_sync_users"
    $('table#toPaste tbody').on('click', '.btn_toAdded', function (event) {
      //Récupeartion de l'id de l'adhérent ou le bouton a été déclenché
      const id = event.currentTarget.id;

      //Recuperation dans le storage local des adhérents initialisés "to_paste_users" et des adhérents à synchroniser "to_sync_users "
      chrome.storage.local.get(["to_sync_users", "to_paste_users"], function (items_bis) {
        //test si to_sync_users n'est pas null. Si il l'est, on lui affecte un tableau vide
        var to_sync_users = items_bis.to_sync_users;
        if (to_sync_users == null)
          to_sync_users = [];

        //test si to_paste_users n'est pas null. Si il l'est, on lui affecte un tableau vide
        var to_paste_users = items_bis.to_paste_users;
        if (to_paste_users == null)
          to_paste_users = [];

        //Recherche de l'adhérent dans la liste "to_paste_users"
        for (let j = 0; j < to_paste_users.length; j++) {
          const element = to_paste_users[j];
          if (element.id == id) {
            //On le retire de la liste "to_paste_users"
            to_paste_users.splice(j, 1);
            //Et on l'ajoute dans les "to_sync_users"
            to_sync_users.push(element);
          }
        }

        //Actualisation des liste "to_sync_users" et "to_paste_users" avec l'adhérent changer de liste
        chrome.storage.local.set({ "to_sync_users": to_sync_users }, null);
        chrome.storage.local.set({ "to_paste_users": to_paste_users }, null);

        //Actualisation de tableau avec les adhérents prêts à etre synchronisés vers l'application web.
        displaySyncUsers(to_sync_users);
        //Actualisation de tableau avec les adhérents prêts à etre copiés dans le formulaire de GestGym vers l'application web.
        displayInitUsers(to_paste_users);
      });
    });

    //Ajout d'un listener (syntaxe différente que addListener car plusieurs listeners sont ajoutés en meme temps)
    //Les listeners sont ajouté aux boutons "Remettre dans liste a copier", qui permettent de changer un adhérent de la liste
    //"to_sync_users" a "to_paste_users"
    $('table#toSync tbody').on('click', '.btn_return', function (event) {
      //Récupeartion de l'id de l'adhérent ou le bouton a été déclenché
      const id = event.currentTarget.id;
      //Recuperation dans le storage local des adhérents initialisés "to_paste_users" et des adhérents à synchroniser "to_sync_users "
      chrome.storage.local.get(["to_sync_users", "to_paste_users"], function (items_bis) {
        //test si to_sync_users n'est pas null. Si il l'est, on lui affecte un tableau vide
        var to_sync_users = items_bis.to_sync_users;
        if (to_sync_users == null)
          to_sync_users = [];

        //test si to_paste_users n'est pas null. Si il l'est, on lui affecte un tableau vide
        var to_paste_users = items_bis.to_paste_users;
        if (to_paste_users == null)
          to_paste_users = [];

        //Recherche de l'adhérent dans la liste "to_sync_users"
        for (let j = 0; j < to_sync_users.length; j++) {
          const element = to_sync_users[j];
          //si TRUE, on vient de trouver l'adhérent dans la liste
          if (element.id == id) {
            //On le retire de la liste "to_sync_users"
            to_sync_users.splice(j, 1);
            //Et on l'ajoute dans les "to_paste_users"
            to_paste_users.push(element);
          }
        }

        //Actualisation des liste "to_sync_users" et "to_paste_users" avec l'adhérent changer de liste
        chrome.storage.local.set({ "to_sync_users": to_sync_users }, null);
        chrome.storage.local.set({ "to_paste_users": to_paste_users }, null);

        //Actualisation de tableau avec les adhérents prêts à etre synchronisés vers l'application web.
        displaySyncUsers(to_sync_users);
        //Actualisation de tableau avec les adhérents prêts à etre copiés dans le formulaire de GestGym vers l'application web.
        displayInitUsers(to_paste_users);
      });
    });

    //Listener du bouton "Initialisation". Lors d'un clic, la fonction défini en paramètre est exécutée.
    document.getElementById("btn_copy").addEventListener("click", function () {
      //Modification du label d'information
      document.getElementById("init_info").textContent = "Initialisation en cours ...";
      //Lancement de la fonction d'initialisation.
      init();
    });

    //Listener du bouton "Synchroniser". Lors d'un clic, la fonction défini en paramètre est exécutée.
    document.getElementById("btn_sync").addEventListener("click", function () {
      //Modification du label d'information
      document.getElementById("sync_info").textContent = "Synchronisation en cours ...";
      //Lancement de la fonction de synchronisation.
      sync();
    });

  });

  //L'action qui ci-dessous va "injecter" le code du fichier "content_script" dans l'onglet courant du navigateur
  //Ce qui est présent dans le fichier sera alors aussitot exécuté.
  //A noté que le code sera injecté à chaque fois que cette action sera appelée, soit à chaque ouverture du plugin, MEME S'IL A DEJA ETE INJECTE PRECEDEMMENT.
  chrome.tabs.executeScript({ file: 'content_script.js' });
});
/**
 * Fonction qui lance la synchronisation des adhérents ajoutés dans GestGym vers la base de donnée de l'application web
 */
function sync() {
  //Fonction qui permet d'accéder à une variable du localStorage d'une extension Google
  //Ici, nous aurons ensuite pouvoir accéder à la variable "to_sync_users" via items.to_sync_users
  //cette fonction permet de récupérer l'onglet actif. Elle renvoie un tableau. L'onglet actif sera ensuite accessible via tabs[0]
  chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, function (tabs) {
    chrome.storage.local.get(["to_sync_users"], function (items) {
      let to_sync_users = items.to_sync_users;
      //Test si les adhérents a synchroniser ne sont pas vides
      if (to_sync_users != null && to_sync_users.length > 0) {
        //Pour chaques adhérents, seul leur ID est envoyé. L'application web se chargera de faire le lien entre leur id et leur entité
        //Ici, chaque id est placé dans un tableau
        let ids = [];
        to_sync_users.forEach(element => {
          ids.push(element.id);
        });
        //Creation de l'objet qui sera envoyé au content-script
        var data = new Object();
        //La valeur associée a command correspond a l'action qui devra être effectuée lors de la recpetion du message par le content-script
        data["command"] = "sync_added";
        //La valeur associée a ids sont les ids des adhérents a synchroniser
        data["ids"] = ids;
        //Envoi un message à l'onglet spécifié au premier parametre. Le deuxième paramètre est les données expliqué précédemment.
        //Le dernier paramètre est la fonction callBack (exécutée lorsque une réponse sera renvoyée.)
        chrome.tabs.sendMessage(tabs[0].id, data, null, function (obj) {
          //si le statu de retour est "ok", l'envoi des données été fait avec succès. (mais la syncronisation est encore en cours coté application web)
          if (obj.status == "ok") {
            //Le plugin est forcé a fermer(Le message de confirmation se fera coté content-script, car impossible de savoir si la reqête s'est correctement terminée, a cause de l'AJAX. )
            window.close();
          } else {
            //Modification du label d'information
            document.getElementById("sync_info").textContent = "Impossible de synchroniser sur cette page.";
          }
        });
      } else {
        //Modification du label d'information
        document.getElementById("sync_info").textContent = "Aucun élément a synchroniser.";
      }
    });


  });
}
/**
 * Fonction qui envoi un message au content script afin qui lui renvoi la liste des adhérent à synchroniser présents sur la page d'administration du plugin
 */
function init() {
  //cette fonction permet de récupérer l'onglet actif. Elle renvoie un tableau. L'onglet actif sera ensuite accessible via tabs[0]
  chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, function (tabs) {
    //Fonction qui permet d'accéder à une variable du localStorage d'une extension Google
    //Ici, nous aurons ensuite pouvoir accéder à la variable "to_sync_users" via items.to_sync_users
    chrome.storage.local.get(["to_sync_users"], function (items) {
      //test si il n'y a aucun élément a synchroniser dans le plugin. Si il y en a, l'utilisateur doit dans un premier
      //temps synchroniser ses adhérents afin d'éviter les problèmes de synchronisation
      if (items.to_sync_users == null || items.to_sync_users.length == 0) {
        //Creation de l'objet qui sera envoyé au content-script
        var data = new Object();
        //La valeur associée a command correspond a l'action qui devra être effectuée lors de la recpetion du message par le content-script
        data["command"] = "copy_licence_holders";
        //Envoi un message à l'onglet spécifié au premier parametre. Le deuxième paramètre est les données expliqué précédemment.
        //Le dernier paramètre est la fonction callBack (exécutée lorsque une réponse sera renvoyée.)
        chrome.tabs.sendMessage(tabs[0].id, data, null, function (obj) {
          //test si l'objet en retour contient une valeur qui est un tableau. Si il n'y en a pas, l'utilsiateur n'est surement
          //pas sur la page d'administration du plugin.
          if (obj == undefined || obj.response == undefined || obj.response.length == undefined) {
            //Pas de valeur ou valeur incorrecte
            //Modification du label d'information
            document.getElementById("init_info").textContent = "Impossible de copier les données.";
          } else if (obj.response.length < 1) {
            //Dans ce cas, le nombre d'adhérent a synchroniser de 0
            //TimeOut Placebo. Demandé par le client afin qu'il est une impression de "calcul"
            setTimeout(function () {
              //la variable "to_paste_users" est mise a nul car aucun adhérent a synchroniser
              chrome.storage.local.set({ "to_paste_users": null }, null);
              //Actualisation de la valeur "last_update" qui indique la date de la dernière initialisation
              chrome.storage.local.set({ "last_update": Date.now() }, null);
              //Actualisation de tableau avec les utilisateurs prêts à etre synchronisés vers l'application web.
              displayInitUsers(null);
              //Modification du label d'information
              document.getElementById("init_info").textContent = "Il n'y a pas d'adhérents à synchroniser.";
            }, 2000);
          } else {
            //Cas ou des adhérents sont prêts à être synchronisés
            //TimeOut Placebo. Demandé par le client afin qu'il est une impression de "calcul"
            setTimeout(function () {
              //la variable "to_paste_users" est mise a jour avec les adhérents renvoyés par le content-script
              chrome.storage.local.set({ "to_paste_users": obj.response }, null);
              //Actualisation de la valeur "last_update" qui indique la date de la dernière initialisation
              chrome.storage.local.set({ "last_update": Date.now() }, null);
              //Actualisation de tableau avec les utilisateurs prêts à etre synchronisés vers l'application web.
              displayInitUsers(obj.response);
              //Actualisation de l'affichage de la dernière initialisation
              displayUpdateInitDate(new Date());
              //Modification du label d'information
              document.getElementById("init_info").textContent = "Données copiées avec succès.";
            }, 2000);
          }
        });
      } else {
        //Modification du label d'information
        document.getElementById("init_info").textContent = "Votre pile d'éléments à synchroniser doit être vide pour initialiser.";
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
    if (to_paste_user_find == null) {
      //Modification du label d'information
      document.getElementById("paste_info").textContent = "Erreur";
    } else {
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
  //Creation de l'objet qui sera envoyé au content-script
  var data = new Object();
  //La valeur associée a command correspond a l'action qui devra être effectuée lors de la recpetion du message par le content-script
  data["command"] = "paste_licence_holder";
  //La valeur associée a user est l'adhérent a copier
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
      } else {
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
/**
 * Actualise l'affichage de la dernière initialisation
 * @param {*} date 
 */
function displayUpdateInitDate(date) {
  const days = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
  const months = ["Janvier", "Fevrier", "Mars", "Avril", "Mai", "Juin", "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Décembre"];
  document.getElementById("last_update").textContent = 'Dernière initialisation : ' + days[date.getDay()] + " " + date.getDate() + " " + months[date.getMonth()] + ", " + date.getHours() + "h" + date.getMinutes();
}