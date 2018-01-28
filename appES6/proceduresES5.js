define(require => {
  const $dm = require("dataManager")
  const $render = require("render")
  const $make   = require("make")

  const getCloseOutArrayAndRender = () => {
    const closeOuts     = $dm.getCalculatedCloseOuts()
    const closeOutTable = $dm.formatCloseOutsToTableFormat(closeOuts)
    const table         = $render.tableFromArray(closeOutTable, ["date", "sgl", "dbl"])
    const container     = document.querySelector(".closeOuts")
    container.appendChild(table)
  }

  const refreshData = (isFromButton) => {
    $dm.loadSettingsFromDatabase(() => {;})
    console.log(isFromButton)
    const requestString = $dm.getDateURLrequestString(isFromButton)

    $dm.getAvailabilityPromise(isFromButton).then(doc => {
      const table = $dm.xmlToTable(doc)
      const rateDiv = $render.rates(table.rates)
      document.querySelector(".rates").appendChild(rateDiv)
      $render.availability(table.availability)
      getCloseOutArrayAndRender()
    })
  }

  const bindRefreshDataButton = () => {
    const btn = document.querySelector(".refreshData")
    $make.clickable(btn, () => {
      console.log("right here")
      refreshData("huetnoashuenaoa")
    })
  }

  const initializeGroupForm = () => {
    const button = $render.preFormButton()
    console.log()
    const form = document.querySelector(".groupCalc__preForm")
    form.appendChild(button)
    console.log(button)
  }

  const bindContainerToggles = () => {
    const buttons = Array.from(document.querySelectorAll(".container__toggle"))
    buttons.forEach(button => {
      const container = button.parentElement.querySelector("div")
      $make.clickable(button, () => {
        container.classList.toggle("displayNone")
      })
      console.log(container)
    })
  }

  const initializeSettings = () => {
    const win = $render.settingsWindow()
    const toggleButton = document.querySelector(".navbar__settings__img")
    $make.clickable(toggleButton, () => {
      win.classList.toggle("displayNone")
    })
  }


  return{
    refreshData: refreshData,
    initializeGroupForm: initializeGroupForm,
    bindRefreshDataButton:bindRefreshDataButton,
    bindContainerToggles: bindContainerToggles,
    initializeSettings: initializeSettings,
  };
})
