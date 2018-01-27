
requirejs(["request", "dataManager", "xmlHelper", "algorithm", "build", "eventBinder", "database", "make", "procedures", "dateHelper", "development"], 
          ( $req,     $dm,           $xmlh,       $alg,        $build,  $eb,           $db,        $make,  $prcd,        $dh,          $dev         ) => {


  $dev.renderDevWindow()


  const settingsWindow = $make.settingsWindow()
  $make.draggable(settingsWindow)
  document.querySelector("body").appendChild(settingsWindow)

  $prcd.refreshData()
  $prcd.initializeGroupForm()
  
  const refreshButton = document.querySelector(".refreshData")
  $make.clickable(refreshButton, $prcd.refreshData)
})

// very nice