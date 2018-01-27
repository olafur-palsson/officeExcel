"use strict";

define(function (require) {
  var $db = require("database");
  var $dh = require("dateHelper");
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

  var calculateDay = function calculateDay(dateAndAvailability) {

    settings = $db.get("settings");
    rateParameters = settings.rateParameter;
    var _rP = rateParameters;

    var dateString = dateAndAvailability[0];
    var availability = parseInt(dateAndAvailability[1]);
    var dateObject = new Date(dateString);
    var now = Date.now();

    var daysUntilDate = 1 + Math.floor((dateObject - now) / 1000 / 60 / 60 / 24);
    var expectedRooms = Math.min(Math.pow(daysUntilDate / 180, 0.7), 1); //
    var weekendBonus = weekendValue(dateObject);
    var seasonalBonus = seasonalValue(dateObject);
    var occupancy = availability / 47;
    var occupancyBonus = (1 - occupancy) * _rP.occupancyWeight; //
    var futureBonus = (1 - expectedRooms) * _rP.futureWeight; //
    var lastRoomsBonus = Math.pow(1 - occupancy, 8) * _rP.occupancyWeight * 1.5; //
    var sellOffRatio = Math.min(Math.pow((187 - daysUntilDate) / 180, 6.5), 1); //
    var sellOffDisc = sellOffRatio * _rP.sellOff; //
    var superDayBonus = superDayValue(dateObject); //

    //Self explanatory
    var rateShift = occupancyBonus - futureBonus;
    //Basic Rate
    var algorithmRate = _rP.priceFloor + rateShift + seasonalBonus;
    //Add modifiers for weekends, newYears and other high demand days
    algorithmRate += weekendBonus + superDayBonus;
    //Add edge cases in case of surplus or shortage
    algorithmRate += lastRoomsBonus - sellOffDisc;
    //Lowest price a room should be sold at
    var absFloorPlus = _rP.absoluteFloor + weekendBonus;
    //Compare lowest rate vs algorithm
    var finalRate = Math.max(absFloorPlus, algorithmRate);

    return [dateString, finalRate, availability];
  };

  var getRates = function getRates(availabilityInput) {

    var totalObj = {};
    for (var roomClass in availabilityInput) {
      for (var day in availabilityInput[roomClass]) {
        if (totalObj[day] == undefined) totalObj[day] = 0;
        totalObj[day] += parseInt(availabilityInput[roomClass][day]);
      }
    }

    settings = $db.get("settings");
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
    var ratesCalculated = total.map(function (dateAndAvailability) {
      return calculateDay(dateAndAvailability);
    });

    return ratesCalculated;
  };

  var calculateContractDay = function calculateContractDay(dateAndAvailability) {
    var contract = $db.get("settings").retailContract;
    var $dm = require("dataManager");
    var date = dateAndAvailability[0];
    var availability = dateAndAvailability[1];

    var minimum = Infinity;
    var applicableDate = void 0;
    for (var key in contract) {
      var difference = $dh.daysBetweenDatesStringFormat(date, key);
      if (difference < minimum && difference > 0) {
        minimum = difference;
        applicableDate = key;
      }
    }
    var applicableRate = contract[applicableDate]['dbl'];

    return [date, applicableRate];
  };

  var calculateContractPrices = function calculateContractPrices(bookings) {
    console.log("contracts");
    return calculateBooking(bookings, calculateContractDay);
  };

  var calculateAlgorithmPrices = function calculateAlgorithmPrices(bookings) {
    console.log("algorithm");
    return calculateBooking(bookings, calculateDay);
  };

  var calculateBooking = function calculateBooking(bookings, calculator) {

    var $dm = require("dataManager");
    var prices = [];

    bookings.forEach(function (booking, index) {
      var $dm = require("dataManager");
      var sum = 0;
      var date = booking[0];
      var nights = booking[1];
      var bookingInfo = {};

      for (var i = 0; i < booking[1]; i++) {
        console.log(date);
        var availability = $db.getAvailabilityForDate("total", date);
        if (availability == undefined) {
          $db.createError("Most likely wrong date in the booking. Please check.");
        }
        console.log(availability);
        var rate = calculator([date, availability])[1];
        console.log(rate);
        date = $dh.addOneDayToDateWithHyphens(date);
        sum += rate;
      }

      bookingInfo["rate"] = sum / nights;
      bookingInfo["total"] = sum;
      bookingInfo["name"] = "Booking " + (index + 1);

      prices.push(bookingInfo);
    });

    return prices;
  };

  var calculateGroupPrice = function calculateGroupPrice(bookings) {

    var algorithmBookings = calculateAlgorithmPrices(bookings);
    var contractBookings = calculateContractPrices(bookings);

    var finalGroupPrices = algorithmBookings;
    contractBookings.forEach(function (booking, index) {
      if (booking["rate"] > algorithmBookings[index]["rate"]) finalGroupPrices[index] = booking;
    });
    return finalGroupPrices;
  };

  return {
    getRates: getRates,
    calculateGroupPrice: calculateGroupPrice,
    calculateContractPrices: calculateContractPrices,
    calculateAlgorithmPrices: calculateAlgorithmPrices,
    calculateDay: calculateDay,
    calculateContractDay: calculateContractDay
  };
});

//# sourceMappingURL=algorithm.js.map