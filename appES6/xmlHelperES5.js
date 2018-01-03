define(() => {


  const getInventoryFromID = (xml, inventoryID) => {
    const inventory = xml.getElementsByTagName("inventoryItem")
      let returnItem = false
      Array.from(inventory).forEach(item => {
        const ID = item.getAttribute("inventoryCode")
        if(ID == inventoryID) returnItem = item
      })
        
      if(!returnItem) alert("Error getting Inventory by ID: " + inventoryID)
      else return returnItem
  }

  const getAvailabilityObjectsFromSettingsArray = (xml, objectWithArraysOfRoomTypes) => {
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
    getAvailabilityObjects: getAvailabilityObjectsFromSettingsArray
  }
})