
define(['test'], test2 => {
  console.log(test2.text)
})



(() => {



  //string handler
  let availabilityRequestURI = "https://api.roomercloud.net/services/bookingapi/availability1?hotel=HLEI&channelCode=HOT&channelManagerCode=OWN&"
  const today = new Date()
  const dayInMs = 86400000
  let todayPlus400days = new Date()
  todayPlus400days.setDate(todayPlus400days.getDate() + 20)

  availabilityRequestURI += "arrivalDate="   + today.getUTCFullYear() + "-" + (today.getUTCMonth() + 1) + "-" + today.getUTCDate()
  availabilityRequestURI += "&"
  availabilityRequestURI += "departureDate=" + todayPlus400days.getUTCFullYear() + "-" + (todayPlus400days.getUTCMonth() + 1) + "-" + todayPlus400days.getUTCDate()

  let availabilityXML;

  const getInventory = (inventoryID) => {
      const inventory = availabilityXML.getElementsByTagName("inventoryItem")
      let returnItem = false
      Array.from(inventory).forEach(item => {
        const ID = item.getAttribute("inventoryCode")
        if(ID == inventoryID) returnItem = item
      })

      if(!returnItem) alert("Error getting Inventory by ID: " + inventoryID)
      else return returnItem
  }

  let settings;
  let rateParameters;
  let singles;
  let doubles;
  let total;

  const getSinglesObject = () => {
    const singlesInventory = getInventory("SGL-S").getElementsByTagName("day")
    let singlesObject = {}
    Array.from(singlesInventory).forEach(day => {
      const date         = day.getAttribute("date")
      const availability = day.getAttribute("availability")
      const currentRate  = day.getAttribute("rate")
      singlesObject[date] = [availability, currentRate]
    })
    console.log(singlesObject)
    return singlesObject
  }

  const getDoublesObject = () => {
    console.log(settings)
    const doublesTypes = settings.roomTypes.dbl
    let   doublesInventories = []
    doublesTypes.forEach(item => {
      doublesInventories.push(getInventory(item))
    })

    let doublesObject = {}

    Array.from(doublesInventories[0].getElementsByTagName("day")).forEach((day, i) => {
      const date = day.getAttribute("date")
      doublesObject[date] = [0, 0]
    })

    doublesInventories.forEach((roomType, i) => {
      const days = roomType.getElementsByTagName("day")
      Array.from(days).forEach(day => {
        const date         = day.getAttribute("date")
        const availability = day.getAttribute("availability")
        const currentRate  = day.getAttribute("rate")
        doublesObject[date][1] = currentRate
        doublesObject[date][0] += parseInt(availability)
      })
    })
    console.log(doublesObject)
    return doublesObject
  }


  const weekendValue = date => {
      const weekendBonus = rateParameters.weekendWeight
      const day = date.getDay()
      if(day == 4) return weekendBonus * 0.5
      if(day == 6 || day == 5) return weekendBonus
      return 0
  }

  const seasonalValue = date => {
    const seasonalBonus = rateParameters.seasonalWeight
    const month = date.getMonth()
    const tourists = settings.numberOfTouristsJanIs0
    let   max = 0
    let   min = Infinity

    for(let key in tourists) {
      if(parseInt(tourists[key]) > max) max = tourists[key]
      if(parseInt(tourists[key]) < min) min = tourists[key]
    }

    const ratio = (tourists[month] - min) / (max - min) 

    return ratio * seasonalBonus
  }

  const superDayValue = date => {
    
    let dateString = ""
    dateString += date.getDate() + "."
    dateString += (date.getMonth() + 1) + "."
    dateString += date.getUTCFullYear()

    const superdays = settings.superDays
    const weight = rateParameters.superDayWeight
    for(let key in superdays) {
      console.log(key + " and " + dateString)
      if(key == dateString) return superdays[key] * weight
    }

    return 0
  }

  const makeTableFromArray = array => {
    if(array[0][0] == undefined) alert("Some function gave me not a table")
    const table = document.createElement("table")
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

  const render = () => {
    singles = getSinglesObject()
    doubles = getDoublesObject()
    total   = Object.keys(singles).map((key, index) => {
      const s = parseInt(singles[key][0])
      const d = parseInt(doubles[key][0])
      return [key, s + d]
    })

    console.log("Total: " + total)

    const priceFloor      = rateParameters.priceFloor
    const absPriceFloor   = rateParameters.absoluteFloor
    const seasonalWeight  = rateParameters.seasonalWeight
    const futureWeight    = rateParameters.futureWeight
    const superDayWeight  = rateParameters.superDayWeight
    const occupancyWeight = rateParameters.occupancyWeight
    const sellOffWeight   = rateParameters.sellOff

    const ratesCalculated  = total.map((dateAndAvailability) => {
      const dateString     = dateAndAvailability[0]
      const availability   = parseInt(dateAndAvailability[1])
      const dateObject     = new Date(dateString)
      const now            = Date.now()
      const daysUntilDate  = 1 + Math.floor((dateObject - now)/1000/60/60/24);
      const month          = dateObject.getMonth()
      const weekendBonus   = weekendValue(dateObject)
      console.log(dateObject.getUTCFullYear())

      const seasonalBonus  = seasonalValue(dateObject)
      const occupancy      = availability/47
      const occupancyBonus = (1-occupancy) * occupancyWeight //
      const expectedRooms  = Math.min(Math.pow(daysUntilDate/180, 0.7), 1) //
      const futureBonus    = (1-expectedRooms)*futureWeight //
      const lastRoomsBonus = Math.pow(1-occupancy, 8)*occupancyWeight*1.5 //
      const sellOffRatio   = Math.min(Math.pow((187 - daysUntilDate)/180, 6.5), 1) //
      const sellOffBonus   = sellOffRatio * sellOffWeight //
      const superDayBonus  = superDayValue(dateObject)

      const rateShift      = occupancyBonus - futureBonus //
      const baseRate       = priceFloor + rateShift + seasonalBonus /* + SUPERDAY BONUS */
      const baseRatePlus   = baseRate - sellOffBonus + weekendBonus + lastRoomsBonus + superDayBonus
      const absFloorPlus   = absPriceFloor + weekendBonus

      const finalRate      = Math.max(absFloorPlus, baseRatePlus)

      return [dateAndAvailability, finalRate]
    })


    const rateTable = makeTableFromArray(ratesCalculated)
    document.querySelector(".rates").appendChild(rateTable) 
    showRatesAndAvailabilities()
  }

  const showRatesAndAvailabilities = () => {
    let singlesTable = Object.keys(singles).map((key) => {
      return [key, singles[key][0], singles[key][1]]
    })

    let doublesTable = Object.keys(doubles).map((key) => {
      return [key, doubles[key][0], doubles[key][1]]
    })

    //console.log(doublesTable)

    const tableElement = document.createElement("table")
    const tablerow     = document.createElement("tr")
    const singlesText  = document.createTextNode("singles")
    tablerow.appendChild(singlesText)
    singlesTable.forEach((item, index) => {
      const tr                = document.createElement("tr")
      const tdDate            = document.createElement("td")
      const tdAvailabilitySgl = document.createElement("td")
      const tdRate            = document.createElement("td")
      const tdAvailabilityDbl = document.createElement("td")
      const availabilityDbl   = document.createTextNode(doublesTable[index][1])
      const availabilitySgl   = document.createTextNode(item[1])
      const date              = document.createTextNode(item[0])

      tdDate           .appendChild(date)
      tdAvailabilityDbl.appendChild(availabilityDbl)
      tdAvailabilitySgl.appendChild(availabilitySgl)
      tr               .appendChild(tdDate)
      tr               .appendChild(tdAvailabilitySgl)
      tr               .appendChild(tdAvailabilityDbl)
      tableElement     .appendChild(tr)
    })

    document.querySelector(".channelAvailability").appendChild(tableElement)
  }

  const loadRateParameters = () => {
    const xml = new XMLHttpRequest()
    xml.open('GET', 'rateSettings.json', true)
    xml.send(null)
    xml.onreadystatechange = () => {
      if (xml.readyState === XMLHttpRequest.DONE && xml.status === 200) {
        const JSONtext = xml.responseText
        settings = JSON.parse(JSONtext)
        rateParameters = settings.rateParameter
        console.log(rateParameters)
        render() //entry point: STAGE 2
      }
    }
  }

  ;(() => {
    const xml = new XMLHttpRequest()
    xml.open('GET', availabilityRequestURI, true)
    xml.send(null)
    xml.onreadystatechange = () => {
      if (xml.readyState === XMLHttpRequest.DONE && xml.status === 200) {
        const parser = new DOMParser()
        availabilityXML = parser.parseFromString(xml.responseText, "text/xml")
        console.log(availabilityXML)
        loadRateParameters() //entry point: STAGE 1
      }
    }
  })();
})()