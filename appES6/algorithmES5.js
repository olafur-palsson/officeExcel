
define((require) => {
  const $db = require("database")
  const $dh = require("dateHelper")
  let settings
  let rateParameters

  const weekendValue = date => {
      const weekendBonus = rateParameters.weekendWeight
      const day = date.getDay()
      if(day == 4) return weekendBonus * 0.5
      if(day == 6 || day == 5) 

        return weekendBonus
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
      if(key == dateString) 

        return superdays[key] * weight
    }
    return 0
  }


  const calculateDay = (dateAndAvailability) => {

    settings = $db.get("settings")
    rateParameters = settings.rateParameter
    const _rP = rateParameters

    const dateString     = dateAndAvailability[0]
    const availability   = parseInt(dateAndAvailability[1])
    const dateObject     = new Date(dateString)
    const now            = Date.now()

    const daysUntilDate  = 1 + Math.floor((dateObject - now)/1000/60/60/24);
    const expectedRooms  = Math.min(Math.pow(daysUntilDate/180, 0.7), 1) //
    const weekendBonus   = weekendValue(dateObject)
    const seasonalBonus  = seasonalValue(dateObject)
    const occupancy      = availability/47
    const occupancyBonus = (1-occupancy) * _rP.occupancyWeight //
    const futureBonus    = (1-expectedRooms)*_rP.futureWeight //
    const lastRoomsBonus = Math.pow(1-occupancy, 8)*_rP.occupancyWeight*1.5 //
    let sellOffRatio   = Math.min(Math.pow((187 - daysUntilDate)/180, 6.5), 1) //
    if(isNaN(sellOffRatio)) sellOffRatio = 0
    console.log("Selloff ration == " + sellOffRatio)
    const sellOffDisc    = sellOffRatio * _rP.sellOff //
    const superDayBonus  = superDayValue(dateObject) //

    //Self explanatory
    const rateShift   = occupancyBonus - futureBonus
    //Basic Rate
    let algorithmRate = _rP.priceFloor + rateShift + seasonalBonus
    //Add modifiers for weekends, newYears and other high demand days
    algorithmRate += weekendBonus + superDayBonus
    //Add edge cases in case of surplus or shortage
    algorithmRate += lastRoomsBonus - sellOffDisc
    //Lowest price a room should be sold at
    const absFloorPlus   = _rP.absoluteFloor + weekendBonus
    //Compare lowest rate vs algorithm
    const finalRate      = Math.max(absFloorPlus, algorithmRate)
    console.log(finalRate)
    return [dateString, finalRate, availability]
  }


  const getRates = (availabilityInput) => {

    let totalObj = {}
    for(let roomClass in availabilityInput) {
      for(let day in availabilityInput[roomClass]) {
        if(totalObj[day] == undefined) totalObj[day] = 0
        totalObj[day] += parseInt(availabilityInput[roomClass][day])
      }
    }

    settings = $db.get("settings")
    rateParameters = settings.rateParameter

    const priceFloor      = rateParameters.priceFloor
    const absPriceFloor   = rateParameters.absoluteFloor
    const seasonalWeight  = rateParameters.seasonalWeight
    const futureWeight    = rateParameters.futureWeight
    const superDayWeight  = rateParameters.superDayWeight
    const occupancyWeight = rateParameters.occupancyWeight
    const sellOffWeight   = rateParameters.sellOff

    let total = []
    let i = 0
    for(let day in totalObj) {
      total[i] = [day, totalObj[day]]
      i++
    }
    const ratesCalculated  = total.map(dateAndAvailability => {
      return calculateDay(dateAndAvailability)
    })

    return ratesCalculated
  }


  const calculateContractDay = (dateAndAvailability) => {
    const contract = $db.get("settings").retailContract
    const $dm      = require("dataManager")
    const date = dateAndAvailability[0]
    const availability = dateAndAvailability[1]

    let minimum = Infinity
    let applicableDate
    for(let key in contract) {
      const difference = $dh.daysBetweenDatesStringFormat(date, key)
      if(difference < minimum && difference > 0) {  
        minimum = difference
        applicableDate = key
      }
    }
    const applicableRate = contract[applicableDate]['dbl']

    return [date, applicableRate]
  }


  const calculateContractPrices = (bookings) => {
    console.log("contracts")
    return calculateBooking(bookings, calculateContractDay)
  }


  const calculateAlgorithmPrices = (bookings) => {
    console.log("algorithm")
    return calculateBooking(bookings, calculateDay)
  }


  const calculateBooking = (bookings, calculator) => {

    const $dm = require("dataManager")
    let prices = []

    bookings.forEach((booking, index) => {
      const $dm = require("dataManager")
      let sum = 0
      let date = booking[0]
      const nights = booking[1]
      const bookingInfo = {}

      for(let i = 0; i < booking[1]; i++) {
        console.log(date)
        const availability = $db.getAvailabilityForDate("total", date)
        if(availability == undefined) {
          $db.createError("Most likely wrong date in the booking. Please check.")
        }
        console.log(availability)
        const rate = calculator([date, availability])[1]
        console.log(rate)
        date = $dh.addOneDayToDateWithHyphens(date)
        sum += rate
      }

      bookingInfo["rate"] = sum / nights
      bookingInfo["total"] = sum
      bookingInfo["name"] = "Booking " + (index + 1)

      prices.push(bookingInfo)
    })

    return prices
  }


  const calculateGroupPrice = (bookings) => {

    const algorithmBookings = calculateAlgorithmPrices(bookings)
    const contractBookings  = calculateContractPrices(bookings)

    let finalGroupPrices = algorithmBookings
    contractBookings.forEach((booking, index) => {
      if(booking["rate"] > algorithmBookings[index]["rate"])
        finalGroupPrices[index] = booking
    })
    return finalGroupPrices
  }



  return {
    getRates: getRates,
    calculateGroupPrice: calculateGroupPrice,
    calculateContractPrices: calculateContractPrices,
    calculateAlgorithmPrices: calculateAlgorithmPrices,
    calculateDay: calculateDay,
    calculateContractDay: calculateContractDay
  }
})