"use strict";

//to make a sentence with helper 

define(function (require) {
	var DAY_IN_MS = 86400000;
	var $req = require("request");
	var $xmlh = require("xmlHelper");

	var getDateURLrequestString = function getDateURLrequestString(settings) {
		var URLSettings = settings.requestAvailability;
		var string = URLSettings["URL"];
		var n = URLSettings["days"];
		var today = new Date();
		var nDaysInAdvance = new Date();

		nDaysInAdvance.setDate(nDaysInAdvance.getDate() + n);
		string += "arrivalDate=" + today.getUTCFullYear() + "-" + (today.getUTCMonth() + 1) + "-" + today.getUTCDate();
		string += "&";
		string += "departureDate=" + nDaysInAdvance.getUTCFullYear() + "-" + (nDaysInAdvance.getUTCMonth() + 1) + "-" + nDaysInAdvance.getUTCDate();
		console.log(string);
		return string;
	};

	var getSettings = function getSettings() {
		var string = window.localStorage.getItem("settings");
		return JSON.parse(string);
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

	var getRoomTypes = function getRoomTypes() {
		var settingsString = window.localStorage.getItem("settings");
		var settings = JSON.parse(settingsString);
		var roomTypeList = settings.roomTypes;
		var array = [];
		for (var key in roomTypeList) {
			array.push(key);
		}

		return array;
	};

	var refreshData = function refreshData(callback) {
		var settingsPromise = $req.fromURL("rateSettings.json", "JSON");
		settingsPromise.then(function (settings) {
			var settingsData = JSON.stringify(settings);
			window.localStorage.setItem("settings", settingsData);
			var requestString = getDateURLrequestString(settings);
			console.log(requestString);
			$xmlh.getAndStoreXML(requestString, callback);
		});
	};

	return {
		getDateURLrequestString: getDateURLrequestString,
		getGroupFormDataAsArray: getGroupFormDataAsArray,
		refreshData: refreshData,
		getRoomTypes: getRoomTypes,
		getSettings: getSettings

	};
});

//# sourceMappingURL=dataHelper.js.map