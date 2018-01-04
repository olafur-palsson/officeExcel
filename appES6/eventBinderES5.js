define(require => {

  const bindClickEvent = (element, eventFunction) => {
    element.addEventListener("click", (event) => {
      event.preventDefault()
      eventFunction()
    })
  }

  const bindPreformButton = () => {
    console.log("htueta")
    const $dh = require("dataHelper")
    const settings = $dh.getSettings()
    const button = document.querySelector(".groupCalc__preFormButton")
    const $render = require("render")
    bindClickEvent(button, () => {
      $render.renderGroupForm(settings)
    })
  }

  const groupFormEvent = (button, groupForm) => {
    const $dh = require("dataHelper")
    bindClickEvent(button, () => {
      console.log($dh)
      const data = $dh.getGroupFormDataAsArray(groupForm)
      console.log(data)
    })
  }

  const tokenFunction = () => {
    console.log("hahaha")
  }
 
  const refreshData = () => {
    const $dh = require("dataHelper")
    const $render = require("render")
    const rateContainer = document.querySelector(".channelAvailability")
    const channelContainer = document.querySelector(".rates")
    $render.removeChildren(rateContainer)
    $render.removeChildren(channelContainer)
    $dh.refreshData(tokenFunction)
  }


  return {
    bindClickEvent: bindClickEvent,
    bindPreformButton: bindPreformButton,
    groupFormEvent: groupFormEvent, 
    refreshData: refreshData,
  }
})