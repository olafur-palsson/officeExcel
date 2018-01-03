"use strict";

requirejs(["request", "dateHelper", "xmlHelper", "algorithm", "render"], function (reqData, dateHelper, xmlHelper, algorithm, render) {
  var settingsPromise = reqData.fromURL("rateSettings.json", "JSON");
  settingsPromise.then(function (settings) {
    var URLPromise = dateHelper.getDateURLrequestString();
    console.log(xmlHelper);
    URLPromise.then(function (URL) {
      reqData.fromURL(URL, "DOM").then(function (xmlDocument) {
        var roomClasses = settings.roomTypes;
        var availability = xmlHelper.getAvailabilityObjects(xmlDocument, roomClasses);

        var rates = algorithm.getRates(availability, settings);
        var rateTable = render.makeTableFromArray(rates, ["date", "rates", "availbilities"]);
        console.log(availability);
        var ratesTable = document.querySelector(".rates");
        ratesTable.appendChild(rateTable);
        var availabilityTable = render.getAvailabilityTable(availability);
        var availbilities = document.querySelector(".channelAvailability");
        availbilities.appendChild(availabilityTable);
      });
    });
  });
});

//# sourceMappingURL=main.js.map