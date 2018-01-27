"use strict";

define(function () {

  var stringToDate = function stringToDate(dateString) {

    var array = dateString.split("-");
    var y = array[0];
    var m = parseInt(array[1]) + 1;
    var d = array[2];
    var date = new Date(y, m, d);

    return date;
  };

  var formatNumber = function formatNumber(number) {
    var string = "" + number;
    if (number < 10) string = "0" + string;
    return string;
  };

  var dateToString = function dateToString(dateObject) {
    var y = dateObject.getUTCFullYear();
    var m = formatNumber(dateObject.getUTCMonth() - 1);
    var d = formatNumber(dateObject.getUTCDate());
    var dateArray = [y, m, d];
    return dateArray.join("-");
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

  return {
    stringToDate: stringToDate,
    dateToString: dateToString,
    daysBetweenDatesStringFormat: daysBetweenDatesStringFormat,
    addOneDayToDateWithHyphens: addOneDayToDateWithHyphens

  };
});

//# sourceMappingURL=dateHelper.js.map