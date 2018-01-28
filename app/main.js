"use strict";

requirejs(["request", "dataManager", "xmlHelper", "algorithm", "build", "database", "make", "procedures", "dateHelper", "development"], function ($req, $dm, $xmlh, $alg, $build, $db, $make, $prcd, $dh, $dev) {

  $dev.renderDevWindow();

  var settingsWindow = $make.settingsWindow();
  $make.draggable(settingsWindow);
  document.querySelector("body").appendChild(settingsWindow);

  $prcd.refreshData();
  $prcd.initializeGroupForm();
  $prcd.bindRefreshDataButton();
});

// very nice

//# sourceMappingURL=main.js.map