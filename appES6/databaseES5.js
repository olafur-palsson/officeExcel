define(require => {

  const getDaySerialCode = () => {
    const now = new Date()
    const time = now.getTime()
    const days = time /86400000
    return Math.floor(days)
  }

  const $fb = firebase.firestore().collection("leifur")

  const updateSettingsFromLocal = () => {
    const $req = require("request")
    $req.fromURL("rateSettings.json", "JSON").then(data => {
      $fb.doc("settings").set(data)
    })    
  }


  const get = key => {
    return JSON.parse(window.localStorage.getItem(key))
  }


  const set = (key, data) => {
    window.localStorage.setItem(key, JSON.stringify(data))
  }


  const getAvailabilityForDate = (name, date) => {
    const availability = get("availability")
    try {
      return availability[name][date]
    } catch(error) {
      require("render").makeError("You probably put in the wrong date when you asked for ", error)
    }
  }


  const storeAvailability = (availability) => {

    const roomTypes = require("dataManager").getRoomTypes()
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
    const serialCode = getDaySerialCode()
    window.localStorage.setItem("availability", storageJSON)
    const ref = firebase.firestore().doc("leifur/availability" + serialCode)
    ref.set(storage)
  }


  const loadSettings = callback => {
    const settings = $fb.doc("settings").get()
    settings.then(doc => {
      set("settings", doc.data())
      callback()
    })
  }


  return {
    loadSettings: loadSettings,
    get: get,
    set: set,
    storeAvailability: storeAvailability,
    getAvailabilityForDate: getAvailabilityForDate,
    updateSettingsFromLocal: updateSettingsFromLocal

  }
})