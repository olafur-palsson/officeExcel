define(() => {
  let settings
  let rateParameters

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
      if(key == dateString) return superdays[key] * weight
    }

    return 0
  }

  const getRates = (availabilityInput, settingsInput) => {
    let totalObj = {}
    for(let roomClass in availabilityInput) {
      for(let day in availabilityInput[roomClass]) {
        if(totalObj[day] == undefined) totalObj[day] = 0
        totalObj[day] += parseInt(availabilityInput[roomClass][day])
      }
    }

    settings = settingsInput
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

    console.log(total)

    const ratesCalculated  = total.map((dateAndAvailability) => {
      const dateString     = dateAndAvailability[0]
      const availability   = parseInt(dateAndAvailability[1])
      const dateObject     = new Date(dateString)
      const now            = Date.now()
      const daysUntilDate  = 1 + Math.floor((dateObject - now)/1000/60/60/24);
      const month          = dateObject.getMonth()
      const weekendBonus   = weekendValue(dateObject)

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

      return [dateString, finalRate, availability]
    })

    return ratesCalculated
  }

  return {getRates: getRates}
})