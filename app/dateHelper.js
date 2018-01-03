"use strict";

//to make a sentence with helper 

define(function (require) {
	var DAY_IN_MS = 86400000;

	return {
		getDateURLrequestString: function getDateURLrequestString(callback) {
			var finalPromise = new Promise(function (finalResolve, finalReject) {
				var settings = void 0;
				var request = require("request");
				var settingsPromise = new Promise(function (resolve, reject) {
					var promise = request.fromURL("rateSettings.json", "JSON");
					promise.then(function (settings) {
						resolve(settings.requestAvailability);
					});
				});

				settingsPromise.then(function (settings) {
					console.log(settings);
					var string = settings["URL"];
					var n = settings["days"];
					var today = new Date();
					var nDaysInAdvance = new Date();

					nDaysInAdvance.setDate(nDaysInAdvance.getDate() + n);
					string += "arrivalDate=" + today.getUTCFullYear() + "-" + (today.getUTCMonth() + 1) + "-" + today.getUTCDate();
					string += "&";
					string += "departureDate=" + nDaysInAdvance.getUTCFullYear() + "-" + (nDaysInAdvance.getUTCMonth() + 1) + "-" + nDaysInAdvance.getUTCDate();
					finalResolve(string);
				});
			});

			return finalPromise;
		},

		b: 1

	};
});

//# sourceMappingURL=dateHelper.js.map