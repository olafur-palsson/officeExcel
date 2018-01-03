"use strict";

define(function () {
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

  return {
    makeTableFromArray: makeTableFromArray,
    availabilityToTableFormat: availabilityToTableFormat,
    getAvailabilityTable: getAvailabilityTable
  };
});

//# sourceMappingURL=render.js.map