"use strict";

define(function (require) {
  var $req = require("request");
  var $render = require("render");
  var $db = require("database");
  var settings = $db.get("settings");

  var stringifyXML = function stringifyXML(xml) {
    var strigifier = new XMLSerializer();
    return strigifier.serializeToString(xml);
  };

  var xmlToTable = function xmlToTable(xmlDocument) {
    var $alg = require("algorithm");
    console.log(xmlDocument);
    var availability = getAvailabilityObjectsFromSettingsArray(xmlDocument, settings.roomTypes);
    $db.storeAvailability(availability);
    console.log($alg);
    var rates = $alg.getRates(availability);
    return {
      rates: rates,
      availability: availability
    };
  };

  var getAndStoreXML = function getAndStoreXML(url) {
    return new Promise(function (resolve, reject) {
      $req.fromURL(url, "DOM").then(function (xmlDocument) {
        var xmlString = stringifyXML(xmlDocument);
        $db.set("rawXML", xmlString);
        console.log(xmlDocument);
        resolve(xmlDocument);
      });
    });
  };

  var getInventoryFromID = function getInventoryFromID(xml, inventoryID) {

    var inventory = xml.getElementsByTagName("inventoryItem");
    var returnItem = false;
    Array.from(inventory).forEach(function (item) {
      var ID = item.getAttribute("inventoryCode");
      if (ID == inventoryID) returnItem = item;
    });

    if (!returnItem) alert("Error getting Inventory by ID: " + inventoryID);else return returnItem;
  };

  var getAvailabilityObjectsFromSettingsArray = function getAvailabilityObjectsFromSettingsArray(xml, objectWithArraysOfRoomTypes) {

    console.log(xml);
    var returnObject = {};
    var prototypeWithDates = {};
    for (var roomClass in objectWithArraysOfRoomTypes) {
      var array = objectWithArraysOfRoomTypes[roomClass];
      if (array.length == 0) {
        alert("roomClass was empty");
        break;
      }
      var inventory = Array.from(getInventoryFromID(xml, array[0]).getElementsByTagName("day"));
      inventory.forEach(function (day) {
        var date = day.getAttribute("date");
        prototypeWithDates[date] = [0, 0];
      });
    }

    var _loop = function _loop(_roomClass) {
      console.log(_roomClass);
      returnObject[_roomClass] = {};
      for (var key in prototypeWithDates) {
        returnObject[_roomClass][key] = [0, 0];
      }objectWithArraysOfRoomTypes[_roomClass].forEach(function (roomType) {
        var inventory = Array.from(getInventoryFromID(xml, roomType).getElementsByTagName("day"));
        inventory.forEach(function (day) {
          var date = day.getAttribute("date");
          var availability = day.getAttribute("availability");
          var currentRate = day.getAttribute("rate");
          returnObject[_roomClass][date][1] = currentRate;
          returnObject[_roomClass][date][0] += parseInt(availability);
        });
      });
    };

    for (var _roomClass in objectWithArraysOfRoomTypes) {
      _loop(_roomClass);
    }

    return returnObject;
  };

  return {
    getInventory: getInventoryFromID,
    getAvailabilityObjects: getAvailabilityObjectsFromSettingsArray,
    getAndStoreXML: getAndStoreXML,
    stringifyXML: stringifyXML,
    xmlToTable: xmlToTable
  };
});

//# sourceMappingURL=xmlHelper.js.map