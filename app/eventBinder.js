"use strict";

define(function (require) {
  var $db = require("database");

  var bindClickEvent = function bindClickEvent(element, eventFunction) {
    element.addEventListener("click", function (event) {
      event.preventDefault();
      eventFunction();
    });
  };

  var bindPreformButton = function bindPreformButton() {
    var settings = $db.get("settings");
    var button = document.querySelector(".groupCalc__preFormButton");
    var $render = require("render");
    bindClickEvent(button, function () {
      $render.renderGroupForm(settings);
    });
  };

  var groupFormEvent = function groupFormEvent(button, groupForm) {

    var $alg = require("algorithm");
    var $dm = require("dataManager");
    var $render = require("render");
    bindClickEvent(button, function () {
      var data = $dm.getGroupFormDataAsArray(groupForm);
      var groupPrices = $alg.calculateGroupPrice(data);
      $render.renderGroupPrices(groupPrices);
    });
  };

  var tokenFunction = function tokenFunction() {};

  var refreshData = function refreshData() {

    var $dm = require("dataManager");
    var $render = require("render");
    var rateContainer = document.querySelector(".channelAvailability");
    var channelContainer = document.querySelector(".rates");
    $render.removeChildren(rateContainer);
    $render.removeChildren(channelContainer);
    $dm.refreshData(tokenFunction);
  };

  return {
    bindClickEvent: bindClickEvent,
    bindPreformButton: bindPreformButton,
    groupFormEvent: groupFormEvent,
    refreshData: refreshData
  };
});

//# sourceMappingURL=eventBinder.js.map