
requirejs(["request", "dataManager", "xmlHelper", "algorithm", "render", "eventBinder", "database"], 
          ( $req,     $dm,          $xmlh,       $alg,        $render,  $eb,           $db       ) => {

  $db.updateSettingsFromLocal()

  const callback = () => {
    $dm.refreshData()
    $dm.getCloseOutArrayAndRender()
  }
  $db.loadSettings(callback)
  
  const refreshButton = document.querySelector(".refreshData")
  $eb.bindClickEvent(refreshButton, $eb.refreshData)
  $eb.bindPreformButton()
})

// very nice