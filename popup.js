// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
const days = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
const months = ["Décembre", "Janvier", "Fevrier", "Mars", "Avril", "Mai", "Juin", "Juillet", "Aout", "Septembre", "Octobre", "Novembre"];


document.addEventListener('DOMContentLoaded', () => {
  $('#example').DataTable({
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
  
  chrome.storage.local.get(["users", "added","last_update"], function (items) {
    update_select_list(items.users);
    displayAdded(items.added);

    if (items.last_update != null) {
      const last_update_date = new Date(items.last_update);
      document.getElementById("last_update").textContent = 'Dernière initialisation : ' + days[last_update_date.getDay()] + " " + last_update_date.getDate() + " " + months[last_update_date.getDay()] + ", " + last_update_date.getHours() + "h" + last_update_date.getMinutes();
    } else {
      document.getElementById("last_update").textContent = "Dernière initialisation : Jamais";
    }

    $('table#example tbody').on('click', '.btn_paste_bis', function (event) {
      document.getElementById("errorPaste").textContent = "Copie en cours ...";
      paste(event.currentTarget.id);
    });

    $('table#example tbody').on('click', '.btn_toAdded', function (event) {
      //Récupeartion de l'id de l'adhérent ou le bouton a été déclenché
      const id = event.currentTarget.id;

      //Recuperation dans le storage local des adhérents initialisés "users" et des adhérents à synchroniser "added "
      chrome.storage.local.get(["added", "users"], function (items_bis) {
        var added = items_bis.added;
        var users = items_bis.users;

        //Recherche de l'adhérent dans la liste "users"
        for (let j = 0; j < users.length; j++) {
          const element = users[j];
          if (element.id == id) {
            //On le retire de la liste "users"
            users.splice(j, 1);
            //Et on l'ajoute dans les "added"
            added.push(element);
          }
        }

        chrome.storage.local.set({ "added": added }, null);
        chrome.storage.local.set({ "users": users }, null);

        displayAdded(added);
        update_select_list(users);
      });
    });

    $('table#toSync tbody').on('click', '.btn_return', function (event) {

      //Récupeartion de l'id de l'adhérent ou le bouton a été déclenché
      const id = event.currentTarget.id;

      //Recuperation dans le storage local des adhérents initialisés "users" et des adhérents à synchroniser "added "
      chrome.storage.local.get(["added", "users"], function (items_bis) {
        var added = items_bis.added;
        var users = items_bis.users;

        //Recherche de l'adhérent dans la liste "added"
        for (let j = 0; j < added.length; j++) {
          const element = added[j];
          if (element.id == id) {
            //On le retire de la liste "added"
            added.splice(j, 1);
            //Et on l'ajoute dans les "users"
            users.push(element);
          }
        }

        chrome.storage.local.set({ "added": added }, null);
        chrome.storage.local.set({ "users": users }, null);

        displayAdded(added);
        update_select_list(users);
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
              chrome.storage.local.set({ "users": obj.response }, null);
              chrome.storage.local.set({ "last_update": Date.now() }, null);


              update_select_list(obj.response);

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

function paste(id) {
  chrome.storage.local.get(["users"], function (items) {
    let flag = false;
    let user;

    for (let i = 0; i < items.users.length && !flag; i++) {
      const element = items.users[i];
      if (element.id == id) {
        flag = true;
        user = element;
      }
    }

    if (!flag)
      document.getElementById("errorPaste").textContent = "Erreur";
    else
      sendUser(user);
  });

}

function sendUser(user) {
  //alert(items.users[0].firstName);
  var data = new Object();
  data["command"] = "paste_licence_holder";
  data["user"] = user;
  chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, data, null, function (obj) {
      if (obj.status == "ok") {
        document.getElementById("errorPaste").textContent = "Adhérent copié avec succès.";
      }

    });
  });
}


function displayAdded(added) {
  $('#toSync').DataTable().clear().draw();
  if (added == null || added.length < 1) {

  } else {
    added.forEach(function (element) {
      $('#toSync').DataTable().row.add([
        element.firstName + " " + element.lastName,
        '<button id="' + element.id + '" class="btn_return">Remettre dans la liste a copier</button>',

      ]).draw(false);
    })
  }
}

function update_select_list(users) {
  if (users != null) {
    $('#example').DataTable().clear().draw();

    for (let i = 0; i < users.length; i++) {
      var element = users[i];
      $('#example').DataTable().row.add([
        element.firstName + " " + element.lastName,
        '<button id="' + element.id + '" class="btn_paste_bis">Coller dans le formulaire</button>',
        '<button id="' + element.id + '" class="btn_toAdded">Ajouter aux synchronisés</button>'

      ]).draw(false);

    }
  }
}