//to make a sentence with helper 

define(require => {
	const DAY_IN_MS = 86400000
	const $req  = require("request")
	const $xmlh = require("xmlHelper")

	const getDateURLrequestString = (settings) => {
		const URLSettings = settings.requestAvailability
		let string     = URLSettings["URL"]
		const n        = URLSettings["days"]
		const today    = new Date()
		let nDaysInAdvance = new Date()

		nDaysInAdvance.setDate(nDaysInAdvance.getDate() + n)
		string += "arrivalDate="   + today.getUTCFullYear() + "-" + (today.getUTCMonth() + 1) + "-" + today.getUTCDate()
		string += "&"
		string += "departureDate=" + nDaysInAdvance.getUTCFullYear() + "-" + (nDaysInAdvance.getUTCMonth() + 1) + "-" + nDaysInAdvance.getUTCDate()
		console.log(string)
		return string
	}

	const getSettings = () => {
		const string = window.localStorage.getItem("settings")
		return JSON.parse(string)
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

	const refreshData = (callback) => {
		const settingsPromise = $req.fromURL("rateSettings.json", "JSON")
		settingsPromise.then(settings => {
			const settingsData = JSON.stringify(settings)
			window.localStorage.setItem("settings", settingsData)
			const requestString = getDateURLrequestString(settings)
			console.log(requestString)
			$xmlh.getAndStoreXML(requestString, callback)
		})
	}

	return {
		getDateURLrequestString: getDateURLrequestString,
		getGroupFormDataAsArray: getGroupFormDataAsArray,
		refreshData: refreshData,
		getRoomTypes: getRoomTypes,
		getSettings: getSettings,
		
	}
})