"use strict";

define(function (require) {

  var bindClickEvent = function bindClickEvent(element, eventFunction) {
    element.addEventListener("click", function (event) {
      event.preventDefault();
      eventFunction();
    });
  };

  var bindPreformButton = function bindPreformButton() {
    console.log("htueta");
    var $dh = require("dataHelper");
    var settings = $dh.getSettings();
    var button = document.querySelector(".groupCalc__preFormButton");
    var $render = require("render");
    bindClickEvent(button, function () {
      $render.renderGroupForm(settings);
    });
  };

  var groupFormEvent = function groupFormEvent(button, groupForm) {
    var $dh = require("dataHelper");
    bindClickEvent(button, function () {
      console.log($dh);
      var data = $dh.getGroupFormDataAsArray(groupForm);
      console.log(data);
    });
  };

  var tokenFunction = function tokenFunction() {
    console.log("hahaha");
  };

  var refreshData = function refreshData() {
    var $dh = require("dataHelper");
    var $render = require("render");
    var rateContainer = document.querySelector(".channelAvailability");
    var channelContainer = document.querySelector(".rates");
    $render.removeChildren(rateContainer);
    $render.removeChildren(channelContainer);
    $dh.refreshData(tokenFunction);
  };

  return {
    bindClickEvent: bindClickEvent,
    bindPreformButton: bindPreformButton,
    groupFormEvent: groupFormEvent,
    refreshData: refreshData
  };
});

//# sourceMappingURL=eventBinder.js.map