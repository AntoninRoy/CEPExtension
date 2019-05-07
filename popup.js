// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

var MINUTES_55 = 550 * 60 * 1000; 
var SECONDES_20 = 20 * 1000; 


document.addEventListener('DOMContentLoaded', () => {

  //test if user is already connected
  chrome.storage.local.get(['timespamp_connect'], function(result) {
    if(((new Date) - result.timespamp_connect) < SECONDES_20){
      showLoader();
      getMembers();
    }
  });

  //button listener connection
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
    showLoader();

    $.ajax({
      url: "http://dummy.restapiexample.com/api/v1/employees",
      type: 'GET',
      dataType: 'json',             
      contentType: "application/json",
      success: function (response) {
          if(login.includes("1")){
          
            chrome.storage.local.set({ "timespamp_connect": Date.now() }, null);
            chrome.storage.local.set({ "token": Date.now() }, null);
  
            getMembers();
            
            
          }else{
            showConnection()
            error.textContent="Login ou Mot de passe incorrect.";
          }
        }
    });
  }else{
    error.textContent="Certains champs sont vides.";
  }
    
}

function getMembers(){
  var select = document.getElementById("member-select");
  $.ajax({
    url: "http://dummy.restapiexample.com/api/v1/employees",
    type: 'GET',
    dataType: 'json',             
    contentType: "application/json",
    success: function (response) {
      if(response.erreur != null ){
      }else{
        response.forEach(function(element) {
          //users[element.id] = element;
          select.options[select.options.length] = new Option(element.employee_name, element.id);
        });
        showConnected();
      }
    }
  });
}

function showLoader(){
  hideAll();
  var loader = document.getElementById("loader");
  loader.style.display = 'block';      
}
function showConnected(){
  hideAll();
  var connected = document.getElementById("connected");
  connected.style.display = 'flex';
}

function showConnection(){
  hideAll();
  var connection = document.getElementById("connection");
  connection.style.display = 'flex';

}

function hideAll(){
  var connection = document.getElementById("connection");
  connection.style.display = 'none';

  var connected = document.getElementById("connected");
  connected.style.display = 'none';

  var loader = document.getElementById("loader");
  loader.style.display = 'none'; 
}
function checkString(text){
  if(!text)
    return false;
  if(text==="")
    return false;

  return true;
}




