"use strict";

define(function (require) {
  var $dm = require("dataManager");
  var $render = require("render");

  var getCloseOutArrayAndRender = function getCloseOutArrayAndRender() {
    var closeOuts = $dm.getCalculatedCloseOuts();
    var closeOutTable = $dm.formatCloseOutsToTableFormat(closeOuts);
    var table = $render.tableFromArray(closeOutTable, ["date", "sgl", "dbl"]);
    var container = document.querySelector(".closeOuts");
    container.appendChild(table);
  };

  var refreshData = function refreshData() {
    $dm.loadSettingsFromDatabase(getCloseOutArrayAndRender);

    var requestString = $dm.getDateURLrequestString();

    $dm.getAvailabilityPromise().then(function (doc) {
      var table = $dm.xmlToTable(doc);
      var rateDiv = $render.rates(table.rates);
      document.querySelector(".rates").appendChild(rateDiv);
      $render.availability(table.availability);
    });
  };

  var initializeGroupForm = function initializeGroupForm() {
    var button = $render.preFormButton();
    console.log();
    var form = document.querySelector(".groupCalc__preForm");
    form.appendChild(button);
    console.log(button);
  };

  return {
    refreshData: refreshData,
    initializeGroupForm: initializeGroupForm
  };
});

//# sourceMappingURL=procedures.js.map