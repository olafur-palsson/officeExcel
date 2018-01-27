define(require => {
  const $dm = require("dataManager")
  const $render = require("render")

  const getCloseOutArrayAndRender = () => {
    const closeOuts     = $dm.getCalculatedCloseOuts()
    const closeOutTable = $dm.formatCloseOutsToTableFormat(closeOuts)
    const table         = $render.tableFromArray(closeOutTable, ["date", "sgl", "dbl"])
    const container     = document.querySelector(".closeOuts")
    container.appendChild(table)
  }

  const refreshData = () => {
    $dm.loadSettingsFromDatabase(getCloseOutArrayAndRender)

    const requestString = $dm.getDateURLrequestString()

    $dm.getAvailabilityPromise().then(doc => {
      const table = $dm.xmlToTable(doc)
      const rateDiv = $render.rates(table.rates)
      document.querySelector(".rates").appendChild(rateDiv)
      $render.availability(table.availability)
    })
  }

  const initializeGroupForm = () => {
    const button = $render.preFormButton()
    console.log()
    const form = document.querySelector(".groupCalc__preForm")
    form.appendChild(button)
    console.log(button)
  }


  return{
    refreshData: refreshData,
    initializeGroupForm: initializeGroupForm,
  };
})
