"use strict";

define(function (require) {
  var $db = require("database");
  var $make = require("make");
  var $dm = require("dataManager");

  var renderAvailability = function renderAvailability(availabilities) {

    var table = getAvailabilityTable(availabilities);
    var availabilityDiv = document.querySelector(".channelAvailability");
    availabilityDiv.appendChild(table);
  };

  var tableFromArray = function tableFromArray(table, headers) {
    $make.tableFromArray(table, headers);
  };

  var renderRates = function renderRates(rates) {

    var tableHeaders = ["date", "rates", "availbilities"];
    var rateTable = $make.tableFromArray(rates, tableHeaders);
    var rateDiv = document.querySelector(".rates");
    rateDiv.appendChild(rateTable);
  };

  var getAvailabilityTable = function getAvailabilityTable(availabilities) {

    var array = $dm.availabilityToTableFormat(availabilities);
    return $make.tableFromArray(array);
  };

  var appendInput = function appendInput(div, text, inputType, inputName, defaultValue) {

    var input = $make.input(inputType, defaultValue, null);
    var br = $make.el("br");
    var textNode = $make.txt(text);

    div.appendChild(textNode);
    div.appendChild(input);
    div.appendChild(br);
  };

  var createSubForm = function createSubForm(index, roomTypes) {

    var superDiv = $make.el("div");
    superDiv.setAttribute("class", "groupBooking booking" + index);
    appendInput(superDiv, "date for booking " + index, "date", "date" + index, "2018-1-1");
    appendInput(superDiv, "nights for booking " + index, "number", "nights" + index, 1);

    for (var key in roomTypes) {
      appendInput(superDiv, "number of " + roomTypes[key] + " rooms", "number", key + index, 1);
    }

    return superDiv;
  };

  var createForm = function createForm(numberOfSubforms, roomTypes) {

    var form = $make.el("form");
    form.setAttribute("class", "groupCalc__form");
    for (var i = 1; i <= numberOfSubforms; i++) {
      var div = createSubForm(i, roomTypes);
      div.setAttribute("class", "groupCalc__booking" + i);
      form.appendChild(div);
    }
    return form;
  };

  var renderGroupForm = function renderGroupForm(settings) {

    var $eb = require("eventBinder");
    var n = document.querySelector("#numberOfBookings").value;
    var roomTypes = $dm.getRoomTypes(settings);
    var form = createForm(n, roomTypes);
    $make.childless(document.querySelector(".groupCalc__formContainer"));
    var groupCalc = document.querySelector(".groupCalc__formContainer");
    var button = $make.el("button");
    button.setAttribute("class", "groupCalc__calculate");
    button.appendChild($make.txt("Calculate"));
    form.appendChild(button);
    groupCalc.appendChild(form);
    $eb.groupFormEvent(button, form);
  };

  var renderGroupPrices = function renderGroupPrices(prices) {

    var container = document.querySelector(".groupCalc__formContainer");
    $make.childless(container);
    var $dm = require("dataManager");
    prices.forEach(function (booking) {
      var data = $dm.objectToArrayWithHeaders(booking);
      var table = $make.tableFromArray(data.reverse());
      var container = document.querySelector(".groupCalc__formContainer");
      container = document.querySelector(".groupCalc__formContainer");
      container.appendChild(table);
    });
  };

  var renderFlatObjectFromDB = function renderFlatObjectFromDB(object, objectName, className) {
    console.log("This is coming " + objectName);
    var container = $make.el("div");
    var heading = $make.el("h2");
    var headingText = $make.txt(objectName);

    container.appendChild(heading);
    heading.appendChild(headingText);

    for (var key in object) {
      var text = key;
      text += ": ";
      text += object[key];

      var textNode = $make.txt(text);
      var input = $make.el("input");
      var div = $make.el("div");
      div.appendChild(textNode);
      div.appendChild(input);
      input.dataset.key = key;
      container.appendChild(div);
    }

    var button = $make.button("Upload changes");
    container.appendChild(button);
    var $eb = require("eventBinder");

    $eb.bindClickEvent(button, function () {
      var inputs = Array.from(container.querySelectorAll("input"));
      inputs.forEach(function (input) {
        var key = input.dataset.key;
        var value = parseInt(input.value);
        console.log(value);
        if (value) object[key] = value;
      });
      var $db = require("database");
      var settings = $db.get("settings");
      console.log(object);
      settings[objectName] = object;
      $db.uploadSettings(settings);
    });

    var close = $make.button("Close", function () {
      $make.childless(container);
    });

    container.appendChild(close);

    return container;
  };

  var roomTypeEditor = function roomTypeEditor(object, objectName) {
    var container = $make.el("div");
    var heading = $make.heading(objectName);

    var _loop = function _loop(key) {
      var ul = $make.el("ul");

      object[key].forEach(function (item) {
        $make.roomTypeListItem(item, ul);
      });
      var input = $make.input("text");
      var btn = $make.button("Add to list", function () {
        $make.roomTypeListItem(input.value, ul);
      });
      container.appendChild($make.heading(key));
      container.appendChild(ul);
    };

    for (var key in object) {
      _loop(key);
    }

    var btn = $make.button("Upload settings", function () {
      $db.uploadRoomTypes(container);
    });

    return container;
  };

  var contractEditor = function contractEditor(object, objectName) {
    var container = $make.el("div");
    var heading = $make.el("h2");
    heading.appendChild($make.txt(objectName));
    container.appendChild(heading);

    for (var key in object) {
      container.appendChild(renderFlatObjectFromDB(object[key], key));
    }
    return container;
  };

  var displaySettingsFor = function displaySettingsFor(key) {
    console.log(key);
    var settings = $db.get("settings");
    var editor = void 0;

    switch (key) {
      case "retailContract":
        editor = contractEditor(settings[key], key);break;
      case "roomTypes":
        editor = roomTypeEditor(settings[key], key);break;
      default:
        editor = renderFlatObjectFromDB(settings[key], key);
    }

    console.log(editor);

    var settingsWindow = document.querySelector(".settingsWindow");
    settingsWindow.appendChild(editor);
  };

  return {
    getAvailabilityTable: getAvailabilityTable,
    createSubForm: createSubForm,
    createForm: createForm,
    renderGroupForm: renderGroupForm,
    renderRates: renderRates,
    renderAvailability: renderAvailability,
    renderGroupPrices: renderGroupPrices,
    renderFlatObjectFromDB: renderFlatObjectFromDB,
    displaySettingsFor: displaySettingsFor
  };
});

//# sourceMappingURL=build.js.map