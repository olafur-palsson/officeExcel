"use strict";

define(function (require) {
  var render = require("render");

  var settings = void 0;
  var rateParameters = void 0;

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
      if (key == dateString) return superdays[key] * weight;
    }

    return 0;
  };

  var getRates = function getRates(availabilityInput) {

    var totalObj = {};
    for (var roomClass in availabilityInput) {
      for (var day in availabilityInput[roomClass]) {
        if (totalObj[day] == undefined) totalObj[day] = 0;
        totalObj[day] += parseInt(availabilityInput[roomClass][day]);
      }
    }

    console.log(availabilityInput);

    var settingsString = window.localStorage.getItem("settings");
    settings = JSON.parse(settingsString);
    rateParameters = settings.rateParameter;

    var priceFloor = rateParameters.priceFloor;
    var absPriceFloor = rateParameters.absoluteFloor;
    var seasonalWeight = rateParameters.seasonalWeight;
    var futureWeight = rateParameters.futureWeight;
    var superDayWeight = rateParameters.superDayWeight;
    var occupancyWeight = rateParameters.occupancyWeight;
    var sellOffWeight = rateParameters.sellOff;

    var total = [];
    var i = 0;
    for (var _day in totalObj) {
      total[i] = [_day, totalObj[_day]];
      i++;
    }

    console.log(total);

    var ratesCalculated = total.map(function (dateAndAvailability) {
      var dateString = dateAndAvailability[0];
      var availability = parseInt(dateAndAvailability[1]);
      var dateObject = new Date(dateString);
      var now = Date.now();
      var daysUntilDate = 1 + Math.floor((dateObject - now) / 1000 / 60 / 60 / 24);
      var month = dateObject.getMonth();
      var weekendBonus = weekendValue(dateObject);

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

      return [dateString, finalRate, availability];
    });

    return ratesCalculated;
  };

  var groupCalculator = function groupCalculator(settingsInput, rates, availability) {
    console.log("Hahahahaha");
  };

  return { getRates: getRates };
});

//# sourceMappingURL=algorithm.js.map