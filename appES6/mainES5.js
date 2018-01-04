
requirejs(["request", "dataHelper", "xmlHelper", "algorithm", "render", "eventBinder"], 
          ( $req,     $dh,          $xmlh,       $alg,        $render,  $eb) => {

  $dh.refreshData()
  const refreshButton = document.querySelector(".refreshData")
  $eb.bindClickEvent(refreshButton, $eb.refreshData)
  $eb.bindPreformButton()

})