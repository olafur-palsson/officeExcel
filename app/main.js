"use strict";

requirejs(["request", "dataManager", "xmlHelper", "algorithm", "build", "eventBinder", "database", "make", "procedures", "dateHelper", "development"], function ($req, $dm, $xmlh, $alg, $build, $eb, $db, $make, $prcd, $dh, $dev) {

  $dev.renderDevWindow();

  var settingsWindow = $make.settingsWindow();
  $make.draggable(settingsWindow);
  document.querySelector("body").appendChild(settingsWindow);

  $prcd.refreshData();
  $prcd.initializeGroupForm();

  var refreshButton = document.querySelector(".refreshData");
  $make.clickable(refreshButton, $prcd.refreshData);
});

// very nice

//# sourceMappingURL=main.js.map