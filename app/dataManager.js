"use strict";

define(function (require) {
  var DAY_IN_MS = 86400000;
  var $req = require("request");
  var $xmlh = require("xmlHelper");
  var $db = require("database");
  var $render = require("render");

  var getDateURLrequestString = function getDateURLrequestString() {

    var URLSettings = $db.get("settings").requestAvailability;
    var string = URLSettings["URL"];
    var n = URLSettings["days"];
    var today = new Date();
    var nDaysInAdvance = new Date();

    nDaysInAdvance.setDate(nDaysInAdvance.getDate() + n);
    string += "arrivalDate=" + today.getUTCFullYear() + "-" + (today.getUTCMonth() + 1) + "-" + today.getUTCDate();
    string += "&";
    string += "departureDate=" + nDaysInAdvance.getUTCFullYear() + "-" + (nDaysInAdvance.getUTCMonth() + 1) + "-" + nDaysInAdvance.getUTCDate();

    return string;
  };

  var objectToArrayWithHeaders = function objectToArrayWithHeaders(object) {

    var data = [];
    for (var key in object) {
      var element = [key, object[key]];
      data.push(element);
    }
    return data;
  };

  var stringToDate = function stringToDate(dateString) {

    var array = dateString.split("-");
    var y = array[0];
    var m = parseInt(array[1]) + 1;
    var d = array[2];
    var date = new Date(y, m, d);

    return date;
  };

  var dateToString = function dateToString(dateObject) {
    var y = dateObject.getUTCFullYear();
    var m = formatNumber(dateObject.getUTCMonth() - 1);
    var d = formatNumber(dateObject.getUTCDate());
    var dateArray = [y, m, d];
    return dateArray.join("-");
  };

  var formatNumber = function formatNumber(number) {
    var string = "" + number;
    if (number < 10) string = "0" + string;
    return string;
  };

  var daysBetweenDatesStringFormat = function daysBetweenDatesStringFormat(date1, date2) {
    var bookingDate = stringToDate(date1);
    var contractDate = stringToDate(date2);
    var difference = bookingDate - contractDate;
    return difference;
  };

  var addOneDayToDateWithHyphens = function addOneDayToDateWithHyphens(dateString) {
    var date = stringToDate(dateString);
    date = date.setDate(date.getDate() + 1);
    date = new Date(date);
    date = dateToString(date);
    return date;
  };

  var getGroupFormDataAsArray = function getGroupFormDataAsArray(form) {

    var divs = Array.from(form.querySelectorAll("div"));
    var data = [];
    divs.forEach(function (div) {
      var subArray = [];
      var inputs = Array.from(div.querySelectorAll("input"));
      inputs.forEach(function (input) {
        subArray.push(input.value);
      });
      data.push(subArray);
    });

    return data;
  };

  var getRoomTypes = function getRoomTypes() {

    var settingsString = window.localStorage.getItem("settings");
    var settings = JSON.parse(settingsString);
    var roomTypeList = settings.roomTypes;
    var array = [];
    for (var key in roomTypeList) {
      array.push(key);
    }

    return array;
  };

  var storeAvailability = function storeAvailability(availability) {

    var roomTypes = getRoomTypes();
    var storage = {};
    storage["total"] = {};
    roomTypes.forEach(function (type) {
      storage[type] = {};
    });

    for (var type in availability) {
      for (var day in availability[type]) {
        storage[type][day] = availability[type][day][0];
        if (storage["total"][day] == undefined) storage["total"][day] = 0;
        storage["total"][day] += availability[type][day][0];
      }
    }
    var storageJSON = JSON.stringify(storage);
    window.localStorage.setItem("availability", storageJSON);
    var ref = firebase.firestore().doc("leifur/availability");
    ref.set(storage);
  };

  var refreshData = function refreshData() {

    var requestString = getDateURLrequestString();
    var xmlPromise = $xmlh.getAndStoreXML(requestString);
    xmlPromise.then(function (doc) {
      var table = $xmlh.xmlToTable(doc);
      $render.renderRates(table.rates);
      $render.renderAvailability(table.availability);
    });
  };

  var getMinimumRoomsSupposedToBeAvailable = function getMinimumRoomsSupposedToBeAvailable() {

    var settings = $db.get("settings");
    var roomQuantities = settings.totalNumberOfRooms;
    var closeOutFloor = settings.closeOut.floor;
    var minimum = settings.closeOut.minimum;
    var total = roomQuantities.total;
    var returnObject = {};
    for (var key in roomQuantities) {
      if (key == "total") continue;
      var minimumAmountFromRatio = Math.ceil(roomQuantities[key] / total * closeOutFloor);
      if (minimumAmountFromRatio > minimum) {
        returnObject[key] = minimumAmountFromRatio;
      } else {
        returnObject[key] = minimum;
      }
    }

    return returnObject;
  };

  // this is the worst code in the whole application, if you have a better idea
  // that makes it more readable, then by all means, please rewrite
  // if you're just going to reduce it by two for-loops then seriously
  // you need to rethink what good code looks like
  var formatCloseOutsToTableFormat = function formatCloseOutsToTableFormat(object) {
    var tableObject = {};
    //make an object with dates and close-outs
    for (var key in object) {
      for (var day in object[key]) {
        tableObject[day] = [day];
      }break;
    }

    //finish making the object with date and close-outs
    for (var roomType in object) {
      for (var _day in object[roomType]) {
        tableObject[_day].push(object[roomType][_day]);
      }
    } //convert the object to a format that makeTableFromArray can use
    var table = [];
    for (var _key in tableObject) {
      table.push(tableObject[_key]);
    }

    return table;
  };

  var shouldBeOpen = function shouldBeOpen(roomType, day, n) {
    var minimums = getMinimumRoomsSupposedToBeAvailable();
    var min = minimums[roomType];
    if (min >= n) return "Closed"; //"false by availability"

    var $alg = require("algorithm");
    var algorithmPrice = $alg.calculateDay([day, n])[1];
    var contractPrice = $alg.calculateContractDay([day, n])[1];
    var comparisonPrice = algorithmPrice * 0.85 - 20;
    if (comparisonPrice > contractPrice) return "Closed"; //"false by price"

    return "Open";
  };

  var getCalculatedCloseOuts = function getCalculatedCloseOuts() {

    var availability = $db.get("availability");
    var returnObject = {};
    for (var roomType in availability) {
      if (roomType == "total") continue;
      returnObject[roomType] = {};
      for (var day in availability[roomType]) {
        var n = availability[roomType][day];
        returnObject[roomType][day] = shouldBeOpen(roomType, day, n);
      }
    }

    return returnObject;
  };

  var getCloseOutArrayAndRender = function getCloseOutArrayAndRender() {
    var closeOuts = getCalculatedCloseOuts();
    var closeOutTable = formatCloseOutsToTableFormat(closeOuts);
    var table = $render.makeTableFromArray(closeOutTable, ["date", "sgl", "dbl"]);
    var container = document.querySelector(".closeOuts");
    container.appendChild(table);
  };

  return {
    getDateURLrequestString: getDateURLrequestString,
    getGroupFormDataAsArray: getGroupFormDataAsArray,
    refreshData: refreshData,
    getRoomTypes: getRoomTypes,
    addOneDayToDateWithHyphens: addOneDayToDateWithHyphens,
    dateToString: dateToString,
    stringToDate: stringToDate,
    daysBetweenDatesStringFormat: daysBetweenDatesStringFormat,
    objectToArrayWithHeaders: objectToArrayWithHeaders,
    getCalculatedCloseOuts: getCalculatedCloseOuts,
    getCloseOutArrayAndRender: getCloseOutArrayAndRender
  };
});

//# sourceMappingURL=dataManager.js.map