define(() => {

  const getDaySerialCode = () => {
    const now = new Date()
    const time = now.getTime()
    const days = time /86400000
    return Math.floor(days)
  }

  const createError = (message, error) => {
    let str = message
    if(error) str += (" | error: " + error)
    const errorbox = document.querySelector(".errorbox")
    errorbox.innerHTML = str
  }

  const $fb = firebase.firestore().collection("leifur")


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
      createError("Something went wrong here bro... ", error)
    }
  }

  const uploadRoomTypes = container => {
    console.log("Totally updating bro, jk")
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
    const storageJSON = storage
    set("availability", storageJSON)
    const ref = firebase.firestore().doc("leifur/availability")
    ref.set(storage)
  }

  const addSerialToList = documentName => {
    const serial = getDaySerialCode()
    const list   = $fb.doc("settings").get()
    list.then(doc => {
      const data = doc.data()
      let newArray = data["serialcodes"]
      let check = true;
      newArray.forEach(item => {
        if(item == serial) check = false
      })
      if(check) newArray.push(serial)
      $fb.doc("settings").set(data)
    })
  }

  const uploadSettings = data => {

    //data = get("settings")
    const daySerial = getDaySerialCode()
    const ref = $fb.doc("settings/" + daySerial + "/settings")
    ref.set(data)
    addSerialToList("settings")
  }


  const loadSettings = callback => {

    const a = $fb.doc("settings")
    const settings = $fb.doc("settings").get()
    settings.then(doc0 => {
      const list = doc0.data().serialcodes
      console.log(doc0.data())
      const id   = Math.max(...list)
      $fb.doc("settings/" + id + "/settings").get().then(doc1 => {
        console.log(doc1.data())
        set("settings", doc1.data())
        callback()
      })
    })
  }

  return {
    loadSettings: loadSettings,
    get: get,
    set: set,
    getAvailabilityForDate: getAvailabilityForDate,
    getDaySerialCode: getDaySerialCode,
    uploadSettings: uploadSettings,
    storeAvailability: storeAvailability,
    createError: createError,

  }
})
