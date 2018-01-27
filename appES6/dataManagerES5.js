
define(require => {
  const $make = require("make")
	const DAY_IN_MS = 86400000
	const $req  = require("request")
  const $dh   = require("dateHelper")
	const $xmlh = require("xmlHelper")
	const $db   = require("database")
  const $alg  = require("algorithm")

  const get = key => $db.get(key)

  const set = (key, data) => {
    $db.set(key, data)
  }

  const uploadSettings = settings => {
    $db.uploadSettings(settings)
  }

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
		$db.set("requestString", string)
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


  const getAvailabilityPromise = () => {
    return $xmlh.getAndStoreXML($db.get("requestString"))
  }

  const xmlToTable = doc => {
    return $xmlh.xmlToTable(doc)
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

  const getRoomTypes = () => {
    const settings = get("settings")
    const roomTypeList = settings.roomTypes
    let array = []
    for(let key in roomTypeList) {
      array.push(key)
    }

    return array
  }

  const getPricesFromForm = groupForm => {
    const data = getGroupFormDataAsArray(groupForm)
    return $alg.calculateGroupPrice(data)
  }


  const getCalculatedCloseOuts = () => {

    const availability = $db.get("availability")
    console.log(availability)
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

  const loadSettingsFromDatabase = (callback) => {
    return $db.loadSettings(callback)
  }


	return {
    get: get,
    set: set,
    getRoomTypes: getRoomTypes,
		getDateURLrequestString: getDateURLrequestString,
		getGroupFormDataAsArray: getGroupFormDataAsArray,
		objectToArrayWithHeaders: objectToArrayWithHeaders,
    getCalculatedCloseOuts: getCalculatedCloseOuts,
    getAvailabilityPromise: getAvailabilityPromise,
    loadSettingsFromDatabase: loadSettingsFromDatabase,
    xmlToTable: xmlToTable,
    availabilityToTableFormat: availabilityToTableFormat,
    formatCloseOutsToTableFormat: formatCloseOutsToTableFormat,
    getPricesFromForm: getPricesFromForm,


	}
})