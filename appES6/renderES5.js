define((require) => {
  const $make = require("make")
  const $dm   = require("dataManager")


  const availability = (availabilities) => {

    const table           = getAvailabilityTable(availabilities)
    const availabilityDiv = document.querySelector(".channelAvailability")
    availabilityDiv.appendChild(table)
  }

  const tableFromArray = (table, headers) => $make.tableFromArray(table, headers)

  const preFormButton = () => {
    const settings = $dm.get("settings")
    return $make.button("Make Form", () => { groupForm(settings) }, "groupCalc__preFormButton")
  }

  const rates = (rates) => {

    const tableHeaders = ["date", "rates", "availbilities"]
    const rateTable    = $make.tableFromArray(rates, tableHeaders)
    return rateTable
  }

  const getAvailabilityTable = (availabilities) => {
    const array = $dm.availabilityToTableFormat(availabilities)
    return $make.tableFromArray(array)
  }

  const appendInput = (div, text, inputType, inputName, defaultValue) => {

    const input    = $make.input(inputType, defaultValue, null)
    const br       = $make.el("br")
    const textNode = $make.txt(text)

    div.appendChild(textNode)
    div.appendChild(input)
    div.appendChild(br)
  }

  const createSubForm = (index, roomTypes) => {

    const superDiv   = $make.el("div")
    superDiv.setAttribute("class", "groupBooking booking" + index)
    appendInput(superDiv, "date for booking " + index, "date", "date" + index, "2018-1-1")
    appendInput(superDiv, "nights for booking " + index, "number", "nights" + index, 1)
    
    for(let key in roomTypes) {
      appendInput(
        superDiv, 
        "number of " + roomTypes[key] + " rooms",
        "number",
        key + index,
        1)
    }

    return superDiv
  }

  const createForm = (numberOfSubforms, roomTypes) => {

    const form = $make.el("form")
    form.setAttribute("class", "groupCalc__form")
    for(let i = 1; i <= numberOfSubforms; i++) {
      const div = createSubForm(i, roomTypes)
      div.setAttribute("class", "groupCalc__booking" + i)
      form.appendChild(div)
    }
    return form
  }


  const groupFormEvent = (form) => {
    const prices = $dm.getPricesFromForm(form)
    groupPrices(prices)
  }

  const groupForm = (settings) => {

    const n = document.querySelector("#numberOfBookings").value
    const roomTypes = $dm.getRoomTypes(settings)
    const form = createForm(n, roomTypes)
    $make.childless(document.querySelector(".groupCalc__formContainer"))
    const groupCalc = document.querySelector(".groupCalc__formContainer")
    const button    = $make.button("Calculate", () => { groupFormEvent(form) } ,"groupCalc__calculate")
    console.trace("here")
    form.appendChild(button)
    groupCalc.appendChild(form)
  }

  const groupPrices = (prices) => {

    let container = document.querySelector(".groupCalc__formContainer")
    $make.childless(container)
    const $dm = require("dataManager")
    prices.forEach(booking => {
      const data = $dm.objectToArrayWithHeaders(booking)    
      const table = $make.tableFromArray(data.reverse())
      let container = document.querySelector(".groupCalc__formContainer")
      container = document.querySelector(".groupCalc__formContainer")
      container.appendChild(table)
    })
  }


  const flatObjectFromDB = (object, objectName, className, sendSettings) => {
    console.log("This is coming " + objectName)
    const container   = $make.el("div", "editor")
    const heading     = $make.el("h2", "editor__heading")
    const headingText = $make.txt(objectName)

    container.appendChild(heading)
    heading.appendChild(headingText)

    for(let key in object) {
      let text = key
      text += ": "
      text += object[key]

      const textNode = $make.txt(text)
      const input    = $make.el("input")
      const div      = $make.el("div", "editor__item")
      div.appendChild(textNode)
      div.appendChild(input)
      input.dataset.key = key
      container.appendChild(div)
    }

    const button = $make.button(
      "Upload changes", 
      () => {
        const inputs = Array.from(container.querySelectorAll("input"))
        inputs.forEach(input => {
          
          const key   = input.dataset.key

          const value = parseInt(input.value)
          console.log(value)
          if(value)
            object[key] = value
        })
        let settings = $dm.get("settings")
        console.log(object)
        if(container.classList.contains("retailContract"))
          settings["retailContract"][objectName] = object
        else 
          settings[objectName] = object

        $dm.uploadSettings(settings)
      }, 
      "settings__uploadButton"
    )

    container.appendChild(button)

    const close = $make.button("Close", () => {
      $make.childless(container)
    })

    container.appendChild(close)

    return container
  }

  const roomTypeEditor = (object, objectName) => {
    const container = $make.el("div")
    const heading = $make.heading(objectName)

    for(let key in object) {
      const ul = $make.el("ul")
      ul.dataset.roomTypeClass = key

      object[key].forEach(item => {
        const li = $make.roomTypeListItem(item)
        ul.appendChild(li)
      })
      const input = $make.input("text")
      const btn   = $make.button("Add to list", () => {
        const li = $make.roomTypeListItem(input.value)
        ul.appendChild(li)
      })

      ul.appendChild(input)
      ul.appendChild(btn)

      container.appendChild($make.heading(key))
      container.appendChild(ul)
    }

    const btn = $make.button("Upload settings", () => {
      $dm.uploadRoomTypes(container)
    })

    container.appendChild(btn)

    return container
  }

  const contractEditor = (object, objectName) => {
    const container = $make.el("div")
    const heading = $make.el("h2")
    heading.appendChild($make.txt(objectName))
    container.appendChild(heading)

    for(let key in object) {
      container.appendChild(flatObjectFromDB(object[key], key, "retailContract"))
    }
    return container
  }

  const displaySettingsFor = key => {
    console.log(key)
    const settings = $dm.get("settings")
    let editor;

    switch(key) {
      case "retailContract":  editor = contractEditor(settings[key], key); break;
      case "roomTypes":       editor = roomTypeEditor(settings[key], key); break;
      default:                editor = flatObjectFromDB(settings[key], key)
    }

    console.trace(editor)

    const settingsWindow = document.querySelector(".settings__window")
    settingsWindow.appendChild(editor)
  }

  const settingsWindow = () => {
    const win = $make.draggableWindow("settings")
    const settingsList = $make.settingsList($dm.get("settings"), displaySettingsFor)
    document.querySelector("body").appendChild(win)
    win.classList.add("displayNone")
    win.appendChild(settingsList)
    return win
  }

  return {
    getAvailabilityTable: getAvailabilityTable,
    createSubForm: createSubForm,
    createForm: createForm,
    groupForm: groupForm,
    rates: rates,
    availability: availability,
    groupPrices: groupPrices,
    flatObjectFromDB: flatObjectFromDB,
    displaySettingsFor: displaySettingsFor,
    tableFromArray: tableFromArray,
    preFormButton: preFormButton,
    settingsWindow: settingsWindow,

  }
})