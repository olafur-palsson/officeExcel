(() => {



  //string handler
  let availabilityRequestURI = "https://api.roomercloud.net/services/bookingapi/availability1?hotel=HLEI&channelCode=BBN&channelManagerCode=OWN&"
  const today = new Date()
  const dayInMs = 86400000
  let todayPlus400days = new Date()
  todayPlus400days.setDate(todayPlus400days.getDate() + 50)

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

  const getSinglesObject = () => {
    const singlesInventory = getInventory("SGL-OBE").getElementsByTagName("day")
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
    const doublesInventory = getInventory("DBL-OBE") .getElementsByTagName("day")
    const twinsInventory   = getInventory("TWIN-OBE").getElementsByTagName("day")
    let doublesObject = {}
    Array.from(doublesInventory).forEach(day => {
      const date         = day.getAttribute("date")
      const availability = day.getAttribute("availability")
      const currentRate  = day.getAttribute("rate")
      doublesObject[date] = [parseInt(availability), currentRate]
    })

    Array.from(twinsInventory).forEach((day, i) => {
      const date         = day.getAttribute("date")
      const availability = day.getAttribute("availability")
      for(let key in doublesObject) {
         if(key == date) doublesObject[key][0] += parseInt(availability)
      }
    })
    console.log(doublesObject)
    return doublesObject
  }

  let rateParameters;
  let singles;
  let doubles;
  let total;

  const calculateRates = () => {
    const rates = total.forEach(item => {
        console.log(item)
    })
  }

  const render = () => {
    singles = getSinglesObject()
    doubles = getDoublesObject()
    total   = Object.keys(singles).map((key, index) => {
      const s = parseInt(singles[key][0])
      const d = parseInt(doubles[key][0])
      return [key, s + d]
    })

    console.log(total)
    showRatesAndAvailabilities()
    calculateRates()
  }

  const showRatesAndAvailabilities = () => {
    let singlesTable = Object.keys(singles).map((key) => {
      return [key, singles[key][0], singles[key][1]]
    })

    let doublesTable = Object.keys(doubles).map((key) => {
      return [key, doubles[key][0], doubles[key][1]]
    })

    console.log(doublesTable)

    const tableElement = document.createElement("table")
    const tablerow     = document.createElement("tr")
    const singlesText   = document.createTextNode("singles")
    tablerow.appendChild(singlesText)
    singlesTable.forEach((item, index) => {
      const tr = document.createElement("tr")
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

    document.querySelector("body").appendChild(tableElement)
  }





  const loadRateParameters = () => {
    const xml = new XMLHttpRequest()
    xml.open('GET', 'rateSettings.json', true)
    xml.send(null)
    xml.onreadystatechange = () => {
      if (xml.readyState === XMLHttpRequest.DONE && xml.status === 200) {
        const JSONtext = xml.responseText
        rateParameters = JSON.parse(JSONtext)
        render()
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
        getSinglesObject()
        getDoublesObject()
        loadRateParameters()
      }
    }
  })();
})()
