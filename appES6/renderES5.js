define(() => {
  const makeTableFromArray = (array, theaders) => {
    const table = document.createElement("table")
    if(theaders != undefined) {
      const headerRow = document.createElement("tr")
      theaders.forEach((text) => {
        const textNode = document.createTextNode(text)
        const td       = document.createElement("td")
        td       .appendChild(textNode)
        headerRow.appendChild(td)
        table.appendChild(headerRow)
      })
    }

    if(array[0][0] == undefined) alert("Some function gave me not a table")
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


  const getAvailabilityTable = (availabilities) => {
    const array = availabilityToTableFormat(availabilities)
    console.log(array)
    return makeTableFromArray(array)
  }


  return {
    makeTableFromArray: makeTableFromArray,
    availabilityToTableFormat: availabilityToTableFormat,
    getAvailabilityTable: getAvailabilityTable,
  }
})