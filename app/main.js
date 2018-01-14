"use strict";

requirejs(["request", "dataManager", "xmlHelper", "algorithm", "render", "eventBinder", "database"], function ($req, $dm, $xmlh, $alg, $render, $eb, $db) {

  $db.updateSettingsFromLocal();

  var callback = function callback() {
    $dm.refreshData();
    $dm.getCloseOutArrayAndRender();
  };
  $db.loadSettings(callback);

  var refreshButton = document.querySelector(".refreshData");
  $eb.bindClickEvent(refreshButton, $eb.refreshData);
  $eb.bindPreformButton();
});

// very nice

//# sourceMappingURL=main.js.map