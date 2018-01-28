"use strict";

define(function (require) {
  var $dm = require("dataManager");
  var $render = require("render");
  var $make = require("make");

  var getCloseOutArrayAndRender = function getCloseOutArrayAndRender() {
    var closeOuts = $dm.getCalculatedCloseOuts();
    var closeOutTable = $dm.formatCloseOutsToTableFormat(closeOuts);
    var table = $render.tableFromArray(closeOutTable, ["date", "sgl", "dbl"]);
    var container = document.querySelector(".closeOuts");
    container.appendChild(table);
  };

  var refreshData = function refreshData(isFromButton) {
    $dm.loadSettingsFromDatabase(function () {
      ;
    });
    console.log(isFromButton);
    var requestString = $dm.getDateURLrequestString(isFromButton);

    $dm.getAvailabilityPromise(isFromButton).then(function (doc) {
      var table = $dm.xmlToTable(doc);
      var rateDiv = $render.rates(table.rates);
      document.querySelector(".rates").appendChild(rateDiv);
      $render.availability(table.availability);
      getCloseOutArrayAndRender();
    });
  };

  var bindRefreshDataButton = function bindRefreshDataButton() {
    var btn = document.querySelector(".refreshData");
    $make.clickable(btn, function () {
      console.log("right here");
      refreshData("huetnoashuenaoa");
    });
  };

  var initializeGroupForm = function initializeGroupForm() {
    var button = $render.preFormButton();
    console.log();
    var form = document.querySelector(".groupCalc__preForm");
    form.appendChild(button);
    console.log(button);
  };

  var bindContainerToggles = function bindContainerToggles() {
    var buttons = Array.from(document.querySelectorAll(".container__toggle"));
    buttons.forEach(function (button) {
      var container = button.parentElement.querySelector("div");
      $make.clickable(button, function () {
        container.classList.toggle("displayNone");
      });
      console.log(container);
    });
  };

  var initializeSettings = function initializeSettings() {
    var win = $render.settingsWindow();
    var toggleButton = document.querySelector(".navbar__settings__img");
    $make.clickable(toggleButton, function () {
      win.classList.toggle("displayNone");
    });
  };

  return {
    refreshData: refreshData,
    initializeGroupForm: initializeGroupForm,
    bindRefreshDataButton: bindRefreshDataButton,
    bindContainerToggles: bindContainerToggles,
    initializeSettings: initializeSettings
  };
});

//# sourceMappingURL=procedures.js.map