// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

document.addEventListener('DOMContentLoaded', () => {
  //button listener
    document.getElementById("btn_alert").addEventListener("click", function() { 
      //get current tabs
      paste();
    });


    document.getElementById("btn_copy").addEventListener("click", function() { 
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
         // alert("copy_licence_holders: "+ obj.response);
          
          chrome.storage.sync.set({ "users": obj.response }, function(){
          
          });
      });
  });
}

function paste(){
  chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
    chrome.storage.sync.get(/* String or Array */["users"], function(items){

      alert(items.users);
      
    });
  
  });
}

