
requirejs(["request", "dataManager", "xmlHelper", "algorithm", "build", "database", "make", "procedures", "dateHelper", "development"], 
          ( $req,     $dm,           $xmlh,       $alg,        $build,  $db,        $make,  $prcd,        $dh,          $dev         ) => {


  $dev.renderDevWindow()


  const settingsWindow = $make.settingsWindow()
  $make.draggable(settingsWindow)
  document.querySelector("body").appendChild(settingsWindow)

  $prcd.refreshData()
  $prcd.initializeGroupForm()
  $prcd.bindRefreshDataButton()
  
})

// very nice