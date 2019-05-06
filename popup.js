// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

document.addEventListener('DOMContentLoaded', () => {
  //button listener
    document.getElementById("btn_connection").addEventListener("click", function() { 
      //get current tabs
      chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
      });
    });

    //inject du javascript dans la page actuelle
    chrome.tabs.executeScript( {file: 'content_script.js'});
});




