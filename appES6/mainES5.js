
requirejs(["request", "dateHelper", "xmlHelper", "algorithm", "render"], 
          (reqData,    dateHelper,   xmlHelper,   algorithm,   render) => {
  const settingsPromise = reqData.fromURL("rateSettings.json", "JSON")
  settingsPromise
  
  .then(settings => {
    const URLPromise = dateHelper.getDateURLrequestString()
    console.log(xmlHelper)
    URLPromise
  .then(URL => {
    reqData.fromURL(URL, "DOM")
  .then(xmlDocument => {
    const roomClasses = settings.roomTypes
    const availability = xmlHelper.getAvailabilityObjects(xmlDocument, roomClasses)


    const rates = algorithm.getRates(availability, settings)
    const rateTable = render.makeTableFromArray(rates, ["date", "rates", "availbilities"])
    console.log(availability)
    const ratesTable  = document.querySelector(".rates")
    ratesTable.appendChild(rateTable)
    const availabilityTable = render.getAvailabilityTable(availability)
    const availbilities = document.querySelector(".channelAvailability")
    availbilities.appendChild(availabilityTable)
  })
  })
  })
})