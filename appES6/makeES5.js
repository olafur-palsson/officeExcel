define(require => {
  const el  = (type, className) => {
    const el = document.createElement(type)
    el.classList.add(className)
    return el
  };

  const txt = text => document.createTextNode(text);

  const heading = text => {
    const h2 = el("h2")
    h2.appendChild(txt(text))
    return h2
  }

  const clickable = (element, eventFunction) => {
    element.addEventListener("click", (event) => {
      event.preventDefault()
      eventFunction()
    })
  }

  const button = (text, clickEventHandler, className) => {
    const btn   = el("button")
    const text$ = txt(text)

    btn.appendChild(text$)

    if(clickEventHandler) {
      console.log(text)
      clickable(btn, clickEventHandler)
    }

    if(className) {
      btn.classList.add(className)
    }

    return btn
  }

  const roomTypeListItem = (item, override) => {
    const li = el("li", item)
    li.dataset.value = item
    li.appendChild(txt(item))
    const btn = button("Remove type from list", () => {
      if(override) override()
      else li.parentElement.removeChild(li)
    })
    li.appendChild(btn)
    return li
  }

  const tableFromArray = (array, theaders) => {

    const table = el("table")
    if(theaders != undefined) {
      const headerRow = el("tr")
      theaders.forEach(text => {
        const textNode = txt(text)
        const td       = el("td")
        td       .appendChild(textNode)
        headerRow.appendChild(td)
        table.appendChild(headerRow)
      })
    }

    if(array[0][0] == undefined) alert("Some function gave me not a table")
    array.forEach((key) => {
      const tr = el("tr")
      key.forEach((item) => {
        const td  = el("td")
        const text = txt(item)
        td.appendChild(text)
        tr.appendChild(td)
      })
      table.appendChild(tr)
    })
    return table
  }

  const error = (message, error) => {
    let str = message
    if(error) str += (" | error: " + error)
    const errorbox = document.querySelector(".errorbox")
    errorbox.innerHTML = str 
  }

  const settingsWindow = () => {
    const settingsWindow = el("div")
    settingsWindow.classList.add("settingsWindow")
    const theThingWeClickToDragWindows = el("div")
    theThingWeClickToDragWindows.classList.add("draggyPlace")
    settingsWindow.appendChild(theThingWeClickToDragWindows)

    return settingsWindow
  }

  const draggable = (element) => {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
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
    
      element.style.top = (element.offsetTop - pos2) + "px";
      element.style.left = (element.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
      document.onmouseup = null;
      document.onmousemove = null;
    }
  }

  const childless = (node) => {

    const clone = node.cloneNode(false)
    node.parentNode.replaceChild(clone, node)
  }

  const input = (type, defaultValue, className) => {
    const input = el("input")
    input.setAttribute("type", type)
    if(className)
      input.classList.add(className)

    if(defaultValue)
      input.defaultValue = defaultValue

    return input
  }


  const settingsList = (settings, callback) => {
    const list = []
    for(let key in settings)
      list.push(key)

    const container = el("div")

    list.forEach(key => {
      const div  = el("div")
      const text = txt(key)
      const btn  = button("Get", () => {
        callback(key)
      })
      div.appendChild(text)
      div.appendChild(btn)
      container.appendChild(div)
    })

    return container
  }

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
    clickable: clickable,

  }
})