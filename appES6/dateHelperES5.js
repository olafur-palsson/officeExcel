//to make a sentence with helper 

define((require) => {
	const DAY_IN_MS = 86400000

	return {
		getDateURLrequestString: (callback) => {
			const finalPromise = new Promise((finalResolve, finalReject) => {
				let settings
				const request  = require("request")
				let settingsPromise = new Promise((resolve, reject) => {
					let promise = request.fromURL("rateSettings.json", "JSON")
					promise.then(settings => {
						resolve(settings.requestAvailability)
					})
				})

				settingsPromise.then(settings => {
					console.log(settings)
					let string     = settings["URL"]
					const n        = settings["days"]
					const today    = new Date()
					let nDaysInAdvance = new Date()

					nDaysInAdvance.setDate(nDaysInAdvance.getDate() + n)
					string += "arrivalDate="   + today.getUTCFullYear() + "-" + (today.getUTCMonth() + 1) + "-" + today.getUTCDate()
		  			string += "&"
		  			string += "departureDate=" + nDaysInAdvance.getUTCFullYear() + "-" + (nDaysInAdvance.getUTCMonth() + 1) + "-" + nDaysInAdvance.getUTCDate()
		  			finalResolve(string)
				})
			})

			return finalPromise
		},

		b: 1


	}
})