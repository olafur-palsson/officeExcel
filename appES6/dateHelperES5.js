define(() => {

  
  const stringToDate = dateString => {

    const array = dateString.split("-")
    const y = array[0]
    const m = parseInt(array[1]) + 1
    const d = array[2]
    const date = new Date(y, m, d)

    return date
  }

  const formatNumber = (number) => {
    let string = "" + number
    if(number < 10) string = "0" + string;
    return string
  }


  const dateToString = dateObject => {
    const y = dateObject.getUTCFullYear()
    const m = formatNumber(dateObject.getUTCMonth() -1)
    const d = formatNumber(dateObject.getUTCDate()) 
    const dateArray = [y, m, d]
    return dateArray.join("-")
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

  return {
    stringToDate: stringToDate,
    dateToString: dateToString,
    daysBetweenDatesStringFormat: daysBetweenDatesStringFormat,
    addOneDayToDateWithHyphens: addOneDayToDateWithHyphens,

  }
})