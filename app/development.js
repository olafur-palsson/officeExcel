"use strict";

define(function (require) {

  var $render = require("render");
  var $eb = require("eventBinder");
  var $req = require("request");
  var $db = require("database");
  var $make = require("make");
  var $fb = firebase.firestore();

  var test = function test() {
    console.log("stuff");
    var settings = $db.get("settings");
    var string = "rateParameter";

    var _rp = settings[string];
    var stuff = $render.renderFlatObjectFromDB(_rp, string);
    document.querySelector(".settingsWindow").appendChild(stuff);
    console.log(stuff);
  };

  var makeWindow = function makeWindow() {
    var div = document.createElement("div");
    var button = document.createElement("button");
    var btnText = document.createTextNode("upload Settings");

    var draggyPlace = document.createElement("div");
    draggyPlace.style.backgroundColor = "#222";
    draggyPlace.style.height = "25%";
    draggyPlace.style.width = "100%";
    draggyPlace.classList.add("draggyPlace");

    div.classList.add("settingsWindow");
    div.style.backgroundColor = "black";
    div.appendChild(draggyPlace);
    div.appendChild(button);
    button.appendChild(btnText);

    $make.clickable(button, $db.uploadSettings);

    var button2 = document.createElement("button");
    var btn2txt = document.createTextNode("Test Function");
    button2.appendChild(btn2txt);
    div.appendChild(button2);
    $make.clickable(button2, test);

    return div;
  };

  var renderDevWindow = function renderDevWindow() {
    var $render = require("render");
    console.log($render);
    var win = makeWindow();
    $make.draggable(win);
    document.querySelector("body").appendChild(win);
    win.appendChild($make.settingsList($db.get("settings"), $render.displaySettingsFor));
  };

  return {
    renderDevWindow: renderDevWindow,
    test: test
  };
});

//# sourceMappingURL=development.js.map