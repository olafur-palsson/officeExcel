"use strict";

define(function () {

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
    getAvailabilityObjects: getAvailabilityObjectsFromSettingsArray
  };
});

//# sourceMappingURL=xmlHelper.js.map