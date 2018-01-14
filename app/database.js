"use strict";

define(function (require) {

  var getDaySerialCode = function getDaySerialCode() {
    var now = new Date();
    var time = now.getTime();
    var days = time / 86400000;
    return Math.floor(days);
  };

  var $fb = firebase.firestore().collection("leifur");

  var updateSettingsFromLocal = function updateSettingsFromLocal() {
    var $req = require("request");
    $req.fromURL("rateSettings.json", "JSON").then(function (data) {
      $fb.doc("settings").set(data);
    });
  };

  var get = function get(key) {
    return JSON.parse(window.localStorage.getItem(key));
  };

  var set = function set(key, data) {
    window.localStorage.setItem(key, JSON.stringify(data));
  };

  var getAvailabilityForDate = function getAvailabilityForDate(name, date) {
    var availability = get("availability");
    try {
      return availability[name][date];
    } catch (error) {
      require("render").makeError("You probably put in the wrong date when you asked for ", error);
    }
  };

  var storeAvailability = function storeAvailability(availability) {

    var roomTypes = require("dataManager").getRoomTypes();
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
    var serialCode = getDaySerialCode();
    window.localStorage.setItem("availability", storageJSON);
    var ref = firebase.firestore().doc("leifur/availability" + serialCode);
    ref.set(storage);
  };

  var loadSettings = function loadSettings(callback) {
    var settings = $fb.doc("settings").get();
    settings.then(function (doc) {
      set("settings", doc.data());
      callback();
    });
  };

  return {
    loadSettings: loadSettings,
    get: get,
    set: set,
    storeAvailability: storeAvailability,
    getAvailabilityForDate: getAvailabilityForDate,
    updateSettingsFromLocal: updateSettingsFromLocal

  };
});

//# sourceMappingURL=database.js.map