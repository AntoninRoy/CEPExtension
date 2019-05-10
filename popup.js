// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
const days = ["Dimanche","Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"];
const months = ["Décembre","Janvier","Fevrier","Mars","Avril","Mai","Juin","Juillet","Aout","Septembre","Octobre","Novembre"];


document.addEventListener('DOMContentLoaded',  () => {
  chrome.storage.local.get(["last_update"], function(items){
    if(items.last_update != null){
      
      const last_update_date = new Date(items.last_update);
     
      document.getElementById("last_update").textContent = 'Dernière initialisation : '+ days[last_update_date.getDay()]+ " "+ last_update_date.getDate() +" " + months[last_update_date.getDay()]+", "+ last_update_date.getHours()+"h"+last_update_date.getMinutes();
    }else{
      document.getElementById("last_update").textContent = "Dernière initialisation : Jamais";

    }

  });

  
  chrome.storage.local.get(["users"], function(items){
    if(items.users != null){
      var select = document.getElementById("member-select");

      for (let i = 0; i < items.users.length; i++) {
        const element = items.users[i];
        select.options[select.options.length] = new Option(element.firstName + " " + element.lastName, element.id);
      }
    }
   

  });
  

  //button listener
    document.getElementById("btn_alert").addEventListener("click", function() { 
      document.getElementById("errorPaste").textContent = "Copie en cours ...";
       paste();
    });


    document.getElementById("btn_copy").addEventListener("click", function() { 
      document.getElementById("errorInit").textContent = "Initialisation en cours ...";
      copy();
    });
    //inject du javascript dans la page actuelle
    chrome.tabs.executeScript( {file: 'content_script.js'});
});


function copy() {
  chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
      var data = new Object();
      data["command"] = "copy_licence_holders";
      // request content_script to retrieve title element innerHTML from current tab
      chrome.tabs.sendMessage(tabs[0].id, data, null, function(obj) {
          if(obj == undefined|| obj.response == undefined || obj.response.length < 1 || obj.response.length ==undefined){
            document.getElementById("errorInit").textContent = "Impossible de copier les données.";
          }else{
            chrome.storage.local.set({ "users": obj.response }, null);
            chrome.storage.local.set({ "last_update": Date.now() }, null);
            var select = document.getElementById("member-select");
  
            for (let i = 0; i < obj.response.length; i++) {
              const element = obj.response[i];
              select.options[select.options.length] = new Option(element.firstName + " " + element.lastName, element.id);
            }
            const last_update_date = new Date();
            document.getElementById("last_update").textContent = 'Dernière initialisation : '+ days[last_update_date.getDay()]+ " "+ last_update_date.getDate() +" " + months[last_update_date.getDay()]+", "+ last_update_date.getHours()+"h"+last_update_date.getMinutes();
            document.getElementById("errorInit").textContent = "Données copiées avec succès.";
          }
         

          
      });
  });
}

  function paste(){
    var select = document.getElementById("member-select");
    findInUsers(select.options[select.selectedIndex].value);
}

 function findInUsers(id){
   chrome.storage.local.get(["users"], function(items){
     let flag =false;
     let user;

    for (let i = 0; i < items.users.length && !flag; i++) {
      const element = items.users[i];
      if(element.id == id){
       flag =true;
       user = element;
      }
    }

    if(!flag)
      inccorectValue("Vous devez séléctionner un adhérent ! ");
    else
      sendUser(user);
  });
}

function sendUser(user){
    //alert(items.users[0].firstName);
    var data = new Object();
    data["command"] = "paste_licence_holder";
    data["user"] = user;
    chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, data, null, function(obj) {
        document.getElementById("errorPaste").textContent = "Adhérent copié avec succès.";
      });
    });
}

function inccorectValue(error){
  document.getElementById("errorPaste").textContent = error;
}

