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

  
  chrome.storage.local.get(["users","added"], function(items){
      update_select_list(items.users);
      displayAdded(items.added);
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

    
    document.getElementById("btn_sync").addEventListener("click", function() { 
      document.getElementById("errorSync").textContent = "Synchronisation en cours ...";
      sync();
    });

    

    //inject du javascript dans la page actuelle
    chrome.tabs.executeScript( {file: 'content_script.js'});
});

function sync(){
  chrome.storage.local.get(["added"], function(items_bis){

    let added = items_bis.added;
    let ids = [];
    
    added.forEach(element => {
      ids.push(element.id);  
    });

    chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
        var data = new Object();
        data["command"] = "sync_added";
        data["ids"] = ids;
        chrome.tabs.sendMessage(tabs[0].id, data, null, function(obj) {
          document.getElementById("errorSync").textContent = "Synchronisation terminée ...";
        });
    });

  });
}
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


            update_select_list(obj.response);

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
        if(obj.status=="ok"){
          document.getElementById("errorPaste").textContent = "Adhérent copié avec succès.";
        }
        
      });
    });
}

function inccorectValue(error){
  document.getElementById("errorPaste").textContent = error;
}

function heavyStuff(request, sender, sendResponse)
{
    sendResponse("ok")
}



function displayAdded(added){
    if(added == null || added.length < 1){
      document.getElementById("added").innerHTML = "Pas d'adhérents à synchroniser.";
    }else{
      var newAdded = added;

      var arrayHTML = "";

      newAdded.forEach(function (element) {
        arrayHTML += "<p>"+element.firstName+" "+element.lastName+"<a href ='#' data-id="+element.id+" class='delete'>Supprimer</a></p>";
        
      })


      document.getElementById("added").innerHTML=arrayHTML;
      var testElements = document.getElementsByClassName('delete');
      for(var i = 0; i < testElements.length; i++)
      {
        const item = testElements.item(i);
        
        testElements.item(i).addEventListener("click", function() { 
          chrome.storage.local.get(["added","users"], function(items_bis){
            const id = item.getAttribute("data-id");
            //copy of newAdded in newAdded_bis
            let newAdded_bis = items_bis.added.slice(0);
            let newUsers = items_bis.users.slice(0);
            for (let j = 0; j < newAdded.length; j++) {
              const element = newAdded[j];
              if(element.id == id){
                newAdded_bis.splice(j,1);
                newUsers.push(element);
              }
            }
            chrome.storage.local.set({ "added": newAdded_bis }, null);
            chrome.storage.local.set({ "users": newUsers }, null);
        
            displayAdded(newAdded_bis);
            update_select_list(newUsers);
          });
        });
      }

    }
}

function update_select_list(users){
  if(users != null){
    var select = document.getElementById("member-select");
    select.options.length=0;

    for (let i = 0; i < users.length; i++) {
      const element = users[i];
      select.options[select.options.length] = new Option(element.firstName + " " + element.lastName, element.id);
    }
  }
}