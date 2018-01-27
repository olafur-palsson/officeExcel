define(require => {
  const $req     = require("request")
  const $db      = require("database")
  const settings = $db.get("settings")

  const stringifyXML = xml => {
    const strigifier = new XMLSerializer()
    return strigifier.serializeToString(xml)
  }


  const xmlToTable = xmlDocument => {
    const $alg = require("algorithm")
    console.log(xmlDocument)
    const availability = getAvailabilityObjectsFromSettingsArray(xmlDocument, settings.roomTypes)
    $db.storeAvailability(availability)
    console.log($alg)
    const rates        = $alg.getRates(availability)
    return {
      rates: rates,
      availability: availability
    }
  }


  const getAndStoreXML = (url) => {
    return new Promise((resolve, reject) => {
      $req.fromURL(url, "DOM").then(xmlDocument => {
        const xmlString = stringifyXML(xmlDocument)
        $db.set("rawXML", xmlString)
        console.log(xmlDocument)
        resolve(xmlDocument)
      })

    })
  }


  const getInventoryFromID = (xml, inventoryID) => {

    const inventory = xml.getElementsByTagName("inventoryItem")
      let returnItem = false
      Array.from(inventory).forEach(item => {
        const ID = item.getAttribute("inventoryCode")
        if(ID == inventoryID) returnItem = item
      })
        
      if(!returnItem) alert("Error getting Inventory by ID: " + inventoryID)
      else 

        return returnItem
  }


  const getAvailabilityObjectsFromSettingsArray = (xml, objectWithArraysOfRoomTypes) => {

    console.log(xml)
    let returnObject = {}
    let prototypeWithDates = {}
    for(let roomClass in objectWithArraysOfRoomTypes) {
      const array = objectWithArraysOfRoomTypes[roomClass]
      if(array.length == 0) {
        alert("roomClass was empty")
        break;
      }
      const inventory = Array.from(getInventoryFromID(xml, array[0]).getElementsByTagName("day"))
      inventory.forEach(day => {
        const date = day.getAttribute("date")
        prototypeWithDates[date] = [0, 0]
      })
    }

    for(let roomClass in objectWithArraysOfRoomTypes) {
      console.log(roomClass)
      returnObject[roomClass] = {}
      for(let key in prototypeWithDates)
        returnObject[roomClass][key] = [0, 0]

      objectWithArraysOfRoomTypes[roomClass].forEach(roomType => {
        const inventory = Array.from(getInventoryFromID(xml, roomType).getElementsByTagName("day"))
        inventory.forEach(day => {
          const date         = day.getAttribute("date")
          const availability = day.getAttribute("availability")
          const currentRate  = day.getAttribute("rate")
          returnObject[roomClass][date][1] = currentRate
          returnObject[roomClass][date][0] += parseInt(availability)
        })
      })
    }
    
    return returnObject
  }



  return {
    getInventory: getInventoryFromID,
    getAvailabilityObjects: getAvailabilityObjectsFromSettingsArray,
    getAndStoreXML: getAndStoreXML,
    stringifyXML: stringifyXML,
    xmlToTable: xmlToTable
  }
  
})