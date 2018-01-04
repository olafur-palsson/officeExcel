"use strict";

requirejs(["request", "dataHelper", "xmlHelper", "algorithm", "render", "eventBinder"], function ($req, $dh, $xmlh, $alg, $render, $eb) {

  $dh.refreshData();
  var refreshButton = document.querySelector(".refreshData");
  $eb.bindClickEvent(refreshButton, $eb.refreshData);
  $eb.bindPreformButton();
});

//# sourceMappingURL=main.js.map