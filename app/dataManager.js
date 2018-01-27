"use strict";

define(function (require) {
  var $make = require("make");
  var DAY_IN_MS = 86400000;
  var $req = require("request");
  var $dh = require("dateHelper");
  var $xmlh = require("xmlHelper");
  var $db = require("database");
  var $alg = require("algorithm");

  var get = function get(key) {
    return $db.get(key);
  };

  var set = function set(key, data) {
    $db.set(key, data);
  };

  var uploadSettings = function uploadSettings(settings) {
    $db.uploadSettings(settings);
  };

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
    $db.set("requestString", string);
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

  var getAvailabilityPromise = function getAvailabilityPromise() {
    return $xmlh.getAndStoreXML($db.get("requestString"));
  };

  var xmlToTable = function xmlToTable(doc) {
    return $xmlh.xmlToTable(doc);
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
    for (var _key2 in tableObject) {
      table.push(tableObject[_key2]);
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

  var getRoomTypes = function getRoomTypes() {
    var settings = get("settings");
    var roomTypeList = settings.roomTypes;
    var array = [];
    for (var key in roomTypeList) {
      array.push(key);
    }

    return array;
  };

  var getPricesFromForm = function getPricesFromForm(groupForm) {
    var data = getGroupFormDataAsArray(groupForm);
    return $alg.calculateGroupPrice(data);
  };

  var getCalculatedCloseOuts = function getCalculatedCloseOuts() {

    var availability = $db.get("availability");
    console.log(availability);
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

  var loadSettingsFromDatabase = function loadSettingsFromDatabase(callback) {
    return $db.loadSettings(callback);
  };

  return {
    get: get,
    set: set,
    getRoomTypes: getRoomTypes,
    getDateURLrequestString: getDateURLrequestString,
    getGroupFormDataAsArray: getGroupFormDataAsArray,
    objectToArrayWithHeaders: objectToArrayWithHeaders,
    getCalculatedCloseOuts: getCalculatedCloseOuts,
    getAvailabilityPromise: getAvailabilityPromise,
    loadSettingsFromDatabase: loadSettingsFromDatabase,
    xmlToTable: xmlToTable,
    availabilityToTableFormat: availabilityToTableFormat,
    formatCloseOutsToTableFormat: formatCloseOutsToTableFormat,
    getPricesFromForm: getPricesFromForm

  };
});

//# sourceMappingURL=dataManager.js.map