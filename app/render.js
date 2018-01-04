"use strict";

define(function (require) {

  var removeChildren = function removeChildren(node) {
    var clone = node.cloneNode(false);
    node.parentNode.replaceChild(clone, node);
  };

  var makeTableFromArray = function makeTableFromArray(array, theaders) {
    var table = document.createElement("table");
    if (theaders != undefined) {
      var headerRow = document.createElement("tr");
      theaders.forEach(function (text) {
        var textNode = document.createTextNode(text);
        var td = document.createElement("td");
        td.appendChild(textNode);
        headerRow.appendChild(td);
        table.appendChild(headerRow);
      });
    }

    console.log(array);

    if (array[0][0] == undefined) alert("Some function gave me not a table");
    array.forEach(function (key) {
      var tr = document.createElement("tr");
      key.forEach(function (item) {
        var td = document.createElement("td");
        var txt = document.createTextNode(item);
        td.appendChild(txt);
        tr.appendChild(td);
      });
      table.appendChild(tr);
    });
    return table;
  };

  var renderAvailability = function renderAvailability(availabilities) {
    var table = getAvailabilityTable(availabilities);
    var availabilityDiv = document.querySelector(".channelAvailability");
    availabilityDiv.appendChild(table);
  };

  var renderRates = function renderRates(rates) {
    var tableHeaders = ["date", "rates", "availbilities"];
    var rateTable = makeTableFromArray(rates, tableHeaders);
    var rateDiv = document.querySelector(".rates");
    rateDiv.appendChild(rateTable);
  };

  var availabilityToTableFormat = function availabilityToTableFormat(object) {
    var array = [["date"]];
    var compressedObject = {};
    for (var key in object) {
      array[0].push(key);
      for (var date in object[key]) {
        compressedObject[date] = [];
      }
    }

    for (var _key in object) {
      for (var _date in object[_key]) {
        compressedObject[_date].push(object[_key][_date][0]);
      }
    }

    var _loop = function _loop(_date2) {
      var subarray = [_date2];
      compressedObject[_date2].forEach(function (text) {
        subarray.push(text);
      });
      array.push(subarray);
    };

    for (var _date2 in compressedObject) {
      _loop(_date2);
    }

    return array;
  };

  var getAvailabilityTable = function getAvailabilityTable(availabilities) {
    var array = availabilityToTableFormat(availabilities);
    console.log(array);
    return makeTableFromArray(array);
  };

  var appendInput = function appendInput(div, text, inputType, inputName) {
    var input = document.createElement("input");
    var br = document.createElement("br");
    var textNode = document.createTextNode(text);

    input.setAttribute("name", inputName);
    input.setAttribute("type", inputType);
    div.appendChild(textNode);
    div.appendChild(input);
    div.appendChild(br);
  };

  var createSubForm = function createSubForm(index, roomTypes) {
    var superDiv = document.createElement("div");
    superDiv.setAttribute("class", "groupBooking booking" + index);
    appendInput(superDiv, "date for booking " + index, "date", "date" + index);
    appendInput(superDiv, "nights for booking " + index, "number", "nights" + index);

    for (var key in roomTypes) {
      appendInput(superDiv, "number of " + roomTypes[key] + " rooms", "number", key + index);
    }

    return superDiv;
  };

  var createForm = function createForm(numberOfSubforms, roomTypes) {
    var form = document.createElement("form");
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
    var $xmlh = require("xmlHelper");
    var $dh = require("dataHelper");
    var n = document.querySelector("#numberOfBookings").value;
    var roomTypes = $dh.getRoomTypes(settings);
    var form = createForm(n, roomTypes);
    removeChildren(document.querySelector(".groupCalc__formContainer"));
    var groupCalc = document.querySelector(".groupCalc__formContainer");
    var button = document.createElement("button");
    button.setAttribute("class", "groupCalc__calculate");
    button.appendChild(document.createTextNode("Calculate"));
    form.appendChild(button);
    groupCalc.appendChild(form);
    $eb.groupFormEvent(button, form);
  };

  return {
    makeTableFromArray: makeTableFromArray,
    availabilityToTableFormat: availabilityToTableFormat,
    getAvailabilityTable: getAvailabilityTable,
    createSubForm: createSubForm,
    createForm: createForm,
    renderGroupForm: renderGroupForm,
    renderRates: renderRates,
    renderAvailability: renderAvailability,
    removeChildren: removeChildren
  };
});

//# sourceMappingURL=render.js.map