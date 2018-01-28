"use strict";

define(function (require) {
  var el = function el(type, className) {
    var el = document.createElement(type);
    el.classList.add(className);
    return el;
  };

  var txt = function txt(text) {
    return document.createTextNode(text);
  };

  var heading = function heading(text) {
    var h2 = el("h2");
    h2.appendChild(txt(text));
    return h2;
  };

  var clickable = function clickable(element, eventFunction) {
    element.addEventListener("click", function (event) {
      event.preventDefault();
      eventFunction();
    });
  };

  var button = function button(text, clickEventHandler, className) {
    var btn = el("button");
    var text$ = txt(text);

    btn.appendChild(text$);

    if (clickEventHandler) {
      console.log(text);
      clickable(btn, clickEventHandler);
    }

    if (className) {
      btn.classList.add(className);
    }

    return btn;
  };

  var roomTypeListItem = function roomTypeListItem(item, override) {
    var li = el("li", item);
    li.dataset.value = item;
    li.appendChild(txt(item));
    var btn = button("Remove type from list", function () {
      if (override) override();else li.parentElement.removeChild(li);
    });
    li.appendChild(btn);
    return li;
  };

  var tableFromArray = function tableFromArray(array, theaders) {

    var table = el("table");
    if (theaders != undefined) {
      var headerRow = el("tr");
      theaders.forEach(function (text) {
        var textNode = txt(text);
        var td = el("td");
        td.appendChild(textNode);
        headerRow.appendChild(td);
        table.appendChild(headerRow);
      });
    }

    if (array[0][0] == undefined) alert("Some function gave me not a table");
    array.forEach(function (key) {
      var tr = el("tr");
      key.forEach(function (item) {
        var td = el("td");
        var text = txt(item);
        td.appendChild(text);
        tr.appendChild(td);
      });
      table.appendChild(tr);
    });
    return table;
  };

  var error = function error(message, _error) {
    var str = message;
    if (_error) str += " | error: " + _error;
    var errorbox = document.querySelector(".errorbox");
    errorbox.innerHTML = str;
  };

  var settingsWindow = function settingsWindow() {
    var settingsWindow = el("div");
    settingsWindow.classList.add("settingsWindow");
    var theThingWeClickToDragWindows = el("div");
    theThingWeClickToDragWindows.classList.add("draggyPlace");
    settingsWindow.appendChild(theThingWeClickToDragWindows);

    return settingsWindow;
  };

  var draggable = function draggable(element) {
    var pos1 = 0,
        pos2 = 0,
        pos3 = 0,
        pos4 = 0;
    if (document.getElementById(element.id + "header")) {
      document.getElementById(element.id + "header").onmousedown = dragMouseDown;
    } else {
      element.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
      e = e || window.event;

      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;

      document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
      e = e || window.event;

      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;

      element.style.top = element.offsetTop - pos2 + "px";
      element.style.left = element.offsetLeft - pos1 + "px";
    }

    function closeDragElement() {
      document.onmouseup = null;
      document.onmousemove = null;
    }
  };

  var childless = function childless(node) {

    var clone = node.cloneNode(false);
    node.parentNode.replaceChild(clone, node);
  };

  var input = function input(type, defaultValue, className) {
    var input = el("input");
    input.setAttribute("type", type);
    if (className) input.classList.add(className);

    if (defaultValue) input.defaultValue = defaultValue;

    return input;
  };

  var settingsList = function settingsList(settings, callback) {
    var list = [];
    for (var key in settings) {
      list.push(key);
    }var container = el("div");

    list.forEach(function (key) {
      var div = el("div");
      var text = txt(key);
      var btn = button("Get", function () {
        callback(key);
      });
      div.appendChild(text);
      div.appendChild(btn);
      container.appendChild(div);
    });

    return container;
  };

  return {
    tableFromArray: tableFromArray,
    txt: txt,
    el: el,
    button: button,
    error: error,
    settingsWindow: settingsWindow,
    draggable: draggable,
    childless: childless,
    settingsList: settingsList,
    roomTypeListItem: roomTypeListItem,
    input: input,
    heading: heading,
    clickable: clickable

  };
});

//# sourceMappingURL=make.js.map