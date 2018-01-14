
define(require => {
	const DAY_IN_MS = 86400000
	const $req  = require("request")
	const $xmlh = require("xmlHelper")
	const $db   = require("database")
	const $render = require("render")


	const getDateURLrequestString = () => {

		const URLSettings  = $db.get("settings").requestAvailability
		let string         = URLSettings["URL"]
		const n            = URLSettings["days"]
		const today        = new Date()
		let nDaysInAdvance = new Date()

		nDaysInAdvance.setDate(nDaysInAdvance.getDate() + n)
		string += "arrivalDate="   + today.getUTCFullYear() + "-" + (today.getUTCMonth() + 1) + "-" + today.getUTCDate()
		string += "&"
		string += "departureDate=" + nDaysInAdvance.getUTCFullYear() + "-" + (nDaysInAdvance.getUTCMonth() + 1) + "-" + nDaysInAdvance.getUTCDate()
		
		return string
	}


	const objectToArrayWithHeaders = object => {

		let data = []
		for(let key in object) {
			const element = [key, object[key]]
			data.push(element)
		}
		return data
	}


	const stringToDate = dateString => {

		const array = dateString.split("-")
		const y = array[0]
		const m = parseInt(array[1]) + 1
		const d = array[2]
		const date = new Date(y, m, d)

		return date
	}


	const dateToString = dateObject => {
		const y = dateObject.getUTCFullYear()
		const m = formatNumber(dateObject.getUTCMonth() -1)
		const d = formatNumber(dateObject.getUTCDate()) 
		const dateArray = [y, m, d]
		return dateArray.join("-")
	}


	const formatNumber = (number) => {
		let string = "" + number
		if(number < 10) string = "0" + string;
		return string
	}


	const daysBetweenDatesStringFormat = (date1, date2) => {
		const bookingDate = stringToDate(date1)
		const contractDate = stringToDate(date2)
		const difference = bookingDate - contractDate
		return difference
	}


	const addOneDayToDateWithHyphens = dateString => {
		let date = stringToDate(dateString)
		date = date.setDate(date.getDate() + 1)
		date = new Date(date)
		date = dateToString(date)
		return date
	}


	const getGroupFormDataAsArray = (form) => {

		const divs = Array.from(form.querySelectorAll("div"))
		const data = []
		divs.forEach(div => {
			const subArray = []
			const inputs = Array.from(div.querySelectorAll("input"))
			inputs.forEach(input => {
				subArray.push(input.value)
			})
			data.push(subArray)
		})

		return data
	}


  const getRoomTypes = () => {

  	const settingsString = window.localStorage.getItem("settings")
  	const settings = JSON.parse(settingsString)
    const roomTypeList = settings.roomTypes
    let array = []
    for(let key in roomTypeList) {
      array.push(key)
    }

    return array
  }


  const storeAvailability = (availability) => {

    const roomTypes = getRoomTypes()
    const storage = {}
    storage["total"] = {}
    roomTypes.forEach(type => {
      storage[type] = {}
    })

    for(let type in availability) {
      for(let day in availability[type]) {
        storage[type][day] = availability[type][day][0]
        if(storage["total"][day] == undefined) storage["total"][day] = 0
        storage["total"][day] += availability[type][day][0]
      }
    }
    const storageJSON = JSON.stringify(storage)
    window.localStorage.setItem("availability", storageJSON)
    const ref = firebase.firestore().doc("leifur/availability")
    ref.set(storage)
  }


	const refreshData = () => {

		const requestString = getDateURLrequestString()
		const xmlPromise = $xmlh.getAndStoreXML(requestString)
    xmlPromise.then(doc => {
      const table = $xmlh.xmlToTable(doc)
      $render.renderRates(table.rates)
      $render.renderAvailability(table.availability)
    })
	}

  const getMinimumRoomsSupposedToBeAvailable = () => {

    const settings = $db.get("settings")
    const roomQuantities = settings.totalNumberOfRooms
    const closeOutFloor  = settings.closeOut.floor
    const minimum        = settings.closeOut.minimum
    const total          = roomQuantities.total
    const returnObject   = {}
    for(let key in roomQuantities) {
      if(key == "total") continue;
      const minimumAmountFromRatio = Math.ceil(roomQuantities[key] / total * closeOutFloor)
      if(minimumAmountFromRatio > minimum) {
        returnObject[key] = minimumAmountFromRatio
      }
      else {
        returnObject[key] = minimum
      }  
    }

    return returnObject
  }


  // this is the worst code in the whole application, if you have a better idea
  // that makes it more readable, then by all means, please rewrite
  // if you're just going to reduce it by two for-loops then seriously
  // you need to rethink what good code looks like
  const formatCloseOutsToTableFormat = object => {
    let tableObject = {}
    //make an object with dates and close-outs
    for(let key in object) {
      for(let day in object[key])
        tableObject[day] = [day]
      break;
    }

    //finish making the object with date and close-outs
    for(let roomType in object)
      for(let day in object[roomType])
        tableObject[day].push(object[roomType][day])

    //convert the object to a format that makeTableFromArray can use
    let table = []
    for(let key in tableObject) {
      table.push(tableObject[key])
    }

    return table
  }


  const shouldBeOpen = (roomType, day, n) => {
    const minimums = getMinimumRoomsSupposedToBeAvailable()
    const min      = minimums[roomType]
    if(min >= n) 
      return "Closed" //"false by availability"

    const $alg  = require("algorithm")
    const algorithmPrice  = $alg.calculateDay([day, n])[1]
    const contractPrice   = $alg.calculateContractDay([day, n])[1]
    const comparisonPrice = algorithmPrice * 0.85 - 20
    if(comparisonPrice > contractPrice)
      return "Closed" //"false by price"

    return "Open"
  }


  const getCalculatedCloseOuts = () => {

    const availability = $db.get("availability")
    const returnObject = {}
    for(let roomType in availability) {
      if(roomType == "total") continue
      returnObject[roomType] = {}
      for(let day in availability[roomType]) {
        const n = availability[roomType][day]
        returnObject[roomType][day] = shouldBeOpen(roomType, day, n)
      }
    }

    return returnObject
  }

  const getCloseOutArrayAndRender = () => {
    const closeOuts     = getCalculatedCloseOuts()
    const closeOutTable = formatCloseOutsToTableFormat(closeOuts)
    const table         = $render.makeTableFromArray(closeOutTable, ["date", "sgl", "dbl"])
    const container     = document.querySelector(".closeOuts")
    container.appendChild(table)
  }



	return {
		getDateURLrequestString: getDateURLrequestString,
		getGroupFormDataAsArray: getGroupFormDataAsArray,
		refreshData: refreshData,
		getRoomTypes: getRoomTypes,
		addOneDayToDateWithHyphens: addOneDayToDateWithHyphens,
		dateToString: dateToString,
		stringToDate: stringToDate,
		daysBetweenDatesStringFormat: daysBetweenDatesStringFormat,
		objectToArrayWithHeaders: objectToArrayWithHeaders,
    getCalculatedCloseOuts: getCalculatedCloseOuts,
    getCloseOutArrayAndRender: getCloseOutArrayAndRender
	}
})