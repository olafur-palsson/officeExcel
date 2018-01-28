"use strict";

define(function (require) {
  var $make = require("make");
  var $dm = require("dataManager");

  var availability = function availability(availabilities) {

    var table = getAvailabilityTable(availabilities);
    var availabilityDiv = document.querySelector(".channelAvailability");
    availabilityDiv.appendChild(table);
  };

  var tableFromArray = function tableFromArray(table, headers) {
    return $make.tableFromArray(table, headers);
  };

  var preFormButton = function preFormButton() {
    var settings = $dm.get("settings");
    return $make.button("Make Form", function () {
      groupForm(settings);
    }, "groupCalc__preFormButton");
  };

  var rates = function rates(_rates) {

    var tableHeaders = ["date", "rates", "availbilities"];
    var rateTable = $make.tableFromArray(_rates, tableHeaders);
    return rateTable;
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

  var groupFormEvent = function groupFormEvent(form) {
    var prices = $dm.getPricesFromForm(form);
    groupPrices(prices);
  };

  var groupForm = function groupForm(settings) {

    var n = document.querySelector("#numberOfBookings").value;
    var roomTypes = $dm.getRoomTypes(settings);
    var form = createForm(n, roomTypes);
    $make.childless(document.querySelector(".groupCalc__formContainer"));
    var groupCalc = document.querySelector(".groupCalc__formContainer");
    var button = $make.button("Calculate", function () {
      groupFormEvent(form);
    }, "groupCalc__calculate");
    console.trace("here");
    form.appendChild(button);
    groupCalc.appendChild(form);
  };

  var groupPrices = function groupPrices(prices) {

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

  var flatObjectFromDB = function flatObjectFromDB(object, objectName, className, sendSettings) {
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

    var button = $make.button("Upload changes", function () {
      var inputs = Array.from(container.querySelectorAll("input"));
      inputs.forEach(function (input) {

        var key = input.dataset.key;

        var value = parseInt(input.value);
        console.log(value);
        if (value) object[key] = value;
      });
      var settings = $dm.get("settings");
      console.log(object);
      if (container.classList.contains("retailContract")) settings["retailContract"][objectName] = object;else settings[objectName] = object;

      $dm.uploadSettings(settings);
    }, "settings__uploadButton");

    container.appendChild(button);

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
      ul.dataset.roomTypeClass = key;

      object[key].forEach(function (item) {
        var li = $make.roomTypeListItem(item);
        ul.appendChild(li);
      });
      var input = $make.input("text");
      var btn = $make.button("Add to list", function () {
        var li = $make.roomTypeListItem(input.value);
        ul.appendChild(li);
      });

      ul.appendChild(input);
      ul.appendChild(btn);

      container.appendChild($make.heading(key));
      container.appendChild(ul);
    };

    for (var key in object) {
      _loop(key);
    }

    var btn = $make.button("Upload settings", function () {
      $dm.uploadRoomTypes(container);
    });

    container.appendChild(btn);

    return container;
  };

  var contractEditor = function contractEditor(object, objectName) {
    var container = $make.el("div");
    var heading = $make.el("h2");
    heading.appendChild($make.txt(objectName));
    container.appendChild(heading);

    for (var key in object) {
      container.appendChild(flatObjectFromDB(object[key], key, "retailContract"));
    }
    return container;
  };

  var displaySettingsFor = function displaySettingsFor(key) {
    console.log(key);
    var settings = $dm.get("settings");
    var editor = void 0;

    switch (key) {
      case "retailContract":
        editor = contractEditor(settings[key], key);break;
      case "roomTypes":
        editor = roomTypeEditor(settings[key], key);break;
      default:
        editor = flatObjectFromDB(settings[key], key);
    }

    console.trace(editor);

    var settingsWindow = document.querySelector(".settingsWindow");
    settingsWindow.appendChild(editor);
  };

  return {
    getAvailabilityTable: getAvailabilityTable,
    createSubForm: createSubForm,
    createForm: createForm,
    groupForm: groupForm,
    rates: rates,
    availability: availability,
    groupPrices: groupPrices,
    flatObjectFromDB: flatObjectFromDB,
    displaySettingsFor: displaySettingsFor,
    tableFromArray: tableFromArray,
    preFormButton: preFormButton
  };
});

//# sourceMappingURL=render.js.map