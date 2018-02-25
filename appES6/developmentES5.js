
define(require => {

  const $render = require("render")
  const $eb     = require("eventBinder")
  const $req    = require("request")
  const $db     = require("database")
  const $make   = require("make")
  const $fb     = firebase.firestore()

  const test = () => {
    console.log("stuff")
    const settings = $db.get("settings")
    const string   = "rateParameter"

    const _rp = settings[string];
    const stuff = $render.renderFlatObjectFromDB(_rp, string)
    document.querySelector(".settingsWindow").appendChild(stuff)
    console.log(stuff)
  }

  const makeSettingsWindow = () => {
    const div = document.createElement("div")
    const button = document.createElement("button")
    const btnText = document.createTextNode("upload Settings")

    const draggyPlace = document.createElement("div")
    draggyPlace.classList.add("draggyPlace")

    div.classList.add("settingsWindow")
    div.style.backgroundColor = "black"
    div.appendChild(draggyPlace)
    div.appendChild(button)
    button.appendChild(btnText)    

    $make.clickable(button, $db.uploadSettings)

    const button2 = document.createElement("button")
    const btn2txt = document.createTextNode("Test Function")
    button2.appendChild(btn2txt)
    div.appendChild(button2)
    $make.clickable(button2, test)

    return div
  }

  const renderDevWindow = () => {
    const $render = require("render")
    console.log($render)
    const win = makeWindow()
    $make.draggable(win)
    document.querySelector("body").appendChild(win)
    win.appendChild($make.settingsList($db.get("settings"), $render.displaySettingsFor))
  }

  return {
    renderDevWindow: renderDevWindow,
    test: test,
  }
})