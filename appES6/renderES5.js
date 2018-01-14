define((require) => {

  const makeError = (message, error) => {
    let str = message
    if(error) str += (" | error: " + error)
    const errorbox = document.querySelector(".errorbox")
    errorbox.innerHTML = str 
  }

  const removeChildren = (node) => {

    const clone = node.cloneNode(false)
    node.parentNode.replaceChild(clone, node)
  }


  const makeTableFromArray = (array, theaders) => {

    const table = document.createElement("table")
    if(theaders != undefined) {
      const headerRow = document.createElement("tr")
      theaders.forEach((text) => {
        const textNode = document.createTextNode(text)
        const td       = document.createElement("td")
        td       .appendChild(textNode)
        headerRow.appendChild(td)
        table.appendChild(headerRow)
      })
    }


    if(array[0][0] == undefined) alert("Some function gave me not a table")
    array.forEach((key) => {
      const tr = document.createElement("tr")
      key.forEach((item) => {
        const td  = document.createElement("td")
        const txt = document.createTextNode(item)
        td.appendChild(txt)
        tr.appendChild(td)
      })
      table.appendChild(tr)
    })
    return table
  }


  const renderAvailability = (availabilities) => {

    const table           = getAvailabilityTable(availabilities)
    const availabilityDiv = document.querySelector(".channelAvailability")
    availabilityDiv.appendChild(table)
  }


  const renderRates = (rates) => {

    const tableHeaders = ["date", "rates", "availbilities"]
    const rateTable    = makeTableFromArray(rates, tableHeaders)
    const rateDiv      = document.querySelector(".rates")
    rateDiv.appendChild(rateTable)
  }


  const availabilityToTableFormat = (object) => {

    let array = [["date"]]
    let compressedObject = {}
    for(let key in object) {
      array[0].push(key)
      for(let date in object[key]) {
        compressedObject[date] = []
      }
    }
    for(let key in object) {
      for(let date in object[key]) {
        compressedObject[date].push(object[key][date][0])
      }
    }
    for(let date in compressedObject) {
      let subarray = [date]
      compressedObject[date].forEach(text => {
        subarray.push(text)
      })
      array.push(subarray)
    }
    return array
  }


  const getAvailabilityTable = (availabilities) => {

    const array = availabilityToTableFormat(availabilities)
    return makeTableFromArray(array)
  }


  const appendInput = (div, text, inputType, inputName, defaultValue) => {

    const input    = document.createElement("input")
    const br       = document.createElement("br")
    const textNode = document.createTextNode(text)

    input.setAttribute("name", inputName)
    input.setAttribute("type", inputType)
    input.defaultValue = defaultValue
    div.appendChild(textNode)
    div.appendChild(input)
    div.appendChild(br)
  }


  const createSubForm = (index, roomTypes) => {

    const superDiv   = document.createElement("div")
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

    const form = document.createElement("form")
    form.setAttribute("class", "groupCalc__form")
    for(let i = 1; i <= numberOfSubforms; i++) {
      const div = createSubForm(i, roomTypes)
      div.setAttribute("class", "groupCalc__booking" + i)
      form.appendChild(div)
    }
    return form
  }

  const renderGroupForm = (settings) => {

    const $eb = require("eventBinder")
    const $xmlh = require("xmlHelper")
    const $dm = require("dataManager")
    const n = document.querySelector("#numberOfBookings").value
    const roomTypes = $dm.getRoomTypes(settings)
    const form = createForm(n, roomTypes)
    removeChildren(document.querySelector(".groupCalc__formContainer"))
    const groupCalc = document.querySelector(".groupCalc__formContainer")
    const button    = document.createElement("button")
    button.setAttribute("class", "groupCalc__calculate")
    button.appendChild(document.createTextNode("Calculate"))
    form.appendChild(button)
    groupCalc.appendChild(form)
    $eb.groupFormEvent(button, form)
  }


  const renderGroupPrices = (prices) => {

    let container = document.querySelector(".groupCalc__formContainer")
    removeChildren(container)
    const $dm = require("dataManager")
    prices.forEach(booking => {
      const data = $dm.objectToArrayWithHeaders(booking)    
      const table = makeTableFromArray(data.reverse())
      let container = document.querySelector(".groupCalc__formContainer")
      container = document.querySelector(".groupCalc__formContainer")
      container.appendChild(table)
    })
  }

  

  return {
    makeTableFromArray: makeTableFromArray,
    availabilityToTableFormat: availabilityToTableFormat,
    getAvailabilityTable: getAvailabilityTable,
    createSubForm: createSubForm,
    createForm: createForm,
    renderGroupForm: renderGroupForm,
    renderRates: renderRates,
    renderAvailability: renderAvailability,
    removeChildren: removeChildren,
    renderGroupPrices: renderGroupPrices,
    makeError: makeError,
  }
})