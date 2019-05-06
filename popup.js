// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

var MINUTES_55 = 550 * 60 * 1000; 
var SECONDES_20 = 20 * 1000; 


document.addEventListener('DOMContentLoaded', () => {
  console.log("c'est parti");

  var connection = document.getElementById("connection");
  var connected = document.getElementById("connected");

    chrome.storage.local.get(['timespamp_connect'], function(result) {
      if(((new Date) - result.timespamp_connect) < SECONDES_20){
        connection.style.display = 'none';
        connected.style.display = 'flex';
      }
    });

    //button listener
    document.getElementById("btn_connection").addEventListener("click", function() {

        var input_login = document.getElementById("login").value;
        var input_password = document.getElementById("password").value;

        connect(input_login,input_password);

        //inject du javascript dans la page actuelle
        chrome.tabs.executeScript( {file: 'content_script.js'});
    });
  });
function connect(login,password){
  var error = document.getElementById("error");
  if(checkString(login) && checkString(password)){
    var loader = document.getElementById("loader");
    var connection = document.getElementById("connection");
    var connected = document.getElementById("connected");


    loader.style.display = 'block';      
    connection.style.display = 'none';  

    var xhr = new XMLHttpRequest();
    xhr.open("GET", chrome.extension.getURL('http://dummy.restapiexample.com/api/v1/employees'), true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        if(login.includes("1")){
          loader.style.display = 'none';  
          connected.style.display = 'flex';

          chrome.storage.local.set({ "timespamp_connect": Date.now() }, null);
          chrome.storage.local.set({ "token": Date.now() }, null);
        }else{
          loader.style.display = 'none';  
          connection.style.display = 'flex';
          error.textContent="Login ou Mot de passe incorrect.";
        }

      }
    }
    xhr.send();
  }else{
    error.textContent="Certains champs sont vides.";
  }
    
}

function checkString(text){
  if(!text)
    return false;
  if(text==="")
    return false;

  return true;
}




