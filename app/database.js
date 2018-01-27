"use strict";

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

define(function () {

  var getDaySerialCode = function getDaySerialCode() {
    var now = new Date();
    var time = now.getTime();
    var days = time / 86400000;
    return Math.floor(days);
  };

  var createError = function createError(message, error) {
    var str = message;
    if (error) str += " | error: " + error;
    var errorbox = document.querySelector(".errorbox");
    errorbox.innerHTML = str;
  };

  var $fb = firebase.firestore().collection("leifur");

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
      createError("Something went wrong here bro... ", error);
    }
  };

  var uploadRoomTypes = function uploadRoomTypes(container) {
    console.log("Totally updating bro, jk");
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
    var storageJSON = storage;
    set("availability", storageJSON);
    var ref = firebase.firestore().doc("leifur/availability");
    ref.set(storage);
  };

  var addSerialToList = function addSerialToList(documentName) {
    var serial = getDaySerialCode();
    var list = $fb.doc("settings").get();
    list.then(function (doc) {
      var data = doc.data();
      var newArray = data["serialcodes"];
      var check = true;
      newArray.forEach(function (item) {
        if (item == serial) check = false;
      });
      if (check) newArray.push(serial);
      $fb.doc("settings").set(data);
    });
  };

  var uploadSettings = function uploadSettings(data) {

    //data = get("settings")
    var daySerial = getDaySerialCode();
    var ref = $fb.doc("settings/" + daySerial + "/settings");
    ref.set(data);
    addSerialToList("settings");
  };

  var loadSettings = function loadSettings(callback) {

    var a = $fb.doc("settings");
    var settings = $fb.doc("settings").get();
    settings.then(function (doc0) {
      var list = doc0.data().serialcodes;
      console.log(doc0.data());
      var id = Math.max.apply(Math, _toConsumableArray(list));
      $fb.doc("settings/" + id + "/settings").get().then(function (doc1) {
        console.log(doc1.data());
        set("settings", doc1.data());
        callback();
      });
    });
  };

  return {
    loadSettings: loadSettings,
    get: get,
    set: set,
    getAvailabilityForDate: getAvailabilityForDate,
    getDaySerialCode: getDaySerialCode,
    uploadSettings: uploadSettings,
    storeAvailability: storeAvailability,
    createError: createError

  };
});

//# sourceMappingURL=database.js.map