"use strict";

define(['test'], function (test2) {
  console.log(test2.text);
})(function () {

  //string handler
  var availabilityRequestURI = "https://api.roomercloud.net/services/bookingapi/availability1?hotel=HLEI&channelCode=HOT&channelManagerCode=OWN&";
  var today = new Date();
  var dayInMs = 86400000;
  var todayPlus400days = new Date();
  todayPlus400days.setDate(todayPlus400days.getDate() + 20);

  availabilityRequestURI += "arrivalDate=" + today.getUTCFullYear() + "-" + (today.getUTCMonth() + 1) + "-" + today.getUTCDate();
  availabilityRequestURI += "&";
  availabilityRequestURI += "departureDate=" + todayPlus400days.getUTCFullYear() + "-" + (todayPlus400days.getUTCMonth() + 1) + "-" + todayPlus400days.getUTCDate();

  var availabilityXML = void 0;

  var getInventory = function getInventory(inventoryID) {
    var inventory = availabilityXML.getElementsByTagName("inventoryItem");
    var returnItem = false;
    Array.from(inventory).forEach(function (item) {
      var ID = item.getAttribute("inventoryCode");
      if (ID == inventoryID) returnItem = item;
    });

    if (!returnItem) alert("Error getting Inventory by ID: " + inventoryID);else return returnItem;
  };

  var settings = void 0;
  var rateParameters = void 0;
  var singles = void 0;
  var doubles = void 0;
  var total = void 0;

  var getSinglesObject = function getSinglesObject() {
    var singlesInventory = getInventory("SGL-S").getElementsByTagName("day");
    var singlesObject = {};
    Array.from(singlesInventory).forEach(function (day) {
      var date = day.getAttribute("date");
      var availability = day.getAttribute("availability");
      var currentRate = day.getAttribute("rate");
      singlesObject[date] = [availability, currentRate];
    });
    console.log(singlesObject);
    return singlesObject;
  };

  var getDoublesObject = function getDoublesObject() {
    console.log(settings);
    var doublesTypes = settings.roomTypes.dbl;
    var doublesInventories = [];
    doublesTypes.forEach(function (item) {
      doublesInventories.push(getInventory(item));
    });

    var doublesObject = {};

    Array.from(doublesInventories[0].getElementsByTagName("day")).forEach(function (day, i) {
      var date = day.getAttribute("date");
      doublesObject[date] = [0, 0];
    });

    doublesInventories.forEach(function (roomType, i) {
      var days = roomType.getElementsByTagName("day");
      Array.from(days).forEach(function (day) {
        var date = day.getAttribute("date");
        var availability = day.getAttribute("availability");
        var currentRate = day.getAttribute("rate");
        doublesObject[date][1] = currentRate;
        doublesObject[date][0] += parseInt(availability);
      });
    });
    console.log(doublesObject);
    return doublesObject;
  };

  var weekendValue = function weekendValue(date) {
    var weekendBonus = rateParameters.weekendWeight;
    var day = date.getDay();
    if (day == 4) return weekendBonus * 0.5;
    if (day == 6 || day == 5) return weekendBonus;
    return 0;
  };

  var seasonalValue = function seasonalValue(date) {
    var seasonalBonus = rateParameters.seasonalWeight;
    var month = date.getMonth();
    var tourists = settings.numberOfTouristsJanIs0;
    var max = 0;
    var min = Infinity;

    for (var key in tourists) {
      if (parseInt(tourists[key]) > max) max = tourists[key];
      if (parseInt(tourists[key]) < min) min = tourists[key];
    }

    var ratio = (tourists[month] - min) / (max - min);

    return ratio * seasonalBonus;
  };

  var superDayValue = function superDayValue(date) {

    var dateString = "";
    dateString += date.getDate() + ".";
    dateString += date.getMonth() + 1 + ".";
    dateString += date.getUTCFullYear();

    var superdays = settings.superDays;
    var weight = rateParameters.superDayWeight;
    for (var key in superdays) {
      console.log(key + " and " + dateString);
      if (key == dateString) return superdays[key] * weight;
    }

    return 0;
  };

  var makeTableFromArray = function makeTableFromArray(array) {
    if (array[0][0] == undefined) alert("Some function gave me not a table");
    var table = document.createElement("table");
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

  var render = function render() {
    singles = getSinglesObject();
    doubles = getDoublesObject();
    total = Object.keys(singles).map(function (key, index) {
      var s = parseInt(singles[key][0]);
      var d = parseInt(doubles[key][0]);
      return [key, s + d];
    });

    console.log("Total: " + total);

    var priceFloor = rateParameters.priceFloor;
    var absPriceFloor = rateParameters.absoluteFloor;
    var seasonalWeight = rateParameters.seasonalWeight;
    var futureWeight = rateParameters.futureWeight;
    var superDayWeight = rateParameters.superDayWeight;
    var occupancyWeight = rateParameters.occupancyWeight;
    var sellOffWeight = rateParameters.sellOff;

    var ratesCalculated = total.map(function (dateAndAvailability) {
      var dateString = dateAndAvailability[0];
      var availability = parseInt(dateAndAvailability[1]);
      var dateObject = new Date(dateString);
      var now = Date.now();
      var daysUntilDate = 1 + Math.floor((dateObject - now) / 1000 / 60 / 60 / 24);
      var month = dateObject.getMonth();
      var weekendBonus = weekendValue(dateObject);
      console.log(dateObject.getUTCFullYear());

      var seasonalBonus = seasonalValue(dateObject);
      var occupancy = availability / 47;
      var occupancyBonus = (1 - occupancy) * occupancyWeight; //
      var expectedRooms = Math.min(Math.pow(daysUntilDate / 180, 0.7), 1); //
      var futureBonus = (1 - expectedRooms) * futureWeight; //
      var lastRoomsBonus = Math.pow(1 - occupancy, 8) * occupancyWeight * 1.5; //
      var sellOffRatio = Math.min(Math.pow((187 - daysUntilDate) / 180, 6.5), 1); //
      var sellOffBonus = sellOffRatio * sellOffWeight; //
      var superDayBonus = superDayValue(dateObject);

      var rateShift = occupancyBonus - futureBonus; //
      var baseRate = priceFloor + rateShift + seasonalBonus; /* + SUPERDAY BONUS */
      var baseRatePlus = baseRate - sellOffBonus + weekendBonus + lastRoomsBonus + superDayBonus;
      var absFloorPlus = absPriceFloor + weekendBonus;

      var finalRate = Math.max(absFloorPlus, baseRatePlus);

      return [dateAndAvailability, finalRate];
    });

    var rateTable = makeTableFromArray(ratesCalculated);
    document.querySelector(".rates").appendChild(rateTable);
    showRatesAndAvailabilities();
  };

  var showRatesAndAvailabilities = function showRatesAndAvailabilities() {
    var singlesTable = Object.keys(singles).map(function (key) {
      return [key, singles[key][0], singles[key][1]];
    });

    var doublesTable = Object.keys(doubles).map(function (key) {
      return [key, doubles[key][0], doubles[key][1]];
    });

    //console.log(doublesTable)

    var tableElement = document.createElement("table");
    var tablerow = document.createElement("tr");
    var singlesText = document.createTextNode("singles");
    tablerow.appendChild(singlesText);
    singlesTable.forEach(function (item, index) {
      var tr = document.createElement("tr");
      var tdDate = document.createElement("td");
      var tdAvailabilitySgl = document.createElement("td");
      var tdRate = document.createElement("td");
      var tdAvailabilityDbl = document.createElement("td");
      var availabilityDbl = document.createTextNode(doublesTable[index][1]);
      var availabilitySgl = document.createTextNode(item[1]);
      var date = document.createTextNode(item[0]);

      tdDate.appendChild(date);
      tdAvailabilityDbl.appendChild(availabilityDbl);
      tdAvailabilitySgl.appendChild(availabilitySgl);
      tr.appendChild(tdDate);
      tr.appendChild(tdAvailabilitySgl);
      tr.appendChild(tdAvailabilityDbl);
      tableElement.appendChild(tr);
    });

    document.querySelector(".channelAvailability").appendChild(tableElement);
  };

  var loadRateParameters = function loadRateParameters() {
    var xml = new XMLHttpRequest();
    xml.open('GET', 'rateSettings.json', true);
    xml.send(null);
    xml.onreadystatechange = function () {
      if (xml.readyState === XMLHttpRequest.DONE && xml.status === 200) {
        var JSONtext = xml.responseText;
        settings = JSON.parse(JSONtext);
        rateParameters = settings.rateParameter;
        console.log(rateParameters);
        render(); //entry point: STAGE 2
      }
    };
  };(function () {
    var xml = new XMLHttpRequest();
    xml.open('GET', availabilityRequestURI, true);
    xml.send(null);
    xml.onreadystatechange = function () {
      if (xml.readyState === XMLHttpRequest.DONE && xml.status === 200) {
        var parser = new DOMParser();
        availabilityXML = parser.parseFromString(xml.responseText, "text/xml");
        console.log(availabilityXML);
        loadRateParameters(); //entry point: STAGE 1
      }
    };
  })();
})();

//# sourceMappingURL=code.js.map