/*


                    ARCHAIC FUNCTIONS



define(require => {
  const $make = require("make")
  const $db   = require("database")

  const bindClickEvent = (element, eventFunction) => {
    element.addEventListener("click", (event) => {
      event.preventDefault()
      eventFunction()
    })
  }


  const bindPreformButton = () => {
    const settings = $db.get("settings")
    const button = document.querySelector(".groupCalc__preFormButton")
    const $render = require("render")
    bindClickEvent(button, () => {
      $render.renderGroupForm(settings)
    })
  }

 
  const groupFormEvent = (button, groupForm) => {

    const $alg = require("algorithm")
    const $dm  = require("dataManager")
    const $render = require("render")
    bindClickEvent(button, () => {
      const data = $dm.getGroupFormDataAsArray(groupForm)
      const groupPrices = $alg.calculateGroupPrice(data)
      $render.renderGroupPrices(groupPrices)
    })
  }

  const tokenFunction = () => {
  }
 
  const refreshData = () => {

    const $dm = require("dataManager")
    const $render = require("render")
    const rateContainer = document.querySelector(".channelAvailability")
    const channelContainer = document.querySelector(".rates")
    $make.childless(rateContainer)
    $make.childless(channelContainer)
    $dm.refreshData(tokenFunction)
  }

  return {
    bindClickEvent: bindClickEvent,
    bindPreformButton: bindPreformButton,
    groupFormEvent: groupFormEvent, 
    refreshData: refreshData,
  }
})*/
"use strict";

//# sourceMappingURL=eventBinder.js.map